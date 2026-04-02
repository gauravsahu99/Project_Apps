import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getShopkeeperByPhone, saveShopkeeper, getShopkeeperById, getShopByOwnerPhone } from '../constants/dataStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [shopkeeper, setShopkeeper] = useState(null);
  const [shop, setShop] = useState(null);
  const [initializing, setInitializing] = useState(true); // first-load only
  const [isLoading, setIsLoading] = useState(false);       // OTP spinner only

  useEffect(() => { loadAuth(); }, []);

  const loadAuth = async () => {
    try {
      const raw = await AsyncStorage.getItem('sk_auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        const fresh = getShopkeeperById(parsed.id) || parsed;
        const freshShop = getShopByOwnerPhone(fresh.phone);
        setShopkeeper(fresh);
        setShop(freshShop || null);
      }
    } catch {}
    setInitializing(false); // ← only this gates the navigator
  };

  const sendOTP = async (phone) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setIsLoading(false);
    return { success: true };
  };

  const verifyOTP = async (phone, otp) => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 700));
      const cleanPhone = phone.replace(/\D/g, '');

      if (otp.length >= 4) {
        let sk = getShopkeeperByPhone(cleanPhone);
        if (!sk) {
          sk = saveShopkeeper({ phone: cleanPhone, name: 'Shopkeeper', status: 'pending' });
        }
        if (!sk) {
          sk = {
            id: 'sk_' + cleanPhone, phone: cleanPhone,
            name: 'Shopkeeper', avatar: 'S', status: 'pending',
          };
        }
        const shopData = getShopByOwnerPhone(cleanPhone);
        setShopkeeper(sk);
        setShop(shopData || null);
        await AsyncStorage.setItem('sk_auth', JSON.stringify(sk));
        setIsLoading(false);
        return { success: true, shopkeeper: sk, shop: shopData };
      }
      setIsLoading(false);
      return { success: false, message: 'Enter any 4-6 digit OTP' };
    } catch (e) {
      setIsLoading(false);
      return { success: false, message: 'Error: ' + e.message };
    }
  };

  const refreshShop = () => {
    if (!shopkeeper) return;
    try {
      const freshShop = getShopByOwnerPhone(shopkeeper.phone);
      setShop(freshShop || null);
    } catch {}
  };

  const updateShopkeeper = async (data) => {
    if (!shopkeeper) return;
    try {
      const updated = saveShopkeeper({ ...shopkeeper, ...data }) || { ...shopkeeper, ...data };
      setShopkeeper(updated);
      await AsyncStorage.setItem('sk_auth', JSON.stringify(updated));
    } catch {}
  };

  const logout = async () => {
    setShopkeeper(null);
    setShop(null);
    await AsyncStorage.removeItem('sk_auth');
  };

  return (
    <AuthContext.Provider value={{ shopkeeper, shop, initializing, isLoading, sendOTP, verifyOTP, logout, refreshShop, updateShopkeeper }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

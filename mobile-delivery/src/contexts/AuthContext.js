import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeliveryPartnerByPhone, saveDeliveryPartner, getDeliveryPartnerById, setDeliveryPartnerOnline } from '../constants/dataStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [initializing, setInitializing] = useState(true); // only for first load
  const [isLoading, setIsLoading] = useState(false);      // for OTP button spinner

  useEffect(() => { loadAuth(); }, []);

  const loadAuth = async () => {
    try {
      const raw = await AsyncStorage.getItem('dp_auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        const fresh = getDeliveryPartnerById(parsed.id) || parsed;
        setPartner(fresh);
      }
    } catch {}
    setInitializing(false); // ← only this controls the splash/navigator gate
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
        let dp = getDeliveryPartnerByPhone(cleanPhone);
        if (!dp) {
          dp = saveDeliveryPartner({ phone: cleanPhone, name: 'Delivery Partner', city: 'Betul' });
        }
        // Hard fallback — always guarantees a valid object
        if (!dp) {
          dp = {
            id: 'dp_' + cleanPhone, phone: cleanPhone, name: 'Delivery Partner',
            avatar: 'D', isOnline: false, isAvailable: true, activeOrders: 0,
            totalDeliveries: 0, todayDeliveries: 0, todayEarnings: 0,
            totalEarnings: 0, rating: 5.0, city: 'Betul', status: 'active',
          };
        }
        if (dp.status === 'suspended') {
          setIsLoading(false);
          return { success: false, message: 'Account suspended. Contact admin.' };
        }
        setPartner(dp);
        await AsyncStorage.setItem('dp_auth', JSON.stringify(dp));
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, message: 'Enter any 4-6 digit OTP' };
    } catch (e) {
      setIsLoading(false);
      return { success: false, message: 'Error: ' + e.message };
    }
  };

  const toggleOnline = (isOnline) => {
    if (!partner) return;
    try { setDeliveryPartnerOnline(partner.id, isOnline); } catch {}
    const updated = { ...partner, isOnline, isAvailable: isOnline };
    setPartner(updated);
    AsyncStorage.setItem('dp_auth', JSON.stringify(updated)).catch(() => {});
  };

  const refreshPartner = () => {
    if (!partner) return;
    try {
      const fresh = getDeliveryPartnerById(partner.id);
      if (fresh) { setPartner(fresh); AsyncStorage.setItem('dp_auth', JSON.stringify(fresh)).catch(() => {}); }
    } catch {}
  };

  const logout = async () => {
    try { if (partner) setDeliveryPartnerOnline(partner.id, false); } catch {}
    setPartner(null);
    await AsyncStorage.removeItem('dp_auth');
  };

  return (
    <AuthContext.Provider value={{ partner, initializing, isLoading, sendOTP, verifyOTP, logout, toggleOnline, refreshPartner }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

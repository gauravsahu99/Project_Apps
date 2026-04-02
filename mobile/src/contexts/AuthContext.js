import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserByPhone, saveUser, getUserById,
  getOrders, addNotification
} from '../constants/dataStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const sendOTP = async (phone) => {
    setIsLoading(true);
    // Check if blocked
    const existing = getUserByPhone(phone.replace(/\s/g, ''));
    if (existing && existing.status === 'blocked') {
      setIsLoading(false);
      return { success: false, message: 'Your account has been suspended. Contact support.' };
    }
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    return { success: true, message: 'OTP sent successfully' };
  };

  const verifyOTP = async (phone, otp) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const cleanPhone = phone.replace(/\s/g, '');
    if (otp === '123456' || otp.length === 6) {
      // Check existing user
      let existing = getUserByPhone(cleanPhone);
      if (existing && existing.status === 'blocked') {
        setIsLoading(false);
        return { success: false, message: 'Your account has been suspended.' };
      }
      let userData;
      if (existing) {
        userData = existing;
      } else {
        userData = saveUser({
          id: 'u_' + Date.now().toString(36),
          phone: cleanPhone,
          name: 'Betul User',
          email: '',
          city: 'Betul',
          role: 'user',
          status: 'active',
          avatar: 'B',
          orders: 0,
        });
        addNotification({
          type: 'user', icon: '👤',
          title: 'New User Registered',
          body: `Phone: ${cleanPhone}`,
          forAdmin: true,
        });
      }
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      // Load addresses
      const stored = await AsyncStorage.getItem('addresses_' + userData.id);
      if (stored) setSavedAddresses(JSON.parse(stored));
      setIsLoading(false);
      return { success: true, user: userData };
    }
    setIsLoading(false);
    return { success: false, message: 'Invalid OTP. Try 123456 for demo.' };
  };

  const updateProfile = async (data) => {
    if (!user) return;
    const updated = saveUser({ ...user, ...data });
    setUser(updated);
    await AsyncStorage.setItem('user', JSON.stringify(updated));
  };

  const logout = async () => {
    setUser(null);
    setSavedAddresses([]);
    await AsyncStorage.removeItem('user');
  };

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Re-fetch from dataStore to get latest status
        const fresh = getUserById(parsed.id) || parsed;
        if (fresh.status === 'blocked') { await logout(); return; }
        setUser(fresh);
        const addrs = await AsyncStorage.getItem('addresses_' + fresh.id);
        if (addrs) setSavedAddresses(JSON.parse(addrs));
      }
    } catch (e) {}
  };

  const saveAddress = async (address) => {
    if (!user) return;
    const addrs = [...savedAddresses.filter(a => a.id !== address.id), address];
    setSavedAddresses(addrs);
    await AsyncStorage.setItem('addresses_' + user.id, JSON.stringify(addrs));
  };

  const removeAddress = async (id) => {
    const addrs = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(addrs);
    if (user) await AsyncStorage.setItem('addresses_' + user.id, JSON.stringify(addrs));
  };

  const getUserOrders = () => {
    if (!user) return [];
    return getOrders({ userId: user.id });
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, savedAddresses,
      sendOTP, verifyOTP, logout, loadUser,
      updateProfile, saveAddress, removeAddress, getUserOrders,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

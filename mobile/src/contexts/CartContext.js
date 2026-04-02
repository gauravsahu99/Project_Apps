import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveOrder, validatePromo } from '../constants/dataStore';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Persist cart
  useEffect(() => {
    AsyncStorage.getItem('cart').then(raw => {
      if (raw) setCart(JSON.parse(raw));
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem('cart', JSON.stringify(cart));
  }, [cart, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.id !== productId));

  const updateQuantity = (productId, quantity) => {
    if (quantity === 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCart([]);
    AsyncStorage.removeItem('cart');
  };

  const placeOrder = (orderData) => {
    const order = saveOrder(orderData);
    clearCart();
    return order;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isInCart = (productId) => cart.some(i => i.id === productId);
  const getItemQty = (productId) => cart.find(i => i.id === productId)?.quantity || 0;

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      clearCart, placeOrder, cartTotal, cartCount, isInCart, getItemQty,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

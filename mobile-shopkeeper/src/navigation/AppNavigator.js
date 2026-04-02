import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterShopScreen from '../screens/RegisterShopScreen';
import ComplaintScreen from '../screens/ComplaintScreen';
import PendingApprovalScreen from '../screens/PendingApprovalScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OrderInboxScreen from '../screens/OrderInboxScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import ProductsScreen from '../screens/ProductsScreen';
import AddProductScreen from '../screens/AddProductScreen';
import EarningsScreen from '../screens/EarningsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LiveOrderBoardScreen from '../screens/LiveOrderBoardScreen';
import ShopkeeperAnalyticsScreen from '../screens/ShopkeeperAnalyticsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import PromotionsScreen from '../screens/PromotionsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Dashboard', emoji: '🏠', label: 'Home', color: '#FF6B35' },
  { name: 'Orders', emoji: '📦', label: 'Orders', color: '#E91E63' },
  { name: 'Products', emoji: '🛒', label: 'Products', color: '#1976D2' },
  { name: 'Earnings', emoji: '💰', label: 'Earnings', color: '#43A047' },
  { name: 'Profile', emoji: '👤', label: 'Profile', color: '#7B1FA2' },
];

const TAB_SCREENS = {
  Dashboard: DashboardScreen,
  Orders: OrderInboxScreen,
  Products: ProductsScreen,
  Earnings: EarningsScreen,
  Profile: ProfileScreen,
};

function TabIcon({ emoji, label, focused, color }) {
  return (
    <View style={[styles.wrapper, focused && styles.wrapperFocused]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, { color: focused ? color : '#9CA3AF' }]}>{label}</Text>
      {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingTop: 6, paddingHorizontal: 4, minWidth: 56 },
  wrapperFocused: {},
  emoji: { fontSize: 20 },
  label: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: Platform.OS === 'ios' ? 80 : 68,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          elevation: 20,
        },
        tabBarShowLabel: false,
      }}
    >
      {TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={TAB_SCREENS[tab.name]}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji={tab.emoji} label={tab.label} focused={focused} color={tab.color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

// ── Root navigator — uses conditional screens (React Navigation auth flow pattern) ──
export default function AppNavigator() {
  const { shopkeeper, shop, initializing } = useAuth();

  if (initializing) {
    return <SplashScreen />;
  }

  // Determine which set of screens to show based on auth state
  const isLoggedIn = !!shopkeeper;
  const hasShop = !!shop;
  const shopApproved = shop?.status === 'approved';

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFF' },
          animationEnabled: true,
        }}
      >
        {!isLoggedIn ? (
          // ── NOT LOGGED IN ──
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !hasShop ? (
          // ── LOGGED IN BUT NO SHOP ──
          <Stack.Screen name="RegisterShop" component={RegisterShopScreen} />
        ) : !shopApproved ? (
          // ── SHOP REGISTERED BUT PENDING ──
          <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        ) : (
          // ── FULLY APPROVED — show main app ──
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{
                headerShown: true,
                headerTitle: '📦 Order Details',
                headerTintColor: '#FF6B35',
                headerStyle: { backgroundColor: '#FFF' },
              }}
            />
            <Stack.Screen
              name="AddProduct"
              component={AddProductScreen}
              options={{
                headerShown: true,
                headerTitle: '➕ Add Product',
                headerTintColor: '#1976D2',
                headerStyle: { backgroundColor: '#FFF' },
              }}
            />
            <Stack.Screen name="LiveOrderBoard" component={LiveOrderBoardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ShopAnalytics" component={ShopkeeperAnalyticsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Inventory" component={InventoryScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Promotions" component={PromotionsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Complaint" component={ComplaintScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

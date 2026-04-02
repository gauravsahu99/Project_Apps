import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ActiveDeliveryScreen from '../screens/ActiveDeliveryScreen';
import EarningsScreen from '../screens/EarningsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AvailabilityScreen from '../screens/AvailabilityScreen';
import EarningsDetailScreen from '../screens/EarningsDetailScreen';
import ComplaintScreen from '../screens/ComplaintScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { partner, initializing } = useAuth();

  // Show splash only during initial AsyncStorage session check
  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFF' },
          animationEnabled: true,
        }}
      >
        {!partner ? (
          // ── NOT LOGGED IN ──
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // ── LOGGED IN ──
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="ActiveDelivery"
              component={ActiveDeliveryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Earnings"
              component={EarningsScreen}
              options={{
                headerShown: true,
                headerTitle: '💰 Earnings',
                headerTintColor: '#FF6B35',
                headerStyle: { backgroundColor: '#FFF' },
              }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{
                headerShown: true,
                headerTitle: '📋 Delivery History',
                headerTintColor: '#1976D2',
                headerStyle: { backgroundColor: '#FFF' },
              }}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Availability" component={AvailabilityScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EarningsDetail" component={EarningsDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Complaint" component={ComplaintScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

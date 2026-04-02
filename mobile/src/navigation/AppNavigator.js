import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform } from 'react-native';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CityInfoScreen from '../screens/CityInfoScreen';
import AdsScreen from '../screens/AdsScreen';
import AdDetailScreen from '../screens/AdDetailScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import PostItemScreen from '../screens/PostItemScreen';
import EssentialsScreen from '../screens/EssentialsScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import FamousPlacesScreen from '../screens/FamousPlacesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SearchScreen from '../screens/SearchScreen';
import FashionScreen from '../screens/FashionScreen';
import OrdersScreen from '../screens/OrdersScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import LoyaltyScreen from '../screens/LoyaltyScreen';
import ChatScreen from '../screens/ChatScreen';
import WishlistScreen from '../screens/WishlistScreen';
import ReviewScreen from '../screens/ReviewScreen';
import ComplaintScreen from '../screens/ComplaintScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TABS = [
    { name: 'Home',        emoji: '🏠', label: 'होम',      color: '#FF6B35' },
    { name: 'Fashion',     emoji: '👗', label: 'Fashion',   color: '#EC4899' },
    { name: 'Marketplace', emoji: '🛍️', label: 'बाज़ार',    color: '#9C27B0' },
    { name: 'Essentials',  emoji: '🌅', label: 'Delivery',  color: '#4CAF50' },
    { name: 'Ads',         emoji: '🏪', label: 'Shops',     color: '#FF6B35' },
];

function TabIcon({ emoji, label, focused, color }) {
    return (
        <View style={[tabStyles.wrapper, focused && tabStyles.wrapperFocused]}>
            <View style={focused && { transform: [{ scale: 1.12 }] }}>
                <Text style={tabStyles.emoji}>{emoji}</Text>
            </View>
            <Text style={[tabStyles.label, { color: focused ? color : '#9CA3AF' }]}>{label}</Text>
            {focused && <View style={[tabStyles.dot, { backgroundColor: color }]} />}
        </View>
    );
}

const tabStyles = StyleSheet.create({
    wrapper: {
        alignItems: 'center', paddingTop: 6, paddingBottom: 2,
        paddingHorizontal: 4, minWidth: 60,
    },
    wrapperFocused: {},
    emoji: { fontSize: 22 },
    label: { fontSize: 9, fontWeight: '700', marginTop: 2, letterSpacing: 0.3 },
    dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
});

const TAB_COMPONENTS = {
    Home: HomeScreen, Fashion: FashionScreen,
    Marketplace: MarketplaceScreen, Essentials: EssentialsScreen, Ads: AdsScreen
};

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1, borderTopColor: '#F3F4F6',
                    height: Platform.OS === 'ios' ? 80 : 68,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
                    elevation: 20, shadowColor: '#1A1A2E',
                    shadowOffset: { width: 0, height: -6 },
                    shadowOpacity: 0.08, shadowRadius: 16,
                },
                tabBarShowLabel: false,
            }}
        >
            {TABS.map(tab => (
                <Tab.Screen
                    key={tab.name}
                    name={tab.name}
                    component={TAB_COMPONENTS[tab.name]}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon emoji={tab.emoji} label={tab.label} focused={focused} color={tab.color} />
                        )
                    }}
                />
            ))}
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#FFFFFF' } }}
            >
                <Stack.Screen name="Splash"         component={SplashScreen} />
                <Stack.Screen name="Onboarding"     component={OnboardingScreen} />
                <Stack.Screen name="Login"          component={LoginScreen} />
                <Stack.Screen name="Main"           component={MainTabs} />

                {/* Stack screens with proper back labels */}
                <Stack.Screen
                    name="AdDetail"
                    component={AdDetailScreen}
                    options={{ headerShown: true, headerTitle: 'Shop Details', headerBackTitle: '← Shops', headerTintColor: '#FF6B35' }}
                />
                <Stack.Screen
                    name="PostItem"
                    component={PostItemScreen}
                    options={{ headerShown: true, headerTitle: 'Post Item', headerBackTitle: '← Marketplace', headerTintColor: '#7B1FA2' }}
                />
                <Stack.Screen
                    name="Cart"
                    component={CartScreen}
                    options={{ headerShown: true, headerTitle: '🛒 My Cart', headerBackTitle: '← Back', headerTintColor: '#FF6B35' }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Emergency"
                    component={EmergencyScreen}
                    options={{ headerShown: true, headerTitle: '🆘 Emergency', headerBackTitle: '← होम', headerTintColor: '#EF4444' }}
                />
                <Stack.Screen
                    name="FamousPlaces"
                    component={FamousPlacesScreen}
                    options={{ headerShown: true, headerTitle: '🗺️ Famous Places', headerBackTitle: '← होम', headerTintColor: '#FF9800' }}
                />
                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{ headerShown: true, headerTitle: '🔔 Notifications', headerBackTitle: '← होम', headerTintColor: '#1976D2' }}
                />
                <Stack.Screen
                    name="Search"
                    component={SearchScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="CityInfo"
                    component={CityInfoScreen}
                    options={{ headerShown: true, headerTitle: '🏙️ City Info', headerBackTitle: '← होम', headerTintColor: '#1976D2' }}
                />
                <Stack.Screen
                    name="Orders"
                    component={OrdersScreen}
                    options={{ headerShown: true, headerTitle: '📦 My Orders', headerBackTitle: '← Profile', headerTintColor: '#4CAF50' }}
                />
                <Stack.Screen
                    name="LiveTracking"
                    component={LiveTrackingScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Loyalty"
                    component={LoyaltyScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Wishlist"
                    component={WishlistScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Review"
                    component={ReviewScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Complaint"
                    component={ComplaintScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

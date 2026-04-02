import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Animated, StatusBar, Dimensions, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const STATUSES = [
    { id: 1, label: 'Order Confirmed', labelHi: 'ऑर्डर कन्फर्म', icon: '✅', done: true },
    { id: 2, label: 'Preparing', labelHi: 'तैयार हो रहा है', icon: '👨‍🍳', done: true },
    { id: 3, label: 'Out for Delivery', labelHi: 'डिलीवरी पर निकला', icon: '🚴', done: true },
    { id: 4, label: 'Arriving Soon', labelHi: 'पहुँचने वाला है', icon: '📍', done: false },
    { id: 5, label: 'Delivered', labelHi: 'डिलीवर हो गया', icon: '🎉', done: false },
];

const MOCK_ORDER = {
    id: 'ORD-2847',
    shopName: 'Sharma Kirana Store',
    shopEmoji: '🏪',
    items: ['दूध 1L', 'ब्रेड', 'अंडे 6 pcs'],
    total: 185,
    driver: { name: 'Rohit Kumar', rating: 4.8, trips: 1247, phone: '9876543210' },
    eta: 8,
    distance: '1.2 km',
};

export default function LiveTrackingScreen({ navigation, route }) {
    const order = route?.params?.order || MOCK_ORDER;
    const [eta, setEta] = useState(order.eta);
    const [currentStep, setCurrentStep] = useState(2);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const bikeAnim = useRef(new Animated.Value(0)).current;
    const mapDotScale = useRef(new Animated.Value(1)).current;

    // Pulse animation for live dot
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Bike movement animation
    useEffect(() => {
        const bike = Animated.loop(
            Animated.sequence([
                Animated.timing(bikeAnim, { toValue: 10, duration: 600, useNativeDriver: true }),
                Animated.timing(bikeAnim, { toValue: -10, duration: 600, useNativeDriver: true }),
            ])
        );
        bike.start();
        return () => bike.stop();
    }, []);

    // Auto countdown ETA
    useEffect(() => {
        if (eta <= 0) return;
        const t = setTimeout(() => setEta(e => Math.max(0, e - 1)), 60000);
        return () => clearTimeout(t);
    }, [eta]);

    // Simulate status progression
    useEffect(() => {
        const timers = [
            setTimeout(() => setCurrentStep(3), 8000),
            setTimeout(() => setCurrentStep(4), 20000),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const getStepColor = (done, current) => {
        if (done) return '#22C55E';
        if (current) return '#FF6B35';
        return '#E5E7EB';
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Header */}
            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Live Tracking</Text>
                    <View style={styles.liveRow}>
                        <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('ऑर्डर', `Order ID: ${order.id}`)}>
                    <Text style={{ color: '#FF6B35', fontWeight: '700' }}>{order.id}</Text>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

                {/* Map Placeholder (Animated) */}
                <View style={styles.mapContainer}>
                    <LinearGradient colors={['#1E3A5F', '#0F2847', '#0A1628']} style={styles.mapBg}>
                        {/* Road Lines */}
                        <View style={styles.roadH} />
                        <View style={styles.roadV} />
                        {/* Grid */}
                        {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
                            <View key={i} style={[styles.gridLine, { top: height * 0.2 * f + 10, opacity: 0.15 }]} />
                        ))}

                        {/* Shop Pin */}
                        <View style={[styles.mapPin, { top: 40, left: width * 0.25 }]}>
                            <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.pinBubble}>
                                <Text style={{ fontSize: 16 }}>🏪</Text>
                            </LinearGradient>
                            <View style={styles.pinTail} />
                            <Text style={styles.pinLabel}>Shop</Text>
                        </View>

                        {/* Your Home Pin */}
                        <View style={[styles.mapPin, { top: 60, right: width * 0.2 }]}>
                            <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.pinBubble}>
                                <Text style={{ fontSize: 16 }}>🏠</Text>
                            </LinearGradient>
                            <View style={[styles.pinTail, { borderTopColor: '#22C55E' }]} />
                            <Text style={styles.pinLabel}>You</Text>
                        </View>

                        {/* Delivery Guy (Animated) */}
                        <Animated.View style={[styles.deliveryPin, {
                            transform: [{ translateX: bikeAnim }]
                        }]}>
                            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={[styles.pinBubble, { width: 48, height: 48, borderRadius: 24 }]}>
                                <Text style={{ fontSize: 22 }}>🚴</Text>
                            </LinearGradient>
                            <Text style={[styles.pinLabel, { color: '#A78BFA', fontWeight: '900' }]}>{order.driver.name.split(' ')[0]}</Text>
                        </Animated.View>

                        {/* ETA Overlay */}
                        <View style={styles.etaOverlay}>
                            <Text style={styles.etaNum}>{eta}</Text>
                            <Text style={styles.etaUnit}>min away</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* ETA Card */}
                <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.etaCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.etaCardLabel}>Expected Arrival • पहुँचने में</Text>
                        <Text style={styles.etaCardTime}>{eta} minutes</Text>
                        <Text style={styles.etaCardSub}>📍 {order.distance} remaining · Order {order.id}</Text>
                    </View>
                    <View style={styles.etaIconBox}>
                        <Text style={{ fontSize: 36 }}>⏱️</Text>
                    </View>
                </LinearGradient>

                {/* Delivery Partner Card */}
                <View style={styles.driverCard}>
                    <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.driverAvatar}>
                        <Text style={{ fontSize: 24 }}>👤</Text>
                    </LinearGradient>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.driverName}>{order.driver.name}</Text>
                        <View style={styles.driverMeta}>
                            <Text style={styles.driverRating}>⭐ {order.driver.rating}</Text>
                            <Text style={styles.driverTrips}>· {order.driver.trips} deliveries</Text>
                        </View>
                        <Text style={styles.driverLabel}>डिलीवरी पार्टनर</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => Alert.alert('📞 Call', `Calling ${order.driver.name}...`)}>
                        <Text style={{ fontSize: 22 }}>📞</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.callBtn, { backgroundColor: '#F0FDF4', marginLeft: 8 }]}
                        onPress={() => navigation?.navigate('Chat', { driver: order.driver })}>
                        <Text style={{ fontSize: 22 }}>💬</Text>
                    </TouchableOpacity>
                </View>

                {/* Order Status Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📦 Order Status</Text>
                    {STATUSES.map((s, i) => {
                        const isCurrent = i === currentStep;
                        const isDone = i < currentStep;
                        return (
                            <View key={s.id} style={styles.timelineRow}>
                                <View style={{ alignItems: 'center', marginRight: 14 }}>
                                    <View style={[styles.stepDot, {
                                        backgroundColor: isDone ? '#22C55E' : isCurrent ? '#FF6B35' : '#F1F5F9',
                                        borderColor: isCurrent ? '#FF6B35' : 'transparent',
                                        borderWidth: isCurrent ? 3 : 0,
                                    }]}>
                                        <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                                    </View>
                                    {i < STATUSES.length - 1 && (
                                        <View style={[styles.stepLine, { backgroundColor: isDone ? '#22C55E' : '#E5E7EB' }]} />
                                    )}
                                </View>
                                <View style={{ flex: 1, paddingBottom: 20 }}>
                                    <Text style={[styles.stepLabel, { color: isDone || isCurrent ? '#0F172A' : '#9CA3AF', fontWeight: isCurrent ? '900' : '600' }]}>
                                        {s.label}
                                    </Text>
                                    <Text style={[styles.stepLabelHi, { color: isCurrent ? '#FF6B35' : '#9CA3AF' }]}>{s.labelHi}</Text>
                                </View>
                                {isCurrent && (
                                    <Animated.View style={[styles.currentPulse, { transform: [{ scale: pulseAnim }] }]}>
                                        <Text style={{ fontSize: 10, color: '#FF6B35', fontWeight: '900' }}>CURRENT</Text>
                                    </Animated.View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Order Items */}
                <View style={[styles.section, { marginBottom: 30 }]}>
                    <Text style={styles.sectionTitle}>🛒 Your Order</Text>
                    <View style={styles.orderCard}>
                        <View style={styles.orderShopRow}>
                            <Text style={{ fontSize: 28 }}>{order.shopEmoji}</Text>
                            <Text style={styles.orderShopName}>{order.shopName}</Text>
                        </View>
                        {order.items.map((item, i) => (
                            <View key={i} style={styles.orderItemRow}>
                                <Text style={styles.orderItemDot}>•</Text>
                                <Text style={styles.orderItem}>{item}</Text>
                            </View>
                        ))}
                        <View style={styles.orderTotalRow}>
                            <Text style={styles.orderTotalLabel}>Total</Text>
                            <Text style={styles.orderTotal}>₹{order.total}</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
    liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
    liveText: { color: '#22C55E', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    mapContainer: { height: 220, overflow: 'hidden' },
    mapBg: { flex: 1, position: 'relative' },
    roadH: { position: 'absolute', left: 0, right: 0, top: '50%', height: 18, backgroundColor: 'rgba(255,255,255,0.08)' },
    roadV: { position: 'absolute', top: 0, bottom: 0, left: '40%', width: 14, backgroundColor: 'rgba(255,255,255,0.08)' },
    gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#4B6BB7' },
    mapPin: { position: 'absolute', alignItems: 'center' },
    pinBubble: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 6 },
    pinTail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10, borderStyle: 'solid', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FF6B35' },
    pinLabel: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 3, textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    deliveryPin: { position: 'absolute', top: '40%', left: '45%', alignItems: 'center' },
    etaOverlay: { position: 'absolute', bottom: 12, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
    etaNum: { color: '#FF6B35', fontSize: 22, fontWeight: '900' },
    etaUnit: { color: '#fff', fontSize: 11 },
    etaCard: { margin: 16, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', elevation: 8, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
    etaCardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
    etaCardTime: { color: '#fff', fontSize: 28, fontWeight: '900' },
    etaCardSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },
    etaIconBox: {},
    driverCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
    driverAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    driverName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    driverMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    driverRating: { fontSize: 13, color: '#F59E0B', fontWeight: '700' },
    driverTrips: { fontSize: 12, color: '#94A3B8', marginLeft: 4 },
    driverLabel: { fontSize: 11, color: '#7C3AED', fontWeight: '700', marginTop: 3 },
    callBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
    timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
    stepDot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    stepLine: { width: 2, flex: 1, minHeight: 20, marginTop: 2 },
    stepLabel: { fontSize: 15, fontWeight: '700' },
    stepLabelHi: { fontSize: 12, marginTop: 2 },
    currentPulse: { backgroundColor: '#FFF7ED', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FF6B35' },
    orderCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
    orderShopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    orderShopName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
    orderItemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
    orderItemDot: { color: '#FF6B35', fontSize: 16, marginRight: 8, fontWeight: '900' },
    orderItem: { fontSize: 14, color: '#374151' },
    orderTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    orderTotalLabel: { fontSize: 15, fontWeight: '700', color: '#374151' },
    orderTotal: { fontSize: 22, fontWeight: '900', color: '#FF6B35' },
});

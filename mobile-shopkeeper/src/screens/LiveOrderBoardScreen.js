import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    StatusBar, Animated, Dimensions, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MOCK_ORDERS = [
    { id: 'ORD-001', customer: 'Ramesh Gupta', items: 'दूध 1L, ब्रेड', total: 123, status: 'new', time: '2 min ago', address: 'Civil Lines, Gate 3' },
    { id: 'ORD-002', customer: 'Priya Sharma', items: 'चाय पत्ती, चीनी 1kg', total: 89, status: 'new', time: '5 min ago', address: 'Gandhi Chowk' },
    { id: 'ORD-003', customer: 'Sanjay Patel', items: 'Atta 10kg, Oil 1L', total: 478, status: 'preparing', time: '12 min ago', address: 'Sarafa Bazar' },
    { id: 'ORD-004', customer: 'Meera Joshi', items: 'दही 500g, पनीर 200g', total: 165, status: 'preparing', time: '18 min ago', address: 'Housing Board Colony' },
    { id: 'ORD-005', customer: 'Arun Singh', items: 'Mixed Veggies Combo', total: 210, status: 'ready', time: '25 min ago', address: 'Station Road' },
];

const STATUS_CONFIG = {
    new: { label: 'New Orders', labelHi: 'नए ऑर्डर', color: '#EF4444', bg: '#FEF2F2', icon: '🔔' },
    preparing: { label: 'Preparing', labelHi: 'तैयार हो रहा है', color: '#F59E0B', bg: '#FFFBEB', icon: '👨‍🍳' },
    ready: { label: 'Ready', labelHi: 'तैयार है', color: '#22C55E', bg: '#F0FDF4', icon: '✅' },
};

export default function LiveOrderBoardScreen({ navigation }) {
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [selectedCol, setSelectedCol] = useState('all');
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [todayRevenue, setTodayRevenue] = useState(4870);
    const [pendingCount, setPendingCount] = useState(2);

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Simulate new order every 15 sec
    useEffect(() => {
        const t = setInterval(() => {
            const newOrder = {
                id: `ORD-${Math.floor(Math.random() * 900 + 100)}`,
                customer: ['Kavita Rao', 'Deepak Verma', 'Anita Tiwari'][Math.floor(Math.random() * 3)],
                items: ['दूध + अंडे', 'Bread + Butter', 'Rice + Dal'][Math.floor(Math.random() * 3)],
                total: Math.floor(Math.random() * 300 + 80),
                status: 'new',
                time: 'just now',
                address: ['Civil Lines', 'Gandhi Chowk', 'City Center'][Math.floor(Math.random() * 3)],
            };
            setOrders(prev => [newOrder, ...prev.slice(0, 9)]);
            setTodayRevenue(prev => prev + newOrder.total);
            setPendingCount(prev => prev + 1);
        }, 15000);
        return () => clearInterval(t);
    }, []);

    const updateStatus = (orderId, newStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (newStatus === 'preparing') setPendingCount(prev => Math.max(0, prev - 1));
    };

    const getNextStatus = (current) => {
        if (current === 'new') return 'preparing';
        if (current === 'preparing') return 'ready';
        return null;
    };

    const getNextLabel = (current) => {
        if (current === 'new') return '▶ Start Preparing';
        if (current === 'preparing') return '✅ Mark Ready';
        return null;
    };

    const filtered = selectedCol === 'all' ? orders : orders.filter(o => o.status === selectedCol);

    const colCounts = {
        new: orders.filter(o => o.status === 'new').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Header */}
            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <View style={styles.liveRow}>
                        <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
                        <Text style={styles.headerTitle}>Live Order Board</Text>
                    </View>
                    <Text style={styles.headerSub}>Real-time · Auto-refresh</Text>
                </View>
                <View style={styles.revenueBox}>
                    <Text style={styles.revenueAmt}>₹{todayRevenue.toLocaleString()}</Text>
                    <Text style={styles.revenueLabel}>Today</Text>
                </View>
            </LinearGradient>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <TouchableOpacity style={[styles.statCard, selectedCol === 'all' && styles.statCardActive]} onPress={() => setSelectedCol('all')}>
                    <Text style={styles.statNum}>{orders.length}</Text>
                    <Text style={styles.statLabel}>All</Text>
                </TouchableOpacity>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.statCard, { borderColor: cfg.color + '40' }, selectedCol === key && { backgroundColor: cfg.color + '15', borderColor: cfg.color }]}
                        onPress={() => setSelectedCol(key)}>
                        {key === 'new' && colCounts[key] > 0 && (
                            <Animated.View style={[styles.urgentDot, { transform: [{ scale: pulseAnim }] }]} />
                        )}
                        <Text style={[styles.statNum, { color: cfg.color }]}>{colCounts[key]}</Text>
                        <Text style={styles.statLabel}>{cfg.icon} {cfg.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Order Cards */}
            <ScrollView style={{ flex: 1, paddingHorizontal: 14 }} contentContainerStyle={{ paddingTop: 14, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
                {filtered.map(order => {
                    const cfg = STATUS_CONFIG[order.status];
                    const nextStatus = getNextStatus(order.status);
                    return (
                        <View key={order.id} style={[styles.orderCard, { borderLeftColor: cfg.color, borderLeftWidth: 5 }]}>
                            <View style={styles.orderTop}>
                                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                                    <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.icon} {cfg.label}</Text>
                                </View>
                                <Text style={styles.orderTime}>{order.time}</Text>
                            </View>

                            <View style={styles.orderMiddle}>
                                <Text style={styles.orderId}>{order.id}</Text>
                                <Text style={styles.orderTotal}>₹{order.total}</Text>
                            </View>

                            <Text style={styles.customer}>👤 {order.customer}</Text>
                            <Text style={styles.orderItems} numberOfLines={1}>📦 {order.items}</Text>
                            <Text style={styles.address}>📍 {order.address}</Text>

                            <View style={styles.orderActions}>
                                <TouchableOpacity style={styles.orderActionDetl} onPress={() => Alert.alert(`Order ${order.id}`, `Customer: ${order.customer}\nItems: ${order.items}\nTotal: ₹${order.total}\nAddress: ${order.address}`)}>
                                    <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 13 }}>View Details</Text>
                                </TouchableOpacity>
                                {nextStatus && (
                                    <TouchableOpacity
                                        style={[styles.nextBtn, { backgroundColor: cfg.color }]}
                                        onPress={() => updateStatus(order.id, nextStatus)}>
                                        <Text style={styles.nextBtnText}>{getNextLabel(order.status)}</Text>
                                    </TouchableOpacity>
                                )}
                                {order.status === 'ready' && (
                                    <TouchableOpacity
                                        style={[styles.nextBtn, { backgroundColor: '#7C3AED' }]}
                                        onPress={() => Alert.alert('📞 Assign Delivery', 'Finding nearest delivery partner...')}>
                                        <Text style={styles.nextBtnText}>🚴 Assign Rider</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    liveDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#22C55E' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 3 },
    revenueBox: { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#22C55E40' },
    revenueAmt: { color: '#22C55E', fontSize: 16, fontWeight: '900' },
    revenueLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 },
    statsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    statCard: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent', position: 'relative' },
    statCardActive: { backgroundColor: '#FFF7ED', borderColor: '#FF6B35' },
    statNum: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
    statLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '600', marginTop: 2, textAlign: 'center' },
    urgentDot: { position: 'absolute', top: 6, right: 6, width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#EF4444' },
    orderCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
    orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    statusBadgeText: { fontSize: 12, fontWeight: '800' },
    orderTime: { fontSize: 12, color: '#94A3B8' },
    orderMiddle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    orderId: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
    orderTotal: { fontSize: 18, fontWeight: '900', color: '#FF6B35' },
    customer: { fontSize: 13, color: '#374151', fontWeight: '700', marginBottom: 5 },
    orderItems: { fontSize: 13, color: '#64748B', marginBottom: 5 },
    address: { fontSize: 12, color: '#94A3B8', marginBottom: 12 },
    orderActions: { flexDirection: 'row', gap: 10 },
    orderActionDetl: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    nextBtn: { flex: 2, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
    nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});

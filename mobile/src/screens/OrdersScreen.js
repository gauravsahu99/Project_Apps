import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    StatusBar, ScrollView, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { timeAgo } from '../constants/dataStore';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
    dispatched: { label: 'On the way', color: '#3B82F6', bg: '#DBEAFE', icon: '🚴' },
    delivered: { label: 'Delivered', color: '#16A34A', bg: '#DCFCE7', icon: '✅' },
    cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2', icon: '❌' },
};

export default function OrdersScreen({ navigation }) {
    const { user, getUserOrders } = useAuth();
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [orders, setOrders] = useState(() => getUserOrders());

    const reload = useCallback(() => setOrders(getUserOrders()), [getUserOrders]);

    const onRefresh = async () => {
        setRefreshing(true);
        reload();
        setRefreshing(false);
    };

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const FILTERS = ['all', 'pending', 'dispatched', 'delivered', 'cancelled'];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>📦 My Orders</Text>
                    <Text style={styles.headerSub}>{orders.length} total orders</Text>
                </View>
            </LinearGradient>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, filter === f && styles.filterChipActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f === 'all' ? 'All Orders' : STATUS_CONFIG[f]?.label || f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 30 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}
            >
                {filtered.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={{ fontSize: 64 }}>📦</Text>
                        <Text style={styles.emptyTitle}>No orders here</Text>
                        <Text style={styles.emptyDesc}>Your orders will appear here</Text>
                        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Essentials')}>
                            <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.shopBtnGrad}>
                                <Text style={styles.shopBtnText}>Start Shopping</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filtered.map(order => {
                        const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                        return (
                            <View key={order.id} style={styles.card}>
                                {/* Order Header */}
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                                        <Text style={styles.orderTime}>{timeAgo(order.createdAt)}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                                        <Text style={{ fontSize: 12 }}>{sc.icon} </Text>
                                        <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                                    </View>
                                </View>

                                {/* Items */}
                                <View style={styles.itemsSection}>
                                    {order.items.map((item, i) => (
                                        <View key={i} style={styles.itemRow}>
                                            <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                                            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                            <Text style={styles.itemQty}>×{item.quantity}</Text>
                                            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Footer */}
                                <View style={styles.cardFooter}>
                                    <View style={styles.footerLeft}>
                                        <Text style={styles.slotText}>🕐 {order.slot}</Text>
                                        <Text style={styles.addrText} numberOfLines={1}>📍 {order.address}</Text>
                                    </View>
                                    <View style={styles.totalBox}>
                                        <Text style={styles.totalLabel}>Total</Text>
                                        <Text style={styles.totalVal}>₹{order.total}</Text>
                                    </View>
                                </View>

                                {/* Progress Bar */}
                                <View style={styles.progressRow}>
                                    {['pending', 'dispatched', 'delivered'].map((s, i) => {
                                        const steps = ['pending', 'dispatched', 'delivered'];
                                        const currentIdx = steps.indexOf(order.status);
                                        const done = i <= currentIdx && order.status !== 'cancelled';
                                        return (
                                            <React.Fragment key={s}>
                                                <View style={[styles.progressDot, done && styles.progressDotDone]}>
                                                    <Text style={{ fontSize: 8, color: done ? '#fff' : '#9CA3AF' }}>
                                                        {['⏳', '🚴', '✅'][i]}
                                                    </Text>
                                                </View>
                                                {i < 2 && <View style={[styles.progressLine, done && i < currentIdx && styles.progressLineDone]} />}
                                            </React.Fragment>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
    backText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
    filterBar: { backgroundColor: '#FFFFFF', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexGrow: 0 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: '#E2E8F0' },
    filterChipActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
    filterText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
    filterTextActive: { color: '#FFFFFF' },
    scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    orderId: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
    orderTime: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
    statusText: { fontSize: 12, fontWeight: '700' },
    itemsSection: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, marginBottom: 12 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
    itemName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1E293B' },
    itemQty: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    itemPrice: { fontSize: 13, fontWeight: '800', color: '#FF6B35' },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    footerLeft: { flex: 1 },
    slotText: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 3 },
    addrText: { fontSize: 12, color: '#94A3B8' },
    totalBox: { alignItems: 'flex-end' },
    totalLabel: { fontSize: 11, color: '#94A3B8' },
    totalVal: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
    progressRow: { flexDirection: 'row', alignItems: 'center' },
    progressDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
    progressDotDone: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
    progressLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0' },
    progressLineDone: { backgroundColor: '#FF6B35' },
    empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
    emptyTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginTop: 16, marginBottom: 8 },
    emptyDesc: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 24 },
    shopBtn: { width: '100%' },
    shopBtnGrad: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    shopBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

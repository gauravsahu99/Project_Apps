import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    StatusBar, Dimensions, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DELIVERY_HISTORY = [
    { id: 'DEL-001', from: 'Sharma Kirana', to: 'Civil Lines', amount: 40, bonus: 20, distance: 1.2, rating: 5, time: '10:30 AM', date: 'Today' },
    { id: 'DEL-002', from: 'Fresh Bakery', to: 'Gandhi Chowk', amount: 35, bonus: 0, distance: 0.9, rating: 4, time: '9:15 AM', date: 'Today' },
    { id: 'DEL-003', from: 'Royal Grocery', to: 'Housing Board', amount: 50, bonus: 0, distance: 2.1, rating: 5, time: '6:45 PM', date: 'Yesterday' },
    { id: 'DEL-004', from: 'Sharma Kirana', to: 'Station Road', amount: 40, bonus: 20, distance: 1.8, rating: 3, time: '8:00 PM', date: 'Yesterday' },
    { id: 'DEL-005', from: 'City Mart', to: 'Sarafa Bazar', amount: 45, bonus: 0, distance: 1.5, rating: 5, time: '11:20 AM', date: 'Mar 25' },
];

const PERIOD_DATA = {
    Today: { deliveries: 2, earned: 95, distance: 2.1, rating: 4.5, bonus: 20 },
    Week: { deliveries: 18, earned: 860, distance: 24.5, rating: 4.7, bonus: 80 },
    Month: { deliveries: 74, earned: 3520, distance: 98.2, rating: 4.8, bonus: 250 },
};

export default function EarningsDetailScreen({ navigation }) {
    const [period, setPeriod] = useState('Today');
    const data = PERIOD_DATA[period];

    const renderStars = (r) => '⭐'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Header */}
            <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>💰 Earnings</Text>
                    <Text style={styles.headerSub}>Performance & income tracker</Text>
                </View>
                <TouchableOpacity style={styles.withdrawBtn} onPress={() => Alert.alert('🏦 Withdraw', 'Withdrawal request placed. Amount will credit in 24 hrs.')}>
                    <Text style={{ color: '#22C55E', fontWeight: '900', fontSize: 13 }}>Withdraw 💸</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Period Tabs */}
            <View style={styles.periodTabs}>
                {['Today', 'Week', 'Month'].map(p => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.periodTab, period === p && styles.periodTabActive]}
                        onPress={() => setPeriod(p)}>
                        <Text style={[styles.periodTabText, period === p && styles.periodTabTextActive]}>{p}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Earnings Hero */}
                <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.earningsHero}>
                    <Text style={styles.earnLabel}>Total Earned</Text>
                    <Text style={styles.earnAmount}>₹{data.earned}</Text>
                    {data.bonus > 0 && (
                        <View style={styles.bonusBadge}>
                            <Text style={styles.bonusText}>🎯 Bonus: +₹{data.bonus}</Text>
                        </View>
                    )}
                    <View style={styles.earnMeta}>
                        <Text style={styles.earnMetaText}>📦 {data.deliveries} deliveries · {data.distance} km</Text>
                    </View>
                </LinearGradient>

                {/* Stats Cards */}
                <View style={styles.statsGrid}>
                    {[
                        { icon: '📦', label: 'Deliveries', value: data.deliveries, color: '#3B82F6' },
                        { icon: '📍', label: 'Distance', value: `${data.distance} km`, color: '#7C3AED' },
                        { icon: '⭐', label: 'Avg Rating', value: data.rating, color: '#F59E0B' },
                        { icon: '💎', label: 'Bonus', value: `₹${data.bonus}`, color: '#22C55E' },
                    ].map((s, i) => (
                        <View key={i} style={styles.statCard}>
                            <Text style={{ fontSize: 26 }}>{s.icon}</Text>
                            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Income Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Income Breakdown</Text>
                    <View style={styles.breakdownCard}>
                        {[
                            { label: 'Delivery Charges', value: data.earned - data.bonus, pct: 85 },
                            { label: 'Bonus & Rewards', value: data.bonus, pct: 15 },
                        ].map((b, i) => (
                            <View key={i} style={styles.breakdownRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.breakdownLabel}>{b.label}</Text>
                                    <View style={styles.breakdownBarBg}>
                                        <LinearGradient
                                            colors={i === 0 ? ['#22C55E', '#16A34A'] : ['#F59E0B', '#D97706']}
                                            style={[styles.breakdownBar, { width: `${b.pct}%` }]}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.breakdownValue}>₹{b.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Delivery History */}
                <View style={[styles.section, { paddingBottom: 30 }]}>
                    <Text style={styles.sectionTitle}>📋 Recent Deliveries</Text>
                    {DELIVERY_HISTORY.map(d => (
                        <View key={d.id} style={styles.historyCard}>
                            <View style={styles.historyTop}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.historyId}>{d.id}</Text>
                                    <Text style={styles.historyRoute}>🏪 {d.from} → 🏠 {d.to}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.historyAmount}>₹{d.amount + d.bonus}</Text>
                                    {d.bonus > 0 && <Text style={styles.historyBonus}>+₹{d.bonus} bonus</Text>}
                                </View>
                            </View>
                            <View style={styles.historyBottom}>
                                <Text style={styles.historyMeta}>⏰ {d.time} · {d.date} · {d.distance} km</Text>
                                <Text style={styles.historyRating}>{'⭐'.repeat(d.rating)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
    withdrawBtn: { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#22C55E40' },
    periodTabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    periodTab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    periodTabActive: { borderBottomColor: '#22C55E' },
    periodTabText: { fontSize: 14, color: '#94A3B8', fontWeight: '700' },
    periodTabTextActive: { color: '#22C55E', fontWeight: '900' },
    earningsHero: { marginHorizontal: 16, marginTop: 16, borderRadius: 24, padding: 24, alignItems: 'center', elevation: 8, shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
    earnLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '700' },
    earnAmount: { color: '#fff', fontSize: 48, fontWeight: '900', marginVertical: 6 },
    bonusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
    bonusText: { color: '#fff', fontWeight: '800', fontSize: 13 },
    earnMeta: { marginTop: 12 },
    earnMetaText: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
    statsGrid: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 14, gap: 10 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5 },
    statValue: { fontSize: 20, fontWeight: '900', marginTop: 6 },
    statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
    breakdownCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
    breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    breakdownLabel: { fontSize: 13, color: '#374151', fontWeight: '700', marginBottom: 8 },
    breakdownBarBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
    breakdownBar: { height: '100%', borderRadius: 5 },
    breakdownValue: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginLeft: 16, minWidth: 60, textAlign: 'right' },
    historyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    historyTop: { flexDirection: 'row', marginBottom: 10 },
    historyId: { fontSize: 12, color: '#94A3B8', fontWeight: '700', marginBottom: 4 },
    historyRoute: { fontSize: 13, color: '#0F172A', fontWeight: '700' },
    historyAmount: { fontSize: 18, fontWeight: '900', color: '#22C55E' },
    historyBonus: { fontSize: 11, color: '#F59E0B', fontWeight: '700', textAlign: 'right' },
    historyBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyMeta: { fontSize: 11, color: '#94A3B8' },
    historyRating: { fontSize: 12 },
});

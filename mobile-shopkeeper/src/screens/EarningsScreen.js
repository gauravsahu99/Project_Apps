import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, timeAgo } from '../constants/dataStore';

export default function EarningsScreen() {
  const { shop } = useAuth();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => { if (shop) setOrders(getOrders({ shopId: shop.id })); };
  useEffect(() => { load(); }, [shop]);

  const delivered = orders.filter(o => o.status === 'delivered');
  const totalEarning = delivered.reduce((s, o) => s + (o.shopEarning || 0), 0);
  const totalCommission = delivered.reduce((s, o) => s + (o.commission || 0), 0);
  const totalRevenue = delivered.reduce((s, o) => s + (o.total || 0), 0);

  const today = new Date().toDateString();
  const todayOrders = delivered.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayEarning = todayOrders.reduce((s, o) => s + (o.shopEarning || 0), 0);

  const STATS = [
    { label: "Today's Earning", value: `₹${todayEarning}`, emoji: '📅', color: '#1976D2', bg: '#E8F4FD' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, emoji: '💳', color: '#D97706', bg: '#FFFBEB' },
    { label: 'Platform Fee', value: `₹${totalCommission.toLocaleString()}`, emoji: '📊', color: '#EF4444', bg: '#FEF2F2' },
    { label: 'Net Earnings', value: `₹${totalEarning.toLocaleString()}`, emoji: '💰', color: '#22C55E', bg: '#F0FDF4' },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); setTimeout(() => setRefreshing(false), 400); }} tintColor="#22C55E" />}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Earnings</Text>
        <Text style={styles.headerSub}>All Time: ₹{totalEarning.toLocaleString()}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {STATS.map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <Text style={styles.statEmoji}>{s.emoji}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Commission Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📊 Commission Model</Text>
        <Text style={styles.infoText}>For every delivered order:</Text>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownItem}>Order Total</Text>
          <Text style={styles.breakdownValue}>100%</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={[styles.breakdownItem, { color: '#EF4444' }]}>Platform Fee</Text>
          <Text style={[styles.breakdownValue, { color: '#EF4444' }]}>- 10%</Text>
        </View>
        <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, marginTop: 4 }]}>
          <Text style={[styles.breakdownItem, { fontWeight: '800', color: '#22C55E' }]}>You Earn</Text>
          <Text style={[styles.breakdownValue, { fontWeight: '800', color: '#22C55E' }]}>90%</Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Recent Transactions</Text>
        {delivered.slice(0, 10).map(order => (
          <View key={order.id} style={styles.txRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.txName}>{order.userName}</Text>
              <Text style={styles.txTime}>{timeAgo(order.createdAt)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.txEarning}>+₹{order.shopEarning}</Text>
              <Text style={styles.txFee}>-₹{order.commission} fee</Text>
            </View>
          </View>
        ))}
        {delivered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💰</Text>
            <Text style={styles.emptyText}>No completed orders yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FC' },
  header: { backgroundColor: '#22C55E', padding: 24, paddingTop: 52 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center' },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#666', fontWeight: '600', marginTop: 4 },
  infoCard: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 16, padding: 16 },
  infoTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  infoText: { color: '#888', fontSize: 13, marginBottom: 10 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakdownItem: { fontSize: 14, fontWeight: '600', color: '#333' },
  breakdownValue: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  section: { backgroundColor: '#FFF', margin: 12, marginBottom: 32, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  txName: { fontWeight: '700', color: '#1A1A2E', fontSize: 14 },
  txTime: { color: '#999', fontSize: 12, marginTop: 2 },
  txEarning: { fontSize: 16, fontWeight: '800', color: '#22C55E' },
  txFee: { fontSize: 11, color: '#EF4444', fontWeight: '600' },
  empty: { alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: '#bbb', fontSize: 14 },
});

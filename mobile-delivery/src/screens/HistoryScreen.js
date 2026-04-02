import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, timeAgo } from '../constants/dataStore';

export default function HistoryScreen() {
  const { partner } = useAuth();
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    if (!partner) return;
    setHistory(getOrders({ deliveryBoyId: partner.id }).filter(o => o.status === 'delivered'));
  };

  useEffect(() => { load(); }, [partner]);

  const renderItem = ({ item: order }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.customer}>👤 {order.userName}</Text>
          <Text style={styles.address} numberOfLines={1}>📍 {order.address}</Text>
        </View>
        <View style={styles.earningCol}>
          <Text style={styles.earning}>+₹{order.deliveryFee || 30}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>✅ Delivered</Text></View>
          <Text style={styles.time}>{timeAgo(order.createdAt)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>📦 {history.length} deliveries completed</Text>
        <Text style={styles.summaryEarning}>💰 Total: ₹{history.reduce((s, o) => s + (o.deliveryFee || 30), 0)}</Text>
      </View>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); setTimeout(() => setRefreshing(false), 400); }} tintColor="#4CAF50" />}
        ListEmptyComponent={
          <View style={styles.empty}><Text style={styles.emptyEmoji}>📦</Text><Text style={styles.emptyText}>No deliveries yet</Text></View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FC' },
  summary: { backgroundColor: '#4CAF50', padding: 16, flexDirection: 'row', justifyContent: 'space-between' },
  summaryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  summaryEarning: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 14 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  orderId: { fontWeight: '800', color: '#1A1A2E', fontSize: 14, marginBottom: 4 },
  customer: { fontSize: 13, color: '#555', marginBottom: 3 },
  address: { fontSize: 12, color: '#888' },
  earningCol: { alignItems: 'flex-end' },
  earning: { fontSize: 18, fontWeight: '800', color: '#4CAF50', marginBottom: 4 },
  badge: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#166534' },
  time: { fontSize: 11, color: '#aaa' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyText: { color: '#bbb', fontSize: 16 },
});

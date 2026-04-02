import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, acceptOrderByShop, rejectOrderByShop, timeAgo } from '../constants/dataStore';

const STATUS_COLORS = {
  pending: { bg: '#FFF3E0', text: '#E65100', label: '⏳ Pending' },
  accepted: { bg: '#E8F5E9', text: '#2E7D32', label: '✅ Accepted' },
  dispatched: { bg: '#E3F2FD', text: '#1565C0', label: '🚴 On the way' },
  delivered: { bg: '#F3E5F5', text: '#6A1B9A', label: '✅ Delivered' },
  rejected: { bg: '#FFEBEE', text: '#C62828', label: '❌ Rejected' },
};

const FILTERS = ['All', 'pending', 'accepted', 'dispatched', 'delivered'];

export default function OrderInboxScreen({ navigation }) {
  const { shop } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!shop) return;
    setOrders(getOrders({ shopId: shop.id }));
  }, [shop]);

  useEffect(() => { load(); const i = setInterval(load, 4000); return () => clearInterval(i); }, [load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); setTimeout(() => setRefreshing(false), 500); }, [load]);

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  const handleAccept = (orderId) => {
    Alert.alert('Accept Order', 'Accept this order for preparation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept ✓', style: 'default', onPress: () => { acceptOrderByShop(orderId); load(); } },
    ]);
  };

  const handleReject = (orderId) => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => { rejectOrderByShop(orderId, 'Out of stock'); load(); } },
    ]);
  };

  const renderOrder = ({ item: order }) => {
    const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}>
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderTime}>{timeAgo(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
          </View>
        </View>

        <View style={styles.customerRow}>
          <Text style={styles.avatar}>{(order.userName || 'U')[0]}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{order.userName}</Text>
            <Text style={styles.customerPhone}>📱 {order.phone}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalAmt}>₹{order.total}</Text>
            <Text style={styles.commission}>-₹{order.commission} fee</Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {(order.items || []).map((item, idx) => (
            <Text key={idx} style={styles.item}>{item.emoji} {item.name} × {item.quantity}</Text>
          ))}
        </View>

        <Text style={styles.address}>📍 {order.address}</Text>

        {order.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(order.id)}>
              <Text style={styles.rejectText}>✕ Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(order.id)}>
              <Text style={styles.acceptText}>✓ Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Orders</Text>
        <View style={styles.countBadge}><Text style={styles.countText}>{orders.filter(o => o.status === 'pending').length} new</Text></View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f === 'All' ? 'All' : STATUS_COLORS[f]?.label || f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderOrder}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}
        ListEmptyComponent={
          <View style={styles.empty}><Text style={styles.emptyEmoji}>📦</Text><Text style={styles.emptyText}>No orders yet</Text></View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FC' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B35', padding: 20, paddingTop: 52, gap: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', flex: 1 },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  countText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  filters: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 8, gap: 6 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6' },
  filterTabActive: { backgroundColor: '#FF6B35' },
  filterText: { fontSize: 11, fontWeight: '600', color: '#555' },
  filterTextActive: { color: '#FFF' },
  orderCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontWeight: '800', color: '#1A1A2E', fontSize: 14 },
  orderTime: { color: '#999', fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF0EB', textAlign: 'center', lineHeight: 36, fontSize: 16, fontWeight: '700', color: '#FF6B35', overflow: 'hidden' },
  customerName: { fontWeight: '700', color: '#1A1A2E', fontSize: 14 },
  customerPhone: { color: '#888', fontSize: 12, marginTop: 2 },
  totalBox: { alignItems: 'flex-end' },
  totalAmt: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  commission: { fontSize: 11, color: '#F44336', fontWeight: '600' },
  itemsList: { backgroundColor: '#F9F9FC', borderRadius: 10, padding: 10, marginBottom: 8, gap: 4 },
  item: { fontSize: 13, color: '#333', fontWeight: '500' },
  address: { fontSize: 12, color: '#888', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 10, padding: 12, alignItems: 'center' },
  rejectText: { color: '#EF4444', fontWeight: '700' },
  acceptBtn: { flex: 2, backgroundColor: '#22C55E', borderRadius: 10, padding: 12, alignItems: 'center' },
  acceptText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#bbb', fontWeight: '600' },
});

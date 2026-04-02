import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getOrders, acceptOrderByShop, rejectOrderByShop, updateOrderStatus, timeAgo } from '../constants/dataStore';

const STATUS_STEPS = ['pending', 'accepted', 'dispatched', 'delivered'];
const STATUS_INFO = {
  pending: { label: 'Pending Acceptance', color: '#FF6B35', emoji: '⏳' },
  accepted: { label: 'Accepted — Preparing', color: '#1976D2', emoji: '✅' },
  dispatched: { label: 'Dispatched — On the Way', color: '#9C27B0', emoji: '🚴' },
  delivered: { label: 'Delivered ✓', color: '#4CAF50', emoji: '✅' },
  rejected: { label: 'Rejected', color: '#F44336', emoji: '❌' },
  cancelled: { label: 'Cancelled', color: '#9E9E9E', emoji: '❌' },
};

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const load = () => {
      const all = getOrders();
      setOrder(all.find(o => o.id === orderId) || null);
    };
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, [orderId]);

  if (!order) return <View style={styles.center}><Text>Loading...</Text></View>;

  const si = STATUS_INFO[order.status] || STATUS_INFO.pending;
  const stepIdx = STATUS_STEPS.indexOf(order.status);

  const handleAccept = () => {
    Alert.alert('Accept Order', 'Ready to prepare this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept ✓', onPress: () => { acceptOrderByShop(orderId); const all = getOrders(); setOrder(all.find(o => o.id === orderId)); } },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Order', 'Reason?', [
      { text: 'Out of Stock', onPress: () => { rejectOrderByShop(orderId, 'Out of stock'); navigation.goBack(); } },
      { text: 'Shop Closed', onPress: () => { rejectOrderByShop(orderId, 'Shop closed'); navigation.goBack(); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: si.color }]}>
        <Text style={styles.statusEmoji}>{si.emoji}</Text>
        <Text style={styles.statusLabel}>{si.label}</Text>
      </View>

      {/* Progress Steps */}
      {order.status !== 'rejected' && order.status !== 'cancelled' && (
        <View style={styles.progressRow}>
          {STATUS_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <View style={[styles.stepCircle, i <= stepIdx && styles.stepDone]}>
                <Text style={styles.stepNum}>{i < stepIdx ? '✓' : i + 1}</Text>
              </View>
              {i < STATUS_STEPS.length - 1 && <View style={[styles.stepLine, i < stepIdx && styles.stepLineDone]} />}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Order Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Order Info</Text>
        <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.infoRow}>🕒 {new Date(order.createdAt).toLocaleString('hi-IN')}</Text>
        <Text style={styles.infoRow}>💳 {order.payment?.toUpperCase()}</Text>
        {order.slot && <Text style={styles.infoRow}>⏰ Slot: {order.slot}</Text>}
      </View>

      {/* Customer */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Customer</Text>
        <Text style={styles.customerName}>{order.userName}</Text>
        <Text style={styles.infoRow}>📱 {order.phone}</Text>
        <Text style={styles.infoRow}>📍 {order.address}</Text>
      </View>

      {/* Items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛍️ Items ({(order.items || []).length})</Text>
        {(order.items || []).map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.emoji} {item.name} × {item.quantity}</Text>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.itemRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalVal}>₹{order.total}</Text>
        </View>
        {order.promoDiscount > 0 && (
          <View style={styles.itemRow}>
            <Text style={{ color: '#22C55E', fontWeight: '600' }}>Promo Discount</Text>
            <Text style={{ color: '#22C55E', fontWeight: '700' }}>-₹{order.promoDiscount}</Text>
          </View>
        )}
        {order.deliveryFee > 0 && (
          <View style={styles.itemRow}>
            <Text style={styles.subtotalLabel}>Delivery Fee</Text>
            <Text style={styles.subtotalVal}>₹{order.deliveryFee}</Text>
          </View>
        )}
      </View>

      {/* Earnings */}
      <View style={[styles.card, { marginBottom: 32 }]}>
        <Text style={styles.cardTitle}>💰 Your Earnings</Text>
        <View style={styles.earningsRow}>
          <View style={styles.earningItem}>
            <Text style={styles.earningVal}>₹{order.total}</Text>
            <Text style={styles.earningLabel}>Order Total</Text>
          </View>
          <Text style={styles.minus}>−</Text>
          <View style={styles.earningItem}>
            <Text style={[styles.earningVal, { color: '#EF4444' }]}>₹{order.commission}</Text>
            <Text style={styles.earningLabel}>10% Fee</Text>
          </View>
          <Text style={styles.minus}>=</Text>
          <View style={styles.earningItem}>
            <Text style={[styles.earningVal, { color: '#22C55E' }]}>₹{order.shopEarning}</Text>
            <Text style={styles.earningLabel}>You Earn</Text>
          </View>
        </View>
        {order.deliveryBoyName && <Text style={styles.deliveryInfo}>🚴 Delivery: {order.deliveryBoyName}</Text>}
      </View>

      {/* Actions */}
      {order.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
            <Text style={styles.rejectText}>✕ Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <Text style={styles.acceptText}>✓ Accept Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBanner: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusEmoji: { fontSize: 28 },
  statusLabel: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  progressRow: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  stepDone: { backgroundColor: '#4CAF50' },
  stepNum: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB' },
  stepLineDone: { backgroundColor: '#4CAF50' },
  card: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  orderId: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  infoRow: { fontSize: 14, color: '#555', marginBottom: 6, fontWeight: '500' },
  customerName: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 14, color: '#333', flex: 1 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 },
  subtotalLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  subtotalVal: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  earningsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  earningItem: { alignItems: 'center' },
  earningVal: { fontSize: 20, fontWeight: '800', color: '#1A1A2E' },
  earningLabel: { fontSize: 11, color: '#888', marginTop: 4 },
  minus: { fontSize: 20, color: '#888' },
  deliveryInfo: { marginTop: 12, fontSize: 13, color: '#555', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, margin: 16, marginBottom: 32 },
  rejectBtn: { flex: 1, borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 12, padding: 14, alignItems: 'center' },
  rejectText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
  acceptBtn: { flex: 2, backgroundColor: '#22C55E', borderRadius: 12, padding: 14, alignItems: 'center' },
  acceptText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});

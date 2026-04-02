import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  Switch, RefreshControl, SafeAreaView, StatusBar, Platform, Animated,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, updateOrderStatus, timeAgo } from '../constants/dataStore';

const STATUS_INFO = {
  accepted: { label: 'Ready for Pickup', color: '#1976D2', bg: '#E3F2FD', next: 'dispatched', nextLabel: 'Mark Picked Up 🛍️' },
  dispatched: { label: 'On the Way', color: '#9C27B0', bg: '#F3E5F5', next: 'on_the_way', nextLabel: 'Mark On Way 🚴' },
  on_the_way: { label: 'Almost There', color: '#FF9800', bg: '#FFF3E0', next: null, nextLabel: null },
  pending: { label: 'Pending', color: '#FF6B35', bg: '#FFF3ED', next: null, nextLabel: null },
};

const GREEN = '#4CAF50';

export default function HomeScreen({ navigation }) {
  const { partner, toggleOnline, refreshPartner, logout } = useAuth();
  const [myOrders, setMyOrders] = useState([]);
  const [pendingPool, setPendingPool] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  const load = useCallback(() => {
    refreshPartner();
    if (partner) {
      setMyOrders(getOrders({ deliveryBoyId: partner.id }).filter(o => !['delivered', 'cancelled'].includes(o.status)));
      setPendingPool(getOrders({ status: 'accepted' }).filter(o => !o.deliveryBoyId));
    }
  }, [partner]);

  useEffect(() => { load(); const i = setInterval(load, 4000); return () => clearInterval(i); }, [load]);
  const onRefresh = useCallback(() => { setRefreshing(true); load(); setTimeout(() => setRefreshing(false), 500); }, [load]);

  const handleStatusUpdate = (order, nextStatus) => {
    const labels = { dispatched: 'Mark as Picked Up?', on_the_way: 'Mark On The Way?' };
    Alert.alert(labels[nextStatus] || 'Update Status', `Update order to "${nextStatus}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm ✓', onPress: () => { updateOrderStatus(order.id, nextStatus); load(); } },
    ]);
  };

  const todayTarget = 10;
  const todayProgress = Math.min(partner?.todayDeliveries || 0, todayTarget);
  const progressPct = (todayProgress / todayTarget) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>नमस्ते, {partner?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.rating}>⭐ {partner?.rating || '5.0'} rating • 🏆 {partner?.totalDeliveries || 0} deliveries</Text>
          </View>
          <View style={styles.onlineToggle}>
            <View style={[styles.onlineDot, { backgroundColor: partner?.isOnline ? '#22C55E' : '#F3F4F6' }]} />
            <Text style={styles.onlineLabel}>{partner?.isOnline ? 'Online' : 'Offline'}</Text>
            <Switch
              value={partner?.isOnline || false}
              onValueChange={toggleOnline}
              trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
              thumbColor={partner?.isOnline ? '#22C55E' : '#9CA3AF'}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginLeft: -4, marginRight: -4 }}
            />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { val: partner?.todayDeliveries || 0, label: "Today's Deliveries", color: GREEN, icon: '📦' },
            { val: `₹${partner?.todayEarnings || 0}`, label: "Today's Earnings", color: '#F59E0B', icon: '💰' },
            { val: partner?.totalDeliveries || 0, label: 'All Time', color: '#1976D2', icon: '🏆' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Daily Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>🎯 Daily Target</Text>
            <Text style={styles.progressCount}>{todayProgress}/{todayTarget} deliveries</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressSub}>
            {progressPct >= 100 ? '🎉 Target complete! You earned a ₹50 bonus!' : `${todayTarget - todayProgress} more to earn ₹50 bonus`}
          </Text>
        </View>

        {/* SOS / Emergency */}
        <TouchableOpacity
          style={[styles.sosCard, showSOS && styles.sosCardActive]}
          onPress={() => {
            setShowSOS(true);
            Alert.alert('🚨 SOS Activated', 'Emergency support is on the way. Stay safe!', [
              { text: 'OK', onPress: () => setShowSOS(false) }
            ]);
          }}
        >
          <Text style={styles.sosEmoji}>🚨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosTitle}>Emergency SOS</Text>
            <Text style={styles.sosSub}>Tap to alert support team immediately</Text>
          </View>
          <Text style={styles.sosArrow}>›</Text>
        </TouchableOpacity>

        {/* Active Deliveries */}
        {myOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚴 Active Deliveries ({myOrders.length})</Text>
            {myOrders.map(order => {
              const si = STATUS_INFO[order.status] || STATUS_INFO.pending;
              return (
                <View key={order.id} style={[styles.deliveryCard, { borderLeftColor: si.color }]}>
                  <View style={styles.deliveryTop}>
                    <Text style={styles.deliveryId}>#{order.id.slice(-6).toUpperCase()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: si.bg }]}>
                      <Text style={[styles.statusText, { color: si.color }]}>{si.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.customerName}>👤 {order.userName}</Text>
                  <Text style={styles.address}>📍 {order.address}</Text>
                  <View style={styles.itemsRow}>
                    {(order.items || []).slice(0, 3).map((item, i) => (
                      <Text key={i} style={styles.itemChip}>{item.emoji} {item.name}</Text>
                    ))}
                    {(order.items || []).length > 3 && <Text style={styles.itemChip}>+{(order.items || []).length - 3} more</Text>}
                  </View>
                  <View style={styles.earningPreview}>
                    <Text style={styles.earningAmt}>+₹{(order.deliveryFee || 30) + 5}</Text>
                    <Text style={styles.earningLabel}>• {timeAgo(order.createdAt)}</Text>
                  </View>
                  <View style={styles.deliveryActions}>
                    <TouchableOpacity
                      style={styles.navigateBtn}
                      onPress={() => navigation.navigate('ActiveDelivery', { orderId: order.id })}
                    >
                      <Text style={styles.navigateBtnText}>🗺️ Full Details</Text>
                    </TouchableOpacity>
                    {si.next && (
                      <TouchableOpacity
                        style={[styles.nextBtn, { backgroundColor: si.color }]}
                        onPress={() => handleStatusUpdate(order, si.next)}
                      >
                        <Text style={styles.nextBtnText}>{si.nextLabel}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Waiting State */}
        {myOrders.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>{partner?.isOnline ? '⏳' : '😴'}</Text>
            <Text style={styles.emptyTitle}>{partner?.isOnline ? 'Waiting for orders...' : 'You are offline'}</Text>
            <Text style={styles.emptyText}>{partner?.isOnline ? 'Orders will appear here automatically' : 'Toggle online to start receiving orders'}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.qSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            {[
              { icon: '💰', label: 'Earnings', onPress: () => navigation.navigate('Earnings') },
              { icon: '📋', label: 'History', onPress: () => navigation.navigate('History') },
              { icon: '🟢', label: 'Availability', onPress: () => navigation.navigate('Availability') },
              { icon: '👤', label: 'Profile', onPress: () => navigation.navigate('Profile') },
              { icon: '🆘', label: 'Support', onPress: () => navigation.navigate('Complaint') },
              { icon: '🚪', label: 'Logout', onPress: () => Alert.alert('Logout?', '', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }]) },
            ].map((a, i) => (
              <TouchableOpacity key={i} style={styles.qBtn} onPress={a.onPress}>
                <Text style={styles.qBtnIcon}>{a.icon}</Text>
                <Text style={styles.qBtnLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FFF4' },
  container: { flex: 1 },
  header: { backgroundColor: GREEN, paddingVertical: 16, paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 24) + 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  rating: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 },
  onlineToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 24, paddingVertical: 4, paddingHorizontal: 12 },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlineLabel: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 8, padding: 12 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  statLabel: { fontSize: 9, color: '#888', marginTop: 3, textAlign: 'center', fontWeight: '600' },
  progressCard: { backgroundColor: '#FFF', mx: 12, margin: 12, marginTop: 0, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { fontWeight: '800', color: '#1A1A2E', fontSize: 14 },
  progressCount: { fontWeight: '700', color: GREEN, fontSize: 13 },
  progressBarBg: { height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: GREEN, borderRadius: 5 },
  progressSub: { fontSize: 12, color: '#888', marginTop: 8 },
  sosCard: { margin: 12, marginTop: 0, backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: '#FECACA' },
  sosCardActive: { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },
  sosEmoji: { fontSize: 28 },
  sosTitle: { fontWeight: '800', color: '#DC2626', fontSize: 15 },
  sosSub: { fontSize: 12, color: '#EF4444', marginTop: 2 },
  sosArrow: { fontSize: 22, color: '#DC2626', fontWeight: '300' },
  section: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  deliveryCard: { backgroundColor: '#F9FFF9', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4 },
  deliveryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  deliveryId: { fontWeight: '800', color: '#1A1A2E', fontSize: 14 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  customerName: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  address: { fontSize: 12, color: '#666', marginBottom: 8 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  itemChip: { backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: 11, color: '#1B5E20' },
  earningPreview: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  earningAmt: { fontSize: 16, fontWeight: '800', color: GREEN },
  earningLabel: { fontSize: 12, color: '#888' },
  deliveryActions: { flexDirection: 'row', gap: 8 },
  navigateBtn: { flex: 1, backgroundColor: '#E3F2FD', borderRadius: 10, padding: 10, alignItems: 'center' },
  navigateBtnText: { color: '#1565C0', fontWeight: '700', fontSize: 13 },
  nextBtn: { flex: 2, borderRadius: 10, padding: 10, alignItems: 'center' },
  nextBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  emptyCard: { backgroundColor: '#FFF', margin: 12, borderRadius: 16, padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#888', textAlign: 'center' },
  qSection: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 16, padding: 16 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  qBtn: { width: '30%', flex: 0, backgroundColor: '#F9FFF9', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E8F5E9' },
  qBtnIcon: { fontSize: 22, marginBottom: 6 },
  qBtnLabel: { fontSize: 11, fontWeight: '700', color: '#333' },
});

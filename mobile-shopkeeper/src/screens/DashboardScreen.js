import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, getProducts, getNotifications, timeAgo } from '../constants/dataStore';

export default function DashboardScreen({ navigation }) {
  const { shop, shopkeeper, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!shop) return;
    setOrders(getOrders({ shopId: shop.id }));
    setProducts(getProducts(shop.id));
    setNotifications(getNotifications(false, null, shop.id).slice(0, 5));
  }, [shop]);

  useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, [load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); setTimeout(() => setRefreshing(false), 600); }, [load]);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.shopEarning || 0), 0);
  const activeOrders = orders.filter(o => ['accepted', 'dispatched'].includes(o.status));

  const KPI = [
    { label: 'Pending', value: pendingOrders.length, emoji: '📦', color: '#FF6B35', bg: '#FFF0EB' },
    { label: 'Active', value: activeOrders.length, emoji: '🚴', color: '#4CAF50', bg: '#F0FFF4' },
    { label: "Today's Orders", value: todayOrders.length, emoji: '🛍️', color: '#1976D2', bg: '#E8F4FD' },
    { label: "Today's Earning", value: `₹${todayRevenue}`, emoji: '💰', color: '#D97706', bg: '#FFFBEB' },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcome}>नमस्ते, {shopkeeper?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.shopName}>{shop?.emoji} {shop?.name}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: shop?.status === 'approved' ? '#DCFCE7' : '#FEF3C7' }]}>
          <Text style={{ color: shop?.status === 'approved' ? '#166534' : '#92400E', fontWeight: '700', fontSize: 11 }}>
            {shop?.status === 'approved' ? '✅ Active' : '⏳ Pending'}
          </Text>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        {KPI.map((k, i) => (
          <View key={i} style={[styles.kpiCard, { backgroundColor: k.bg }]}>
            <Text style={styles.kpiEmoji}>{k.emoji}</Text>
            <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
            <Text style={styles.kpiLabel}>{k.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Tools */}
      <View style={[styles.section, { paddingBottom: 0 }]}>
        <Text style={styles.sectionTitle}>🛠️ Quick Tools</Text>
        <View style={styles.quickGrid}>
          {[
            { label: 'Live Orders', emoji: '🔴', route: 'LiveOrderBoard', color: '#EF4444', bg: '#FEF2F2' },
            { label: 'Analytics', emoji: '📊', route: 'ShopAnalytics', color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Inventory', emoji: '📦', route: 'Inventory', color: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Promotions', emoji: '🎁', route: 'Promotions', color: '#22C55E', bg: '#F0FDF4' },
          ].map((tool, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.quickTool, { backgroundColor: tool.bg }]}
              onPress={() => navigation.navigate(tool.route)}>
              <Text style={{ fontSize: 26 }}>{tool.emoji}</Text>
              <Text style={[styles.quickToolLabel, { color: tool.color }]}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* All Time Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 All Time Performance</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statVal}>{shop?.totalOrders || 0}</Text><Text style={styles.statLabel}>Total Orders</Text></View>
          <View style={styles.divider} />
          <View style={styles.stat}><Text style={styles.statVal}>₹{((shop?.totalEarnings || 0) / 1000).toFixed(1)}K</Text><Text style={styles.statLabel}>Total Earnings</Text></View>
          <View style={styles.divider} />
          <View style={styles.stat}><Text style={styles.statVal}>⭐ {shop?.rating || '—'}</Text><Text style={styles.statLabel}>Rating</Text></View>
        </View>
      </View>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔔 New Orders ({pendingOrders.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          {pendingOrders.slice(0, 2).map(order => (
            <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}>
              <View style={styles.orderTop}>
                <Text style={styles.orderName}>{order.userName}</Text>
                <Text style={styles.orderTotal}>₹{order.total}</Text>
              </View>
              <Text style={styles.orderItems}>{(order.items || []).map(i => i.name).join(', ')}</Text>
              <Text style={styles.orderTime}>{timeAgo(order.createdAt)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>🔔 Recent Notifications</Text>
          {notifications.map(n => (
            <View key={n.id} style={[styles.notifItem, !n.read && styles.notifUnread]}>
              <Text style={styles.notifIcon}>{n.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifTime}>{timeAgo(n.time)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FF6B35', padding: 24, paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 24) + 16 },
  headerLeft: {},
  welcome: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  shopName: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 4 },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  kpiCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 8 },
  kpiValue: { fontSize: 22, fontWeight: '800' },
  kpiLabel: { fontSize: 11, color: '#666', fontWeight: '600', marginTop: 2 },
  section: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 16, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  seeAll: { color: '#FF6B35', fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },
  orderCard: { backgroundColor: '#F9F9FC', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#FF6B35' },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  orderName: { fontWeight: '700', color: '#1A1A2E', fontSize: 14 },
  orderTotal: { fontWeight: '800', color: '#FF6B35', fontSize: 15 },
  orderItems: { color: '#666', fontSize: 12, marginBottom: 4 },
  orderTime: { color: '#aaa', fontSize: 11 },
  notifItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, marginBottom: 6, gap: 12, backgroundColor: '#F9F9FC' },
  notifUnread: { backgroundColor: '#FFF0EB' },
  notifIcon: { fontSize: 20 },
  notifTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
  notifTime: { fontSize: 11, color: '#999', marginTop: 2 },
  quickGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', paddingBottom: 16 },
  quickTool: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  quickToolLabel: { fontSize: 12, fontWeight: '800' },
});

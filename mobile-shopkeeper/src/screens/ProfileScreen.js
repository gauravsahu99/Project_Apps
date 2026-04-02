import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  SafeAreaView, StatusBar, Platform, Switch, Modal, TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, getProducts } from '../constants/dataStore';
import BackButton from '../constants/BackButton';

const ACCENT = '#FF6B35';

export default function ProfileScreen({ navigation }) {
  const { shopkeeper, shop, logout } = useAuth();
  const orders = getOrders({ shopId: shop?.id });
  const products = getProducts(shop?.id);

  const [notifOn, setNotifOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(shopkeeper?.name || '');

  const completedOrders = orders.filter(o => o.status === 'delivered');
  const revenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const MenuRow = ({ icon, label, sublabel, onPress, right, danger }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? '#FEF2F2' : '#FFF3ED' }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && { color: '#EF4444' }]}>{label}</Text>
        {sublabel ? <Text style={styles.menuSub}>{sublabel}</Text> : null}
      </View>
      {right || <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={ACCENT} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          {/* Nav Row */}
          <View style={styles.headerNav}>
            <View style={{ zIndex: 1 }}>
              <BackButton navigation={navigation} fallback="Dashboard" label="Back" />
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerNavTitle}>My Profile</Text>
            </View>
            <TouchableOpacity style={styles.editHeaderBtn} onPress={() => setShowEditModal(true)}>
              <Text style={styles.editHeaderText}>✏️ Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar & Info */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{shopkeeper?.name?.[0]?.toUpperCase() || 'S'}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Text style={{ fontSize: 10 }}>🏪</Text>
            </View>
          </View>
          <Text style={styles.name}>{shopkeeper?.name}</Text>
          <Text style={styles.phone}>📱 {shopkeeper?.phone}</Text>
          <View style={[styles.statusBadge, { backgroundColor: shop?.status === 'approved' ? 'rgba(34,197,94,0.25)' : 'rgba(251,191,36,0.25)' }]}>
            <Text style={{ color: shop?.status === 'approved' ? '#16A34A' : '#D97706', fontWeight: '800', fontSize: 13 }}>
              {shop?.status === 'approved' ? '✅ Active Shop' : '⏳ Pending Approval'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { val: orders.length, label: 'Total Orders', color: '#FF6B35' },
            { val: `₹${(revenue / 1000).toFixed(1)}K`, label: 'Revenue', color: '#22C55E' },
            { val: products.filter(p => p.isActive).length, label: 'Live Items', color: '#1976D2' },
            { val: shop?.rating > 0 ? `${shop.rating}⭐` : 'N/A', label: 'Rating', color: '#F59E0B' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Shop Details */}
        {shop && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🏪 Shop Details</Text>
            {[
              { icon: '🏷️', label: 'Shop Name', val: shop.name },
              { icon: shop.emoji || '🏪', label: 'Category', val: shop.category },
              { icon: '📍', label: 'Address', val: shop.address },
              { icon: '🏙️', label: 'City', val: shop.city },
              { icon: '💰', label: 'Commission Rate', val: `${shop.commissionRate || 10}%` },
              { icon: '⏰', label: 'Operating Hours', val: shop.operatingHours || '9:00 AM – 9:00 PM' },
            ].map((r, i) => (
              <View key={i} style={styles.infoRow}>
                <Text style={styles.infoIcon}>{r.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{r.label}</Text>
                  <Text style={styles.infoValue}>{r.val}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionGrid}>
            {[
              { icon: '📊', label: 'Analytics', onPress: () => navigation.navigate('ShopAnalytics') },
              { icon: '📦', label: 'Inventory', onPress: () => navigation.navigate('Inventory') },
              { icon: '📣', label: 'Promotions', onPress: () => navigation.navigate('Promotions') },
              { icon: '📋', label: 'Live Board', onPress: () => navigation.navigate('LiveOrderBoard') },
            ].map((a, i) => (
              <TouchableOpacity key={i} style={styles.actionBtn} onPress={a.onPress}>
                <Text style={{ fontSize: 24 }}>{a.icon}</Text>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Settings</Text>
          <MenuRow
            icon="🔔" label="Order Notifications" sublabel="Sound alerts for new orders"
            right={<Switch value={notifOn} onValueChange={setNotifOn} trackColor={{ true: ACCENT }} />}
          />
          <MenuRow
            icon="🔊" label="Alert Sound" sublabel="Play sound on new order"
            right={<Switch value={soundOn} onValueChange={setSoundOn} trackColor={{ true: ACCENT }} />}
          />
          <MenuRow icon="🔐" label="Change Password" onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon.')} />
          <MenuRow icon="🌐" label="Language" sublabel="Hindi / English" onPress={() => Alert.alert('Coming Soon', 'Language settings coming soon.')} />
        </View>

        {/* Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💬 Support</Text>
          <MenuRow icon="🆘" label="File a Complaint" sublabel="Report issues or problems" onPress={() => navigation.navigate('Complaint')} />
          <MenuRow icon="📞" label="Call Support" sublabel="9876543001" onPress={() => Alert.alert('Support', 'Calling: 9876543001')} />
          <MenuRow icon="❓" label="FAQ & Help" onPress={() => Alert.alert('FAQ', 'FAQ section coming soon.')} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Apna Betul Shopkeeper v2.0</Text>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>✏️ Edit Profile</Text>
            <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} placeholder="Your name" />
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalBtnText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F9FC' },
  header: { backgroundColor: ACCENT, paddingBottom: 24 },
  headerNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 24) + 16, paddingBottom: 16,
  },
  headerTitleContainer: {
    position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center', justifyContent: 'center', zIndex: 0
  },
  headerNavTitle: { textAlign: 'center', color: '#FFF', fontSize: 16, fontWeight: '800' },
  editHeaderBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, zIndex: 1 },
  editHeaderText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  avatarWrap: { position: 'relative', marginBottom: 10, marginTop: 4, alignSelf: 'center' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#FFF' },
  avatarBadge: { position: 'absolute', right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: ACCENT },
  name: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 4, textAlign: 'center' },
  phone: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginBottom: 12, textAlign: 'center' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, alignSelf: 'center', marginTop: 4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 16, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 18, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F9F9FC' },
  infoIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  infoLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, color: '#1A1A2E', fontWeight: '600', marginTop: 2 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn: { alignItems: 'center', gap: 6, flex: 1 },
  actionLabel: { fontSize: 11, color: '#555', fontWeight: '700' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9F9FC' },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  menuSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  menuArrow: { fontSize: 20, color: '#D1D5DB', fontWeight: '300' },
  logoutBtn: { backgroundColor: '#FFF', margin: 12, marginTop: 12, marginBottom: 4, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#FEE2E2' },
  logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 16 },
  version: { textAlign: 'center', fontSize: 11, color: '#C4C4C4', marginBottom: 32, marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 16 },
  modalInput: { backgroundColor: '#F9F9FC', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1A1A2E', borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 16 },
  modalBtn: { backgroundColor: ACCENT, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10 },
  modalBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  modalCancel: { textAlign: 'center', color: '#9CA3AF', fontSize: 15, paddingVertical: 8 },
});

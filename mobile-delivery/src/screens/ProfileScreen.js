import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  SafeAreaView, StatusBar, Platform, Switch, Modal,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../constants/BackButton';

const ACCENT = '#4CAF50';

export default function ProfileScreen({ navigation }) {
  const { partner, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(partner?.isOnline || false);
  const [notifOn, setNotifOn] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'You will go offline and logout.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const MenuRow = ({ icon, label, sublabel, onPress, right, danger }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? '#FEF2F2' : '#F0FDF4' }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && { color: '#EF4444' }]}>{label}</Text>
        {sublabel ? <Text style={styles.menuSub}>{sublabel}</Text> : null}
      </View>
      {right || <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );

  const todayEarnings = partner?.todayEarnings || 0;
  const totalDeliveries = partner?.totalDeliveries || 0;
  const rating = partner?.rating || 5.0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={ACCENT} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          {/* Nav Row */}
          <View style={styles.headerNav}>
            <View style={{ zIndex: 1 }}>
              <BackButton navigation={navigation} fallback="Home" />
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerNavTitle}>My Profile</Text>
            </View>
            <View style={[styles.onlineToggleRow, { zIndex: 1 }]}>
              <Text style={styles.onlineLabel}>{isOnline ? '🟢' : '⚪'}</Text>
              <Switch
                value={isOnline}
                onValueChange={setIsOnline}
                trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#22C55E' }}
                thumbColor="#FFF"
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
            </View>
          </View>

          {/* Avatar & Info */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{partner?.name?.[0]?.toUpperCase() || 'D'}</Text>
            </View>
            <View style={[styles.onlineDot, { backgroundColor: isOnline ? '#22C55E' : '#9CA3AF' }]} />
          </View>
          <Text style={styles.name}>{partner?.name || 'Delivery Partner'}</Text>
          <Text style={styles.phone}>📱 {partner?.phone || '—'}</Text>
          <Text style={styles.onlineStatus}>{isOnline ? '🟢 Online – Ready to deliver' : '⚪ Offline'}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { val: partner?.todayDeliveries || 0, label: 'Today', color: ACCENT },
            { val: `₹${todayEarnings}`, label: 'Today Earned', color: '#F59E0B' },
            { val: totalDeliveries, label: 'All Time', color: '#1976D2' },
            { val: `${rating}⭐`, label: 'Rating', color: '#EC4899' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Performance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Performance</Text>
          <View style={styles.perfRow}>
            <View style={styles.perfBar}>
              <Text style={styles.perfLabel}>Acceptance Rate</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: '87%', backgroundColor: ACCENT }]} />
              </View>
              <Text style={styles.perfPct}>87%</Text>
            </View>
            <View style={styles.perfBar}>
              <Text style={styles.perfLabel}>On-Time Rate</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: '92%', backgroundColor: '#1976D2' }]} />
              </View>
              <Text style={styles.perfPct}>92%</Text>
            </View>
            <View style={styles.perfBar}>
              <Text style={styles.perfLabel}>Customer Rating</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${(rating / 5) * 100}%`, backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.perfPct}>{rating}/5.0</Text>
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Profile Details</Text>
          {[
            { icon: '🏙️', label: 'City', val: partner?.city || 'Betul' },
            { icon: '📦', label: 'Total Deliveries', val: totalDeliveries },
            { icon: '💰', label: 'Total Earnings', val: `₹${(partner?.totalEarnings || 0).toLocaleString()}` },
            { icon: '📅', label: 'Member Since', val: partner?.createdAt ? new Date(partner.createdAt).toLocaleDateString('hi-IN') : '—' },
            { icon: '🚴', label: 'Vehicle Type', val: partner?.vehicleType || 'Bicycle' },
            { icon: '📄', label: 'License No.', val: partner?.licenseNo || 'DL-0420110012345' },
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

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Quick Navigation</Text>
          <View style={styles.actionGrid}>
            {[
              { icon: '💰', label: 'Earnings', onPress: () => navigation.navigate('Earnings') },
              { icon: '📋', label: 'History', onPress: () => navigation.navigate('History') },
              { icon: '🟢', label: 'Availability', onPress: () => navigation.navigate('Availability') },
              { icon: '📊', label: 'Details', onPress: () => navigation.navigate('EarningsDetail') },
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
          <MenuRow icon="🔔" label="Push Notifications" sublabel="Order & payment alerts" right={<Switch value={notifOn} onValueChange={setNotifOn} trackColor={{ true: ACCENT }} />} />
          <MenuRow icon="🌐" label="Language" sublabel="Hindi / English" onPress={() => Alert.alert('Coming Soon')} />
          <MenuRow icon="🔐" label="Privacy Policy" onPress={() => Alert.alert('Privacy', 'Privacy Policy will be shown here.')} />
        </View>

        {/* Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💬 Support</Text>
          <MenuRow icon="🆘" label="File a Complaint" sublabel="Report problems" onPress={() => navigation.navigate('Complaint')} />
          <MenuRow icon="📞" label="Emergency Support" sublabel="Call: 9876543000" onPress={() => Alert.alert('Support', 'Calling: 9876543000')} />
          <MenuRow icon="📋" label="Terms of Service" onPress={() => Alert.alert('Terms', 'Terms will be shown here.')} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪 Logout & Go Offline</Text>
        </TouchableOpacity>
        <Text style={styles.version}>Apna Betul Delivery v2.0</Text>
      </ScrollView>
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
  onlineToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineLabel: { color: '#FFF', fontSize: 18 },
  avatarWrap: { position: 'relative', marginTop: 4, marginBottom: 10, alignSelf: 'center' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#FFF' },
  onlineDot: { position: 'absolute', right: 2, bottom: 2, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: ACCENT },
  name: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 4, textAlign: 'center' },
  phone: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8, textAlign: 'center' },
  onlineStatus: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 16, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 18, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 },
  perfRow: { gap: 12 },
  perfBar: { gap: 4 },
  perfLabel: { fontSize: 13, color: '#555', fontWeight: '600' },
  barBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  perfPct: { fontSize: 12, fontWeight: '700', color: '#1A1A2E', textAlign: 'right' },
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
});

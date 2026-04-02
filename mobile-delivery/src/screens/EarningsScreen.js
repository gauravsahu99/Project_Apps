import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function EarningsScreen() {
  const { partner, refreshPartner } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => { setRefreshing(true); refreshPartner(); setTimeout(() => setRefreshing(false), 500); };

  const STATS = [
    { label: "Today's Deliveries", value: partner?.todayDeliveries || 0, emoji: '📦', color: '#1976D2', bg: '#E8F4FD' },
    { label: "Today's Earnings", value: `₹${partner?.todayEarnings || 0}`, emoji: '💰', color: '#22C55E', bg: '#F0FFF4' },
    { label: 'Total Deliveries', value: partner?.totalDeliveries || 0, emoji: '🏆', color: '#D97706', bg: '#FFFBEB' },
    { label: 'Total Earnings', value: `₹${(partner?.totalEarnings || 0).toLocaleString()}`, emoji: '💳', color: '#7C3AED', bg: '#F5F3FF' },
  ];

  const perDelivery = partner?.totalDeliveries ? Math.round((partner.totalEarnings || 0) / partner.totalDeliveries) : 30;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />}>
      {/* Stats */}
      <View style={styles.statsGrid}>
        {STATS.map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <Text style={styles.statEmoji}>{s.emoji}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 Earnings Breakdown</Text>
        <InfoRow label="Per Delivery" value={`₹30–50`} />
        <InfoRow label="Avg per Delivery" value={`₹${perDelivery}`} />
        <InfoRow label="Total Deliveries" value={`${partner?.totalDeliveries || 0}`} />
        <InfoRow label="Rating" value={`⭐ ${partner?.rating || 5.0}`} />
      </View>

      {/* How It Works */}
      <View style={[styles.card, { marginBottom: 40 }]}>
        <Text style={styles.cardTitle}>ℹ️ How Earnings Work</Text>
        <Text style={styles.howText}>• You earn ₹30–50 per successful delivery</Text>
        <Text style={styles.howText}>• Higher ratings = more order allocation</Text>
        <Text style={styles.howText}>• Be online during morning hours for more orders</Text>
        <Text style={styles.howText}>• Payments settled weekly via UPI</Text>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FC' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center' },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#666', fontWeight: '600', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#888', textTransform: 'uppercase', marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoLabel: { fontSize: 14, color: '#555', fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#1A1A2E', fontWeight: '700' },
  howText: { fontSize: 13, color: '#555', marginBottom: 8, lineHeight: 20 },
});

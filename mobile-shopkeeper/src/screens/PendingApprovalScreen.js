import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function PendingApprovalScreen() {
  const { shop, logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.title}>Shop Under Review</Text>
      <Text style={styles.subtitle}>
        Your shop <Text style={styles.shopName}>"{shop?.name}"</Text> is pending approval from the Apna Betul admin team.
      </Text>
      <View style={styles.card}>
        <Text style={styles.step}>✅ Shop details submitted</Text>
        <Text style={styles.step}>🔄 Admin review in progress...</Text>
        <Text style={[styles.step, { color: '#bbb' }]}>⬜ Approval & activation</Text>
      </View>
      <Text style={styles.note}>⏱️ Usually takes 24-48 hours. You'll receive a notification once approved.</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>← Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5', justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 72, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A2E', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  shopName: { color: '#FF6B35', fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '100%', gap: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, marginBottom: 24 },
  step: { fontSize: 15, fontWeight: '600', color: '#333' },
  note: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  logoutBtn: { padding: 12 },
  logoutText: { color: '#FF6B35', fontWeight: '700', fontSize: 15 },
});

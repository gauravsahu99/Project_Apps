import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, SafeAreaView, StatusBar, Platform, Modal,
} from 'react-native';
import BackButton from '../constants/BackButton';

const CATEGORIES = [
  { id: 'order', emoji: '📦', label: 'Order Issue' },
  { id: 'delivery', emoji: '🚴', label: 'Delivery Problem' },
  { id: 'payment', emoji: '💳', label: 'Payment Issue' },
  { id: 'product', emoji: '🛒', label: 'Wrong Product' },
  { id: 'shop', emoji: '🏪', label: 'Shop Complaint' },
  { id: 'app', emoji: '📱', label: 'App Problem' },
  { id: 'refund', emoji: '💰', label: 'Refund Request' },
  { id: 'other', emoji: '❓', label: 'Other' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#22C55E', bg: '#F0FDF4' },
  { id: 'medium', label: 'Medium', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'high', label: 'High', color: '#EF4444', bg: '#FEF2F2' },
];

const PAST_COMPLAINTS = [
  { id: 'CMP001', category: 'ORDER', title: 'Order was delivered late', status: 'resolved', date: '20 Mar 2026', priority: 'medium' },
  { id: 'CMP002', category: 'PAYMENT', title: 'Double charged for order', status: 'in_review', date: '22 Mar 2026', priority: 'high' },
];

export default function ComplaintScreen({ navigation }) {
  const [tab, setTab] = useState('new'); // 'new' | 'history'
  const [category, setCategory] = useState(null);
  const [priority, setPriority] = useState('medium');
  const [orderId, setOrderId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    if (!category) { Alert.alert('Select Category', 'Please choose a complaint category.'); return; }
    if (!title.trim()) { Alert.alert('Add Title', 'Please enter a short title for your complaint.'); return; }
    if (!description.trim() || description.length < 20) {
      Alert.alert('More Details', 'Please describe your issue in at least 20 characters.'); return;
    }
    setShowSuccess(true);
    setSubmitted(true);
  };

  const resetForm = () => {
    setCategory(null); setPriority('medium'); setOrderId('');
    setTitle(''); setDescription(''); setShowSuccess(false);
  };

  const statusColor = (s) => s === 'resolved' ? '#22C55E' : s === 'in_review' ? '#F59E0B' : '#1976D2';
  const statusLabel = (s) => s === 'resolved' ? '✅ Resolved' : s === 'in_review' ? '🔍 In Review' : '🕐 Pending';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
      <View style={styles.header}>
        <BackButton navigation={navigation} fallback="Main" style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🆘 Help & Complaints</Text>
          <Text style={styles.headerSub}>We respond within 24 hours</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'new' && styles.tabActive]} onPress={() => setTab('new')}>
          <Text style={[styles.tabText, tab === 'new' && styles.tabTextActive]}>📝 New Complaint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>📋 My Complaints</Text>
        </TouchableOpacity>
      </View>

      {tab === 'new' ? (
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Quick Support */}
          <View style={styles.quickSupport}>
            <Text style={styles.sectionTitle}>⚡ Quick Support</Text>
            <View style={styles.quickBtns}>
              <TouchableOpacity style={styles.quickBtn}>
                <Text style={styles.quickEmoji}>📞</Text>
                <Text style={styles.quickLabel}>Call Us</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn}>
                <Text style={styles.quickEmoji}>💬</Text>
                <Text style={styles.quickLabel}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn}>
                <Text style={styles.quickEmoji}>📧</Text>
                <Text style={styles.quickLabel}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn}>
                <Text style={styles.quickEmoji}>❓</Text>
                <Text style={styles.quickLabel}>FAQ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category */}
          <Text style={styles.sectionTitle}>📂 Issue Category *</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catCard, category === c.id && styles.catCardActive]}
                onPress={() => setCategory(c.id)}
              >
                <Text style={styles.catEmoji}>{c.emoji}</Text>
                <Text style={[styles.catLabel, category === c.id && styles.catLabelActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Priority */}
          <Text style={styles.sectionTitle}>🚨 Priority Level</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.priorityBtn, { backgroundColor: p.bg, borderColor: priority === p.id ? p.color : '#E5E7EB' }]}
                onPress={() => setPriority(p.id)}
              >
                <Text style={[styles.priorityLabel, { color: p.color }]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Order ID */}
          <Text style={styles.sectionTitle}>📦 Order ID (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ORD123456"
            placeholderTextColor="#C4C4C4"
            value={orderId}
            onChangeText={setOrderId}
          />

          {/* Title */}
          <Text style={styles.sectionTitle}>📝 Complaint Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Short title of your issue"
            placeholderTextColor="#C4C4C4"
            value={title}
            onChangeText={setTitle}
            maxLength={80}
          />

          {/* Description */}
          <Text style={styles.sectionTitle}>📄 Describe Your Issue *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Please describe the issue in detail (min. 20 characters)..."
            placeholderTextColor="#C4C4C4"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.submitText}>🚀 Submit Complaint</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>📌 Our team reviews all complaints within 24 hours. For urgent issues, please call 9876543000.</Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>📋 Your Complaints</Text>
          {PAST_COMPLAINTS.map(c => (
            <View key={c.id} style={styles.complaintCard}>
              <View style={styles.complaintTop}>
                <Text style={styles.complaintId}>#{c.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(c.status) + '22' }]}>
                  <Text style={[styles.statusText, { color: statusColor(c.status) }]}>{statusLabel(c.status)}</Text>
                </View>
              </View>
              <Text style={styles.complaintTitle}>{c.title}</Text>
              <View style={styles.complaintMeta}>
                <Text style={styles.metaText}>📂 {c.category}</Text>
                <Text style={styles.metaText}>📅 {c.date}</Text>
              </View>
            </View>
          ))}
          {submitted && (
            <View style={styles.complaintCard}>
              <View style={styles.complaintTop}>
                <Text style={styles.complaintId}>#CMP00{PAST_COMPLAINTS.length + 1}</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#1976D222' }]}>
                  <Text style={[styles.statusText, { color: '#1976D2' }]}>🕐 Pending</Text>
                </View>
              </View>
              <Text style={styles.complaintTitle}>{title}</Text>
              <View style={styles.complaintMeta}>
                <Text style={styles.metaText}>📂 {category?.toUpperCase()}</Text>
                <Text style={styles.metaText}>📅 Today</Text>
              </View>
            </View>
          )}
          {!submitted && PAST_COMPLAINTS.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>😊</Text>
              <Text style={styles.emptyText}>No complaints yet!</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ fontSize: 56, textAlign: 'center' }}>✅</Text>
            <Text style={styles.modalTitle}>Complaint Submitted!</Text>
            <Text style={styles.modalSub}>Ticket ID: #CMP00{PAST_COMPLAINTS.length + 1}</Text>
            <Text style={styles.modalMessage}>Our support team will review your complaint and respond within 24 hours.</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => { setShowSuccess(false); setTab('history'); }}>
              <Text style={styles.modalBtnText}>View My Complaints</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnOutline} onPress={resetForm}>
              <Text style={styles.modalBtnOutlineText}>Submit Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FF6B35' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 12, paddingBottom: 16,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  backIcon: { color: '#FFF', fontSize: 20, fontWeight: '700', marginTop: -2 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  tabRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16, marginBottom: 0, borderRadius: 14, padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFF' },
  tabText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  tabTextActive: { color: '#FF6B35' },
  formContainer: { padding: 16, paddingBottom: 40, backgroundColor: '#F9F9FC', marginTop: 4, minHeight: '100%' },
  quickSupport: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16 },
  quickBtns: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  quickBtn: { alignItems: 'center', gap: 6 },
  quickEmoji: { fontSize: 28, backgroundColor: '#FFF3ED', borderRadius: 12, padding: 10, overflow: 'hidden' },
  quickLabel: { fontSize: 11, color: '#555', fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#444', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10, marginTop: 4 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  catCard: {
    width: '22%', aspectRatio: 1, borderRadius: 14, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F3F4F6',
  },
  catCardActive: { borderColor: '#FF6B35', backgroundColor: '#FFF3ED' },
  catEmoji: { fontSize: 22, marginBottom: 4 },
  catLabel: { fontSize: 9, color: '#888', fontWeight: '600', textAlign: 'center' },
  catLabelActive: { color: '#FF6B35' },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  priorityBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 2 },
  priorityLabel: { fontWeight: '800', fontSize: 14 },
  input: {
    backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#1A1A2E', borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 16,
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', color: '#9CA3AF', fontSize: 12, marginTop: -12, marginBottom: 16 },
  submitBtn: {
    backgroundColor: '#FF6B35', borderRadius: 16, padding: 18, alignItems: 'center',
    marginBottom: 16, shadowColor: '#FF6B35', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  submitText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  infoBox: { backgroundColor: '#FFF3ED', borderRadius: 14, padding: 14, borderLeftWidth: 4, borderLeftColor: '#FF6B35' },
  infoText: { color: '#555', fontSize: 13, lineHeight: 20 },
  complaintCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  complaintTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  complaintId: { fontSize: 12, fontWeight: '800', color: '#9CA3AF' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  complaintTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  complaintMeta: { flexDirection: 'row', gap: 16 },
  metaText: { fontSize: 12, color: '#888' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#888', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginTop: 8, marginBottom: 4 },
  modalSub: { fontSize: 14, color: '#FF6B35', fontWeight: '700', marginBottom: 12 },
  modalMessage: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  modalBtn: { backgroundColor: '#FF6B35', borderRadius: 14, padding: 14, width: '100%', alignItems: 'center', marginBottom: 10 },
  modalBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  modalBtnOutline: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, padding: 14, width: '100%', alignItems: 'center' },
  modalBtnOutlineText: { color: '#555', fontWeight: '700', fontSize: 15 },
});

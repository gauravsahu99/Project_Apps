import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  SafeAreaView, StatusBar, Platform, Linking, Modal, TextInput,
} from 'react-native';
import { getOrders, updateOrderStatus } from '../constants/dataStore';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../constants/BackButton';

const STEPS = [
  { key: 'accepted', emoji: '✅', label: 'Accepted' },
  { key: 'dispatched', emoji: '🛍️', label: 'Picked Up' },
  { key: 'on_the_way', emoji: '🚴', label: 'On The Way' },
  { key: 'delivered', emoji: '🎉', label: 'Delivered' },
];

const STEP_INDEX = { accepted: 0, dispatched: 1, on_the_way: 2, delivered: 3 };

export default function ActiveDeliveryScreen({ route, navigation }) {
  const { orderId } = route.params;
  const { refreshPartner } = useAuth();
  const [order, setOrder] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Simulated OTP for demo
  const DELIVERY_OTP = '4521';

  useEffect(() => {
    const load = () => {
      const all = getOrders();
      setOrder(all.find(o => o.id === orderId) || null);
    };
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, [orderId]);

  if (!order) return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9FC' }}>
      <Text style={{ fontSize: 32 }}>⏳</Text>
      <Text style={{ fontSize: 16, color: '#888', marginTop: 8 }}>Loading order...</Text>
    </SafeAreaView>
  );

  const stepIdx = STEP_INDEX[order.status] ?? 0;

  const handleMarkPickedUp = () => {
    Alert.alert('Picked Up?', 'Have you collected the order from the shop?', [
      { text: 'Cancel', style: 'cancel' },
      { text: '🛍️ Yes, Picked Up', onPress: () => { updateOrderStatus(orderId, 'dispatched'); } },
    ]);
  };

  const handleMarkOnWay = () => {
    Alert.alert('On The Way?', 'Confirm you are on your way to customer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: '🚴 Yes, On The Way', onPress: () => { updateOrderStatus(orderId, 'on_the_way'); } },
    ]);
  };

  const handleVerifyOTP = () => {
    if (otpInput === DELIVERY_OTP) {
      updateOrderStatus(orderId, 'delivered');
      refreshPartner();
      setShowOtpModal(false);
      Alert.alert('🎉 Delivered!', `₹${order.deliveryFee || 30} credited to your wallet!`, [
        { text: 'Great!', onPress: () => { if (navigation.canGoBack()) navigation.goBack(); else navigation.navigate('Home'); } }
      ]);
    } else {
      Alert.alert('Wrong OTP', 'The OTP entered is incorrect. Please try again.');
    }
  };

  const handleCallCustomer = () => {
    if (order.phone) {
      Linking.openURL(`tel:${order.phone}`);
    } else {
      Alert.alert('No Number', 'Customer phone number not available.');
    }
  };

  const handleOpenMaps = () => {
    const address = encodeURIComponent(order.address || 'Betul, MP');
    Linking.openURL(`https://maps.google.com/?q=${address}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* Header */}
      <View style={styles.header}>
        <BackButton navigation={navigation} fallback="Home" />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🚴 Active Delivery</Text>
          <Text style={styles.headerSub}>#{order.id.slice(-8).toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={handleCallCustomer}>
          <Text style={{ fontSize: 20 }}>📞</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map / Navigation */}
        <TouchableOpacity style={styles.mapCard} onPress={handleOpenMaps} activeOpacity={0.85}>
          <Text style={styles.mapEmoji}>🗺️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.mapTitle}>Open Navigation</Text>
            <Text style={styles.mapAddress} numberOfLines={2}>📍 {order.address}</Text>
          </View>
          <View style={styles.mapsChip}>
            <Text style={styles.mapsChipText}>Google Maps →</Text>
          </View>
        </TouchableOpacity>

        {/* Progress Tracker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Delivery Progress</Text>
          <View style={styles.stepsRow}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step.key}>
                <View style={styles.stepCol}>
                  <View style={[styles.stepCircle, i <= stepIdx && styles.stepDone, i === stepIdx && styles.stepCurrent]}>
                    <Text style={styles.stepEmoji}>{i <= stepIdx ? step.emoji : '○'}</Text>
                  </View>
                  <Text style={[styles.stepLabel, i <= stepIdx && styles.stepLabelDone]}>{step.label}</Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepLine, i < stepIdx && styles.stepLineDone]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Customer Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>👤</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{order.userName || '—'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{order.phone || '—'}</Text>
            </View>
            <TouchableOpacity style={styles.callSmallBtn} onPress={handleCallCustomer}>
              <Text style={styles.callSmallText}>Call</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{order.address}</Text>
            </View>
          </View>
          {order.slot && (
            <View style={styles.infoRow}>
              <Text style={styles.infoEmoji}>⏰</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Delivery Slot</Text>
                <Text style={styles.infoValue}>{order.slot}</Text>
              </View>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Payment Mode</Text>
              <Text style={[styles.infoValue, { color: order.payment === 'cod' ? '#EF4444' : '#22C55E', fontWeight: '800' }]}>
                {order.payment === 'cod' ? '💵 Cash on Delivery' : '✅ Prepaid'}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛍️ Order Items</Text>
          {(order.items || []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemEmoji}>{item.emoji || '📦'}</Text>
              <Text style={styles.itemName}>{item.name} × {item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalAmt}>₹{order.total}</Text>
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.earningsCard}>
          <Text style={styles.cardTitle}>💰 Your Earnings</Text>
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>Delivery Fee</Text>
            <Text style={styles.earningAmt}>₹{order.deliveryFee || 30}</Text>
          </View>
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>Distance Bonus</Text>
            <Text style={styles.earningAmt}>₹5</Text>
          </View>
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>Peak Hour Bonus</Text>
            <Text style={styles.earningAmt}>₹0</Text>
          </View>
          <View style={[styles.earningRow, { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 8, paddingTop: 8 }]}>
            <Text style={[styles.earningLabel, { fontWeight: '800', color: '#1A1A2E' }]}>Total for This Delivery</Text>
            <Text style={[styles.earningAmt, { fontSize: 20, color: '#4CAF50', fontWeight: '900' }]}>₹{(order.deliveryFee || 30) + 5}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        {order.status !== 'delivered' && (
          <View style={styles.actionsCard}>
            {order.status === 'accepted' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1976D2' }]} onPress={handleMarkPickedUp}>
                <Text style={styles.actionBtnText}>🛍️ Mark Picked Up from Shop</Text>
              </TouchableOpacity>
            )}
            {order.status === 'dispatched' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF9800' }]} onPress={handleMarkOnWay}>
                <Text style={styles.actionBtnText}>🚴 Mark On The Way</Text>
              </TouchableOpacity>
            )}
            {order.status === 'on_the_way' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]} onPress={() => setShowOtpModal(true)}>
                <Text style={styles.actionBtnText}>🔐 Verify OTP & Mark Delivered</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.callLargeBtn} onPress={handleCallCustomer}>
              <Text style={styles.callLargeText}>📞 Call Customer</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'delivered' && (
          <View style={[styles.actionsCard, { backgroundColor: '#F0FDF4' }]}>
            <Text style={{ textAlign: 'center', fontSize: 40 }}>🎉</Text>
            <Text style={{ textAlign: 'center', fontWeight: '800', fontSize: 18, color: '#22C55E', marginTop: 8 }}>Delivery Complete!</Text>
            <Text style={{ textAlign: 'center', color: '#555', marginTop: 4 }}>₹{(order.deliveryFee || 30) + 5} has been added to your wallet.</Text>
          </View>
        )}
      </ScrollView>

      {/* OTP Modal */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>🔐</Text>
            <Text style={styles.modalTitle}>Enter Delivery OTP</Text>
            <Text style={styles.modalSub}>Ask the customer for the 4-digit OTP to confirm delivery</Text>
            <TextInput
              style={styles.otpInput}
              value={otpInput}
              onChangeText={setOtpInput}
              placeholder="Enter OTP"
              keyboardType="number-pad"
              maxLength={4}
              textAlign="center"
            />
            <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>Demo OTP: 4521</Text>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]} onPress={handleVerifyOTP}>
              <Text style={styles.modalBtnText}>✅ Verify & Complete Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowOtpModal(false); setOtpInput(''); }}>
              <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 12 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F9FC' },
  header: { backgroundColor: '#1976D2', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 10 : 12, paddingBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  backIcon: { color: '#FFF', fontSize: 20, fontWeight: '700', marginTop: -2 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  mapCard: { margin: 12, marginBottom: 0, backgroundColor: '#E3F2FD', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  mapEmoji: { fontSize: 36 },
  mapTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A2E' },
  mapAddress: { fontSize: 13, color: '#555', marginTop: 2 },
  mapsChip: { backgroundColor: '#1976D2', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  mapsChipText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 18, padding: 16 },
  cardTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  stepsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepCol: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  stepDone: { backgroundColor: '#4CAF50' },
  stepCurrent: { backgroundColor: '#1976D2', shadowColor: '#1976D2', shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
  stepEmoji: { fontSize: 14 },
  stepLabel: { fontSize: 9, color: '#C4C4C4', fontWeight: '600', textAlign: 'center' },
  stepLabelDone: { color: '#22C55E', fontWeight: '800' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginTop: 19 },
  stepLineDone: { backgroundColor: '#4CAF50' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F9F9FC' },
  infoEmoji: { fontSize: 18, width: 28, textAlign: 'center' },
  infoLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, color: '#1A1A2E', fontWeight: '600', marginTop: 2 },
  callSmallBtn: { backgroundColor: '#E3F2FD', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  callSmallText: { color: '#1976D2', fontWeight: '700', fontSize: 13 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F9F9FC' },
  itemEmoji: { fontSize: 20 },
  itemName: { flex: 1, fontSize: 14, color: '#333' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 4 },
  totalLabel: { fontWeight: '800', color: '#1A1A2E', fontSize: 15 },
  totalAmt: { fontWeight: '900', color: '#1A1A2E', fontSize: 18 },
  earningsCard: { backgroundColor: '#F0FDF4', margin: 12, marginBottom: 0, borderRadius: 18, padding: 16, borderWidth: 1.5, borderColor: '#BBF7D0' },
  earningRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  earningLabel: { fontSize: 14, color: '#555' },
  earningAmt: { fontSize: 14, fontWeight: '700', color: '#22C55E' },
  actionsCard: { margin: 12, gap: 10, marginBottom: 32 },
  actionBtn: { borderRadius: 16, padding: 18, alignItems: 'center', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  actionBtnText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  callLargeBtn: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#1976D2' },
  callLargeText: { color: '#1976D2', fontWeight: '800', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', textAlign: 'center', marginTop: 8, marginBottom: 8 },
  modalSub: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  otpInput: { backgroundColor: '#F9F9FC', borderRadius: 14, padding: 18, fontSize: 28, fontWeight: '800', color: '#1A1A2E', borderWidth: 2, borderColor: '#4CAF50', letterSpacing: 12, marginBottom: 8 },
  modalBtn: { borderRadius: 16, padding: 16, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: '800', fontSize: 17 },
});

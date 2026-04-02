import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { sendOTP, verifyOTP, isLoading } = useAuth();

  const handleSend = async () => {
    if (phone.replace(/\s/g, '').length < 10) { Alert.alert('Error', 'Enter a valid 10-digit number'); return; }
    const res = await sendOTP(phone);
    if (res.success) setOtpSent(true);
  };

  const handleVerify = async () => {
    if (otp.length < 4) { Alert.alert('Error', 'Enter valid OTP'); return; }
    const res = await verifyOTP(phone, otp);
    if (!res.success) Alert.alert('Error', res.message);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🚴</Text>
          <Text style={styles.title}>Delivery Partner</Text>
          <Text style={styles.subtitle}>Join Apna Betul Delivery Team</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>📱 Phone Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.code}><Text style={styles.codeText}>+91</Text></View>
            <TextInput style={styles.input} placeholder="9876543210" placeholderTextColor="#bbb" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} editable={!otpSent} />
          </View>

          {!otpSent ? (
            <TouchableOpacity style={styles.btn} onPress={handleSend} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP →</Text>}
            </TouchableOpacity>
          ) : (
            <>
              <Text style={[styles.label, { marginTop: 20 }]}>🔐 Enter OTP</Text>
              <TextInput style={[styles.input, styles.otpInput]} placeholder="6-digit OTP" placeholderTextColor="#bbb" keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} />
              <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Login ✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }} style={styles.back}><Text style={styles.backText}>← Change number</Text></TouchableOpacity>
            </>
          )}

          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Demo Delivery Partners:</Text>
            <Text style={styles.demoItem}>🟢 9500000001 — Raju Yadav (online)</Text>
            <Text style={styles.demoItem}>🟢 9500000004 — Amit Singh (online)</Text>
            <Text style={styles.demoItem}>🔴 9500000003 — Dinesh Kumar (offline)</Text>
            <Text style={styles.demoTag}>OTP: any 6 digits (use 123456)</Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          {['💰 Earn ₹30-50 per delivery', '⚡ Instant order alerts', '📊 Track daily earnings', '🗺️ Route navigation'].map((b, i) => (
            <Text key={i} style={styles.benefit}>{b}</Text>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const GREEN = '#4CAF50';
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F0FFF4', padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 72, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 6 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 10 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  code: { backgroundColor: '#F0FFF4', padding: 14, borderRadius: 12, marginRight: 8 },
  codeText: { fontWeight: '700', color: GREEN, fontSize: 15 },
  input: { flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1A1A2E' },
  otpInput: { flex: 0, marginBottom: 20, letterSpacing: 8, fontSize: 22, textAlign: 'center' },
  btn: { backgroundColor: GREEN, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  back: { alignItems: 'center', padding: 8 },
  backText: { color: GREEN, fontWeight: '600' },
  demo: { backgroundColor: '#F0FFF4', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  demoTitle: { fontWeight: '700', color: GREEN, marginBottom: 8, fontSize: 12 },
  demoItem: { fontSize: 11, color: '#555', marginBottom: 4 },
  demoTag: { fontSize: 11, color: '#999', marginTop: 6, fontStyle: 'italic' },
  benefits: { gap: 8 },
  benefit: { color: '#166534', fontWeight: '600', fontSize: 14, paddingLeft: 4 },
});

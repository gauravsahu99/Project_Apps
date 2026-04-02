import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { sendOTP, verifyOTP, isLoading } = useAuth();

  const handleSendOTP = async () => {
    if (phone.replace(/\s/g, '').length < 10) {
      Alert.alert('Error', 'Enter a valid 10-digit phone number');
      return;
    }
    const res = await sendOTP(phone);
    if (res.success) setOtpSent(true);
  };

  const handleVerify = async () => {
    if (otp.length < 4) { Alert.alert('Error', 'Enter valid OTP'); return; }
    const res = await verifyOTP(phone, otp);
    if (!res.success) { Alert.alert('Error', res.message); return; }
    // Navigation is handled by AppNavigator based on shopkeeper/shop state
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🏪</Text>
          <Text style={styles.title}>Shopkeeper Login</Text>
          <Text style={styles.subtitle}>Manage your shop on Apna Betul</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.label}>📱 Phone Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.code}><Text style={styles.codeText}>+91</Text></View>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor="#bbb"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              editable={!otpSent}
            />
          </View>

          {!otpSent ? (
            <TouchableOpacity style={styles.btn} onPress={handleSendOTP} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP →</Text>}
            </TouchableOpacity>
          ) : (
            <>
              <Text style={[styles.label, { marginTop: 20 }]}>🔐 Enter OTP</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#bbb"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
              <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Login ✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }} style={styles.resend}>
                <Text style={styles.resendText}>← Change number</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.demo}>
            <Text style={styles.demoLabel}>Demo shopkeeper accounts:</Text>
            <Text style={styles.demoItem}>📱 9111111111 — श्री गणेश किराना (approved)</Text>
            <Text style={styles.demoItem}>📱 9222222222 — Fashion Hub (approved)</Text>
            <Text style={styles.demoItem}>📱 9333333333 — Tech World (pending)</Text>
            <Text style={styles.demoTag}>OTP: any 6 digits (use 123456)</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ORANGE = '#FF6B35';
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FFF8F5', padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 6, textAlign: 'center' },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 10 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  code: { backgroundColor: '#FFF0EB', padding: 14, borderRadius: 12, marginRight: 8 },
  codeText: { fontWeight: '700', color: ORANGE, fontSize: 15 },
  input: { flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1A1A2E', backgroundColor: '#FAFAFA' },
  otpInput: { flex: 0, marginBottom: 20, letterSpacing: 8, fontSize: 22, textAlign: 'center' },
  btn: { backgroundColor: ORANGE, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  resend: { alignItems: 'center', padding: 8 },
  resendText: { color: ORANGE, fontWeight: '600' },
  demo: { backgroundColor: '#FFF8F5', borderRadius: 12, padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#FFE0D0' },
  demoLabel: { fontWeight: '700', color: ORANGE, marginBottom: 8, fontSize: 12 },
  demoItem: { fontSize: 11, color: '#555', marginBottom: 4 },
  demoTag: { fontSize: 11, color: '#999', marginTop: 6, fontStyle: 'italic' },
});

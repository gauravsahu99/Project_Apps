import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Animated, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const { sendOTP, verifyOTP, isLoading } = useAuth();
    const slideAnim = useRef(new Animated.Value(0)).current;

    const handleSendOTP = async () => {
        if (phone.length !== 10) {
            Alert.alert('❌ Error', 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें');
            return;
        }
        const res = await sendOTP(phone);
        if (res.success) {
            setStep('otp');
            Animated.timing(slideAnim, { toValue: -400, duration: 300, useNativeDriver: true }).start();
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length < 4) {
            Alert.alert('❌ Error', 'कृपया OTP दर्ज करें (टेस्ट के लिए: 123456)');
            return;
        }
        const res = await verifyOTP(phone, otp);
        if (res.success) {
            navigation.replace('Main');
        } else {
            Alert.alert('❌ Invalid OTP', 'OTP गलत है। दोबारा कोशिश करें।');
        }
    };

    return (
        <LinearGradient colors={['#1A1A2E', '#16213E', '#0F3460']} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoEmoji}>🏙️</Text>
                    </View>
                    <Text style={styles.title}>अपना बैतूल</Text>
                    <Text style={styles.subtitle}>Login to continue</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    {step === 'phone' ? (
                        <View>
                            <Text style={styles.label}>📱 मोबाइल नंबर</Text>
                            <Text style={styles.hint}>आपका OTP इसी नंबर पर आएगा</Text>
                            <View style={styles.phoneInput}>
                                <View style={styles.flagBox}>
                                    <Text style={styles.flag}>🇮🇳 +91</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="मोबाइल नंबर दर्ज करें"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    value={phone}
                                    onChangeText={setPhone}
                                    autoFocus
                                />
                            </View>
                            <TouchableOpacity onPress={handleSendOTP} activeOpacity={0.85} disabled={isLoading}>
                                <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.btn}>
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.btnText}>OTP भेजें →</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <TouchableOpacity onPress={() => setStep('phone')} style={styles.backBtn}>
                                <Text style={styles.backText}>← {phone} बदलें</Text>
                            </TouchableOpacity>
                            <Text style={styles.label}>🔐 OTP दर्ज करें</Text>
                            <Text style={styles.hint}>+91 {phone} पर OTP भेजा गया है</Text>
                            <TextInput
                                style={styles.otpInput}
                                placeholder="6 अंकों का OTP"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                maxLength={6}
                                value={otp}
                                onChangeText={setOtp}
                                autoFocus
                            />
                            <View style={styles.testHint}>
                                <Text style={styles.testHintText}>🧪 Test OTP: 123456</Text>
                            </View>
                            <TouchableOpacity onPress={handleVerifyOTP} activeOpacity={0.85} disabled={isLoading}>
                                <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.btn}>
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.btnText}>Verify & Login ✓</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.resendBtn}>
                                <Text style={styles.resendText}>OTP नहीं मिला? Resend करें</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <Text style={styles.terms}>Login करके आप हमारी Terms & Privacy Policy से सहमत हैं</Text>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 32 },
    logoCircle: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: 'rgba(255,107,53,0.2)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        borderWidth: 2, borderColor: 'rgba(255,107,53,0.4)'},
    logoEmoji: { fontSize: 44 },
    title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 28,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12},
    label: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
    hint: { fontSize: 12, color: '#9CA3AF', marginBottom: 16 },
    phoneInput: { flexDirection: 'row', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
    flagBox: { backgroundColor: '#F9FAFB', paddingHorizontal: 14, justifyContent: 'center', borderRightWidth: 1.5, borderRightColor: '#E5E7EB' },
    flag: { fontSize: 14, fontWeight: '600', color: '#374151' },
    input: { flex: 1, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: '#1F2937' },
    btn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
    btnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
    backBtn: { marginBottom: 16 },
    backText: { color: '#FF6B35', fontWeight: '600', fontSize: 14 },
    otpInput: {
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
        paddingHorizontal: 20, paddingVertical: 16, fontSize: 24, fontWeight: '700',
        textAlign: 'center', color: '#1F2937', letterSpacing: 8, marginBottom: 12},
    testHint: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginBottom: 16 },
    testHintText: { color: '#92400E', fontSize: 13, textAlign: 'center', fontWeight: '600' },
    resendBtn: { alignItems: 'center', marginTop: 16 },
    resendText: { color: '#6B7280', fontSize: 14 },
    terms: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 18 }});

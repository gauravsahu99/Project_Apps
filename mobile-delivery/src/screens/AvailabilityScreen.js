import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    StatusBar, Animated, Dimensions, Alert, Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ZONES = [
    { id: 1, name: 'Civil Lines', emoji: '🏛️', active: true, range: '2 km radius' },
    { id: 2, name: 'Gandhi Chowk', emoji: '🏪', active: true, range: '1.5 km radius' },
    { id: 3, name: 'Sarafa Bazar', emoji: '💍', active: false, range: '1 km radius' },
    { id: 4, name: 'Station Road', emoji: '🚉', active: false, range: '2 km radius' },
    { id: 5, name: 'Housing Board', emoji: '🏘️', active: false, range: '1.8 km radius' },
];

export default function AvailabilityScreen({ navigation }) {
    const [isOnline, setIsOnline] = useState(false);
    const [zones, setZones] = useState(ZONES);
    const [todayStats, setTodayStats] = useState({ deliveries: 0, earned: 0, distKm: 0 });
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isOnline) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            );
            pulse.start();
            Animated.timing(bgAnim, { toValue: 1, duration: 500, useNativeDriver: false }).start();
            return () => pulse.stop();
        } else {
            Animated.timing(bgAnim, { toValue: 0, duration: 500, useNativeDriver: false }).start();
        }
    }, [isOnline]);

    const bgColor = bgAnim.interpolate({ inputRange: [0, 1], outputRange: ['#F8FAFC', '#F0FDF4'] });

    const toggleOnline = () => {
        if (!isOnline) {
            const hasActiveZone = zones.some(z => z.active);
            if (!hasActiveZone) {
                Alert.alert('⚠️ No Zone Selected', 'Please select at least one delivery zone.');
                return;
            }
            Alert.alert('🟢 Go Online', 'आप online हो जाएंगे और orders receive करना शुरू करेंगे।', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Go Online! 🚴', onPress: () => setIsOnline(true) },
            ]);
        } else {
            Alert.alert('🔴 Go Offline', 'नई orders receive करना बंद हो जाएगा।', [
                { text: 'Stay Online', style: 'cancel' },
                { text: 'Go Offline', style: 'destructive', onPress: () => setIsOnline(false) },
            ]);
        }
    };

    const toggleZone = (id) => {
        setZones(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z));
    };

    return (
        <Animated.View style={[styles.root, { backgroundColor: bgColor }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>⚡ Availability</Text>
                    <Text style={styles.headerSub}>Control your delivery status</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: isOnline ? '#22C55E' : '#EF4444' }]}>
                    <Text style={styles.statusPillText}>{isOnline ? '● ONLINE' : '● OFFLINE'}</Text>
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Big Toggle Button */}
                <View style={styles.toggleSection}>
                    <TouchableOpacity onPress={toggleOnline} activeOpacity={0.8}>
                        <Animated.View style={{ transform: [{ scale: isOnline ? pulseAnim : 1 }] }}>
                            <LinearGradient
                                colors={isOnline ? ['#22C55E', '#16A34A'] : ['#1E293B', '#334155']}
                                style={styles.bigToggle}>
                                <Text style={{ fontSize: 50 }}>{isOnline ? '🚴' : '🛑'}</Text>
                                <Text style={styles.bigToggleTitle}>{isOnline ? 'You are ONLINE' : 'You are OFFLINE'}</Text>
                                <Text style={styles.bigToggleSub}>{isOnline ? 'Receiving deliveries · Tap to go offline' : 'Tap to start receiving deliveries'}</Text>
                                <View style={[styles.bigTogglePill, { backgroundColor: isOnline ? 'rgba(255,255,255,0.2)' : 'rgba(255,107,53,0.2)' }]}>
                                    <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>
                                        {isOnline ? '🔴 Go Offline' : '🟢 Go Online'}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                {/* Today's Stats */}
                <View style={styles.todayStats}>
                    {[
                        { label: "Today's Deliveries", value: todayStats.deliveries, icon: '📦', suffix: '' },
                        { label: "Earnings", value: `₹${todayStats.earned}`, icon: '💰', suffix: '' },
                        { label: "Distance", value: todayStats.distKm, icon: '📍', suffix: ' km' },
                    ].map((s, i) => (
                        <View key={i} style={styles.todayStat}>
                            <Text style={{ fontSize: 26 }}>{s.icon}</Text>
                            <Text style={styles.todayStatValue}>{s.value}{s.suffix}</Text>
                            <Text style={styles.todayStatLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Zone Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Delivery Zones</Text>
                    <Text style={styles.sectionSub}>Select zones where you want to deliver</Text>
                    {zones.map(zone => (
                        <TouchableOpacity
                            key={zone.id}
                            style={[styles.zoneCard, zone.active && styles.zoneCardActive]}
                            onPress={() => toggleZone(zone.id)}>
                            <Text style={{ fontSize: 28 }}>{zone.emoji}</Text>
                            <View style={{ flex: 1, marginLeft: 14 }}>
                                <Text style={[styles.zoneName, zone.active && { color: '#0F172A', fontWeight: '900' }]}>{zone.name}</Text>
                                <Text style={styles.zoneRange}>📏 {zone.range}</Text>
                            </View>
                            <View style={[styles.zoneCheck, zone.active && styles.zoneCheckActive]}>
                                {zone.active && <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>✓</Text>}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tips */}
                <View style={[styles.section, { paddingTop: 10 }]}>
                    <LinearGradient colors={['#FFF7ED', '#FEF3C7']} style={styles.tipCard}>
                        <Text style={{ fontSize: 24 }}>💡</Text>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.tipTitle}>Peak Hours Tip!</Text>
                            <Text style={styles.tipDesc}>8-10 AM and 7-9 PM में orders सबसे ज्यादा आते हैं। उस समय online रहें और <Text style={{ fontWeight: '900', color: '#F59E0B' }}>2x bonus</Text> कमाएं!</Text>
                        </View>
                    </LinearGradient>
                </View>

            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
    statusPill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
    statusPillText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
    toggleSection: { padding: 20 },
    bigToggle: { borderRadius: 28, padding: 30, alignItems: 'center', gap: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16 },
    bigToggleTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 10 },
    bigToggleSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, textAlign: 'center' },
    bigTogglePill: { marginTop: 10, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12 },
    todayStats: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 },
    todayStat: { flex: 1, alignItems: 'center' },
    todayStatValue: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginTop: 6 },
    todayStatLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textAlign: 'center', marginTop: 4 },
    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
    sectionSub: { fontSize: 12, color: '#94A3B8', marginBottom: 12 },
    zoneCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 2, borderColor: 'transparent', elevation: 1 },
    zoneCardActive: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
    zoneName: { fontSize: 15, fontWeight: '700', color: '#64748B' },
    zoneRange: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
    zoneCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
    zoneCheckActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
    tipCard: { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'flex-start' },
    tipTitle: { fontSize: 14, fontWeight: '800', color: '#92400E', marginBottom: 5 },
    tipDesc: { fontSize: 13, color: '#78350F', lineHeight: 20 },
});

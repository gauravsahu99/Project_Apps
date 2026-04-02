import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    StatusBar, Animated, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const REVENUE_DATA = [
    { day: 'M', value: 1240, label: '₹1.2K' },
    { day: 'T', value: 980, label: '₹980' },
    { day: 'W', value: 1650, label: '₹1.6K' },
    { day: 'T', value: 890, label: '₹890' },
    { day: 'F', value: 2100, label: '₹2.1K' },
    { day: 'S', value: 3200, label: '₹3.2K' },
    { day: 'S', value: 2400, label: '₹2.4K' },
];

const TOP_PRODUCTS = [
    { name: 'Amul Milk 1L', sold: 68, revenue: 4624, pct: 92, emoji: '🥛' },
    { name: 'Bread Loaf', sold: 45, revenue: 2025, pct: 74, emoji: '🍞' },
    { name: 'Eggs (6 pcs)', sold: 38, revenue: 2166, pct: 63, emoji: '🥚' },
    { name: 'Basmati Rice 1kg', sold: 29, revenue: 3626, pct: 48, emoji: '🍚' },
    { name: 'Toor Dal 500g', sold: 22, revenue: 1639, pct: 36, emoji: '🫘' },
];

const CUSTOMER_HEATMAP = [
    { hour: '6-8 AM', intensity: 0.2 }, { hour: '8-10 AM', intensity: 0.9 },
    { hour: '10-12', intensity: 0.5 }, { hour: '12-2 PM', intensity: 0.3 },
    { hour: '2-4 PM', intensity: 0.2 }, { hour: '4-6 PM', intensity: 0.7 },
    { hour: '6-8 PM', intensity: 0.85 }, { hour: '8-10 PM', intensity: 0.6 },
];

const MAX_REV = Math.max(...REVENUE_DATA.map(d => d.value));

function AnimatedBar({ value, maxVal, color, label, day, delay }) {
    const heightPct = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setTimeout(() => {
            Animated.spring(heightPct, { toValue: value / maxVal, useNativeDriver: false, friction: 8 }).start();
        }, delay);
    }, []);

    const barHeight = heightPct.interpolate({ inputRange: [0, 1], outputRange: [2, 110] });

    return (
        <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4, fontWeight: '700' }}>{label}</Text>
            <View style={{ height: 110, justifyContent: 'flex-end' }}>
                <Animated.View style={{ height: barHeight, width: 24, borderRadius: 8, backgroundColor: color, alignSelf: 'center' }} />
            </View>
            <Text style={{ fontSize: 11, color: '#0F172A', fontWeight: '700', marginTop: 6 }}>{day}</Text>
        </View>
    );
}

export default function ShopkeeperAnalyticsScreen({ navigation }) {
    const [period, setPeriod] = useState('Week');

    const stats = [
        { label: 'Revenue', value: '₹12,460', change: '+18%', icon: '💰', color: '#22C55E', up: true },
        { label: 'Orders', value: '87', change: '+12%', icon: '📦', color: '#3B82F6', up: true },
        { label: 'Avg Order', value: '₹143', change: '-3%', icon: '📊', color: '#F59E0B', up: false },
        { label: 'Customers', value: '54', change: '+22%', icon: '👥', color: '#7C3AED', up: true },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                    <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                        <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>📊 Analytics Dashboard</Text>
                        <Text style={styles.headerSub}>Shop Performance Overview</Text>
                    </View>
                    <View style={styles.periodPicker}>
                        {['Week', 'Month'].map(p => (
                            <TouchableOpacity key={p} style={[styles.periodBtn, period === p && styles.periodBtnActive]} onPress={() => setPeriod(p)}>
                                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </LinearGradient>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((s, i) => (
                        <LinearGradient key={i} colors={['#fff', '#FAFBFF']} style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: s.color + '18' }]}>
                                <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                            </View>
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                            <View style={[styles.changeBadge, { backgroundColor: s.up ? '#F0FDF4' : '#FEF2F2' }]}>
                                <Text style={[styles.changeText, { color: s.up ? '#22C55E' : '#EF4444' }]}>
                                    {s.up ? '↑' : '↓'} {s.change}
                                </Text>
                            </View>
                        </LinearGradient>
                    ))}
                </View>

                {/* Revenue Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📈 Revenue Trend</Text>
                    <View style={styles.chartCard}>
                        <View style={styles.barsRow}>
                            {REVENUE_DATA.map((d, i) => (
                                <AnimatedBar
                                    key={i} value={d.value} maxVal={MAX_REV}
                                    color={d.value === MAX_REV ? '#FF6B35' : '#3B82F6'}
                                    label={d.label} day={d.day} delay={i * 80}
                                />
                            ))}
                        </View>
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FF6B35' }]} /><Text style={styles.legendText}>Peak Day</Text></View>
                            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} /><Text style={styles.legendText}>Regular</Text></View>
                        </View>
                    </View>
                </View>

                {/* Customer Heatmap */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔥 Order Heatmap (Today)</Text>
                    <View style={styles.chartCard}>
                        {CUSTOMER_HEATMAP.map((h, i) => (
                            <View key={i} style={styles.heatRow}>
                                <Text style={styles.heatHour}>{h.hour}</Text>
                                <View style={styles.heatBarBg}>
                                    <View style={[styles.heatBar, {
                                        width: `${h.intensity * 100}%`,
                                        backgroundColor: h.intensity > 0.7 ? '#EF4444' : h.intensity > 0.4 ? '#F59E0B' : '#22C55E',
                                    }]} />
                                </View>
                                <Text style={styles.heatPct}>{Math.round(h.intensity * 100)}%</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Top Products */}
                <View style={[styles.section, { paddingBottom: 30 }]}>
                    <Text style={styles.sectionTitle}>🏆 Top Selling Products</Text>
                    <View style={styles.chartCard}>
                        {TOP_PRODUCTS.map((p, i) => (
                            <View key={i} style={styles.productRow}>
                                <Text style={styles.rankEmoji}>{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</Text>
                                <Text style={{ fontSize: 22, marginRight: 10 }}>{p.emoji}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.productName}>{p.name}</Text>
                                    <View style={styles.productBarBg}>
                                        <LinearGradient
                                            colors={['#FF6B35', '#E85D2E']}
                                            style={[styles.productBar, { width: `${p.pct}%` }]}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        />
                                    </View>
                                </View>
                                <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                                    <Text style={styles.productRevenue}>₹{p.revenue.toLocaleString()}</Text>
                                    <Text style={styles.productSold}>{p.sold} sold</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0F4FF' },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
    periodPicker: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 3 },
    periodBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 11 },
    periodBtnActive: { backgroundColor: '#fff' },
    periodText: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 12 },
    periodTextActive: { color: '#0F172A', fontWeight: '800' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, paddingTop: 16 },
    statCard: { width: (width - 44) / 2, borderRadius: 20, padding: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
    statIconBox: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statValue: { fontSize: 23, fontWeight: '900', color: '#0F172A' },
    statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 3 },
    changeBadge: { marginTop: 8, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
    changeText: { fontSize: 12, fontWeight: '800' },
    section: { paddingHorizontal: 14, paddingTop: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
    chartCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
    barsRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
    chartLegend: { flexDirection: 'row', gap: 20, justifyContent: 'center' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    heatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    heatHour: { fontSize: 11, color: '#64748B', width: 70, fontWeight: '600' },
    heatBarBg: { flex: 1, height: 14, backgroundColor: '#F1F5F9', borderRadius: 7, overflow: 'hidden' },
    heatBar: { height: '100%', borderRadius: 7 },
    heatPct: { fontSize: 11, color: '#0F172A', fontWeight: '700', width: 35, textAlign: 'right' },
    productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    rankEmoji: { fontSize: 18, marginRight: 8 },
    productName: { fontSize: 12, fontWeight: '700', color: '#0F172A', marginBottom: 5 },
    productBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
    productBar: { height: '100%', borderRadius: 4 },
    productRevenue: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
    productSold: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
});

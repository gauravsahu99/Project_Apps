import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    StatusBar, TextInput, Alert, Switch, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ACTIVE_PROMOS = [
    { id: 1, type: 'discount', name: 'Weekend Sale', discount: 15, code: 'WEEKEND15', startDate: 'Mar 28', endDate: 'Mar 30', uses: 23, maxUses: 100, active: true, emoji: '🎉' },
    { id: 2, type: 'freeDelivery', name: 'Free Delivery Day', discount: 0, code: 'FREEDEL', startDate: 'Mar 27', endDate: 'Mar 27', uses: 45, maxUses: 50, active: true, emoji: '🚴' },
    { id: 3, type: 'combo', name: 'Milk + Bread Combo', discount: 20, code: 'COMBO20', startDate: 'Mar 20', endDate: 'Apr 5', uses: 12, maxUses: 200, active: false, emoji: '🛒' },
];

const PROMO_TYPES = [
    { key: 'discount', label: 'Discount %', icon: '🏷️' },
    { key: 'freeDelivery', label: 'Free Delivery', icon: '🚴' },
    { key: 'bogo', label: 'Buy 1 Get 1', icon: '🎁' },
    { key: 'flashSale', label: 'Flash Sale', icon: '⚡' },
    { key: 'combo', label: 'Combo Offer', icon: '🛒' },
];

export default function PromotionsScreen({ navigation }) {
    const [promos, setPromos] = useState(ACTIVE_PROMOS);
    const [showCreate, setShowCreate] = useState(false);
    const [newPromo, setNewPromo] = useState({ type: 'discount', name: '', discount: '', code: '' });

    const togglePromo = (id) => {
        setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    const generateCode = () => {
        const code = 'AB' + Math.random().toString(36).substr(2, 5).toUpperCase();
        setNewPromo(prev => ({ ...prev, code }));
    };

    const createPromo = () => {
        if (!newPromo.name || !newPromo.code) {
            Alert.alert('⚠️ Required Fields', 'Please fill Name and Code.');
            return;
        }
        const created = {
            id: Date.now(), type: newPromo.type, name: newPromo.name,
            discount: parseInt(newPromo.discount) || 0, code: newPromo.code,
            startDate: 'Today', endDate: 'Apr 30',
            uses: 0, maxUses: 100, active: true,
            emoji: PROMO_TYPES.find(t => t.key === newPromo.type)?.icon || '🎁',
        };
        setPromos(prev => [created, ...prev]);
        setNewPromo({ type: 'discount', name: '', discount: '', code: '' });
        setShowCreate(false);
        Alert.alert('✅ Created!', `Promo "${created.name}" is now live!`);
    };

    const totalSavings = promos.reduce((acc, p) => acc + (p.uses * p.discount * 50 / 100), 0);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>🎁 Promotions</Text>
                    <Text style={styles.headerSub}>{promos.filter(p => p.active).length} active offers</Text>
                </View>
                <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(!showCreate)}>
                    <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.createBtnGrad}>
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{showCreate ? '✕ Cancel' : '+ Create'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Stats */}
                <View style={styles.rowStats}>
                    {[
                        { label: 'Active Promos', value: promos.filter(p => p.active).length, icon: '✅', color: '#22C55E' },
                        { label: 'Total Uses', value: promos.reduce((a, p) => a + p.uses, 0), icon: '🎯', color: '#3B82F6' },
                        { label: 'Savings Given', value: `₹${Math.round(totalSavings)}`, icon: '💰', color: '#F59E0B' },
                    ].map((s, i) => (
                        <View key={i} style={styles.miniCard}>
                            <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                            <Text style={[styles.miniValue, { color: s.color }]}>{s.value}</Text>
                            <Text style={styles.miniLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Create Form */}
                {showCreate && (
                    <View style={styles.createForm}>
                        <Text style={styles.createTitle}>✨ New Promotion</Text>

                        {/* Type Selection */}
                        <Text style={styles.fieldLabel}>Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
                            {PROMO_TYPES.map(t => (
                                <TouchableOpacity
                                    key={t.key}
                                    style={[styles.typeChip, newPromo.type === t.key && styles.typeChipActive]}
                                    onPress={() => setNewPromo(prev => ({ ...prev, type: t.key }))}>
                                    <Text style={{ fontSize: 16 }}>{t.icon}</Text>
                                    <Text style={[styles.typeChipText, newPromo.type === t.key && { color: '#fff' }]}>{t.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.fieldLabel}>Promotion Name</Text>
                        <TextInput style={styles.formInput} placeholder="e.g. Weekend Special Sale" placeholderTextColor="#94A3B8" value={newPromo.name} onChangeText={v => setNewPromo(p => ({ ...p, name: v }))} />

                        {newPromo.type === 'discount' && (
                            <>
                                <Text style={styles.fieldLabel}>Discount %</Text>
                                <TextInput style={styles.formInput} placeholder="e.g. 15" keyboardType="numeric" placeholderTextColor="#94A3B8" value={newPromo.discount} onChangeText={v => setNewPromo(p => ({ ...p, discount: v }))} />
                            </>
                        )}

                        <Text style={styles.fieldLabel}>Promo Code</Text>
                        <View style={styles.codeRow}>
                            <TextInput style={[styles.formInput, { flex: 1, marginBottom: 0 }]} placeholder="e.g. SALE15" autoCapitalize="characters" placeholderTextColor="#94A3B8" value={newPromo.code} onChangeText={v => setNewPromo(p => ({ ...p, code: v.toUpperCase() }))} />
                            <TouchableOpacity style={styles.genBtn} onPress={generateCode}>
                                <Text style={{ color: '#FF6B35', fontWeight: '800', fontSize: 12 }}>Auto</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.submitCreate} onPress={createPromo}>
                            <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.submitCreateGrad}>
                                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>🚀 Launch Promotion</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Active Promos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 All Promotions</Text>
                    {promos.map(promo => (
                        <View key={promo.id} style={[styles.promoCard, !promo.active && styles.promoCardInactive]}>
                            <View style={styles.promoTop}>
                                <Text style={{ fontSize: 30 }}>{promo.emoji}</Text>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[styles.promoName, !promo.active && { color: '#94A3B8' }]}>{promo.name}</Text>
                                    <View style={styles.promoCodeRow}>
                                        <View style={styles.codeBadge}>
                                            <Text style={styles.codeText}>{promo.code}</Text>
                                        </View>
                                        {promo.discount > 0 && (
                                            <View style={styles.discountBadge}>
                                                <Text style={styles.discountText}>{promo.discount}% OFF</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <Switch
                                    value={promo.active}
                                    onValueChange={() => togglePromo(promo.id)}
                                    trackColor={{ false: '#E2E8F0', true: '#FF6B35' }}
                                    thumbColor={promo.active ? '#fff' : '#94A3B8'}
                                />
                            </View>

                            <View style={styles.promoStats}>
                                <Text style={styles.promoStatText}>📅 {promo.startDate} → {promo.endDate}</Text>
                                <Text style={styles.promoStatText}>🎯 {promo.uses}/{promo.maxUses} uses</Text>
                            </View>

                            {/* Usage Bar */}
                            <View style={styles.usageBarBg}>
                                <View style={[styles.usageBar, {
                                    width: `${(promo.uses / promo.maxUses) * 100}%`,
                                    backgroundColor: promo.active ? '#FF6B35' : '#94A3B8',
                                }]} />
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
    createBtn: {},
    createBtnGrad: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 },
    rowStats: { flexDirection: 'row', paddingHorizontal: 14, paddingTop: 14, gap: 10 },
    miniCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
    miniValue: { fontSize: 18, fontWeight: '900', marginTop: 4 },
    miniLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textAlign: 'center', marginTop: 3 },
    createForm: { backgroundColor: '#fff', margin: 14, borderRadius: 20, padding: 18, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
    createTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A', marginBottom: 16 },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8, marginTop: 10 },
    formInput: { backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0F172A', borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 8 },
    typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16, backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: 'transparent' },
    typeChipActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
    typeChipText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
    codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    genBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: '#FF6B35', backgroundColor: '#FFF7ED' },
    submitCreate: { marginTop: 16 },
    submitCreateGrad: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
    section: { paddingHorizontal: 14, paddingTop: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
    promoCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
    promoCardInactive: { opacity: 0.6, backgroundColor: '#FAFAFA' },
    promoTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    promoName: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
    promoCodeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    codeBadge: { backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#E2E8F0' },
    codeText: { fontSize: 12, fontWeight: '900', color: '#0F172A', fontFamily: 'monospace', letterSpacing: 1 },
    discountBadge: { backgroundColor: '#FFF7ED', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
    discountText: { fontSize: 12, fontWeight: '800', color: '#FF6B35' },
    promoStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    promoStatText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    usageBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
    usageBar: { height: '100%', borderRadius: 3 },
});

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    StatusBar, TextInput, Alert, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MOCK_INVENTORY = [
    { id: 1, name: 'Amul Milk 1L', emoji: '🥛', stock: 12, minStock: 10, unit: 'packets', price: 68, category: 'Dairy', status: 'ok' },
    { id: 2, name: 'Bread Loaf', emoji: '🍞', stock: 3, minStock: 5, unit: 'pcs', price: 45, category: 'Bakery', status: 'low' },
    { id: 3, name: 'Eggs (6 pcs)', emoji: '🥚', stock: 0, minStock: 4, unit: 'trays', price: 57, category: 'Eggs', status: 'out' },
    { id: 4, name: 'Toor Dal 1kg', emoji: '🫘', stock: 22, minStock: 8, unit: 'kg', price: 145, category: 'Pulses', status: 'ok' },
    { id: 5, name: 'Cooking Oil 1L', emoji: '🫙', stock: 7, minStock: 6, unit: 'btls', price: 135, category: 'Oil', status: 'ok' },
    { id: 6, name: 'Basmati Rice 5kg', emoji: '🍚', stock: 2, minStock: 4, unit: 'bags', price: 450, category: 'Rice', status: 'low' },
    { id: 7, name: 'Sugar 1kg', emoji: '🍬', stock: 18, minStock: 10, unit: 'kg', price: 45, category: 'Grocery', status: 'ok' },
    { id: 8, name: 'Paneer 200g', emoji: '🧀', stock: 0, minStock: 3, unit: 'packs', price: 80, category: 'Dairy', status: 'out' },
];

const STATUS_CONFIG = {
    ok: { color: '#22C55E', bg: '#F0FDF4', label: 'In Stock' },
    low: { color: '#F59E0B', bg: '#FFFBEB', label: 'Low Stock' },
    out: { color: '#EF4444', bg: '#FEF2F2', label: 'Out of Stock' },
};

export default function InventoryScreen({ navigation }) {
    const [items, setItems] = useState(MOCK_INVENTORY);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filtered = items.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || item.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const updateStock = (id, delta) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const newStock = Math.max(0, item.stock + delta);
            const newStatus = newStock === 0 ? 'out' : newStock < item.minStock ? 'low' : 'ok';
            return { ...item, stock: newStock, status: newStatus };
        }));
    };

    const alertCounts = {
        low: items.filter(i => i.status === 'low').length,
        out: items.filter(i => i.status === 'out').length,
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>📦 Inventory Manager</Text>
                    <Text style={styles.headerSub}>{items.length} products tracked</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Add Product', 'Product form will open...')}>
                    <Text style={{ color: '#FF6B35', fontWeight: '900', fontSize: 22 }}>+</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Alert Banners */}
            {(alertCounts.out > 0 || alertCounts.low > 0) && (
                <View style={styles.alertsRow}>
                    {alertCounts.out > 0 && (
                        <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.alertBanner}>
                            <Text style={{ fontSize: 20 }}>❌</Text>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.alertTitle}>Out of Stock</Text>
                                <Text style={styles.alertSub}>{alertCounts.out} items need restocking</Text>
                            </View>
                        </LinearGradient>
                    )}
                    {alertCounts.low > 0 && (
                        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.alertBanner}>
                            <Text style={{ fontSize: 20 }}>⚠️</Text>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.alertTitle}>Low Stock</Text>
                                <Text style={styles.alertSub}>{alertCounts.low} items running low</Text>
                            </View>
                        </LinearGradient>
                    )}
                </View>
            )}

            {/* Search */}
            <View style={styles.searchBar}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Product खोजें..."
                    placeholderTextColor="#94A3B8"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 8, gap: 8 }}>
                {['all', 'ok', 'low', 'out'].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, filterStatus === f && styles.filterChipActive]}
                        onPress={() => setFilterStatus(f)}>
                        <Text style={[styles.filterText, filterStatus === f && { color: '#fff' }]}>
                            {f === 'all' ? '📦 All' : f === 'ok' ? '✅ In Stock' : f === 'low' ? '⚠️ Low' : '❌ Out'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
                {filtered.map(item => {
                    const cfg = STATUS_CONFIG[item.status];
                    return (
                        <View key={item.id} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Text style={{ fontSize: 34 }}>{item.emoji}</Text>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemCategory}>📂 {item.category} · ₹{item.price}/{item.unit}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                                </View>
                            </View>

                            <View style={styles.stockRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.stockLabel}>Current Stock</Text>
                                    <Text style={[styles.stockValue, { color: cfg.color }]}>{item.stock} {item.unit}</Text>
                                    <Text style={styles.minStockLabel}>Min: {item.minStock} {item.unit}</Text>
                                    {/* Stock Bar */}
                                    <View style={styles.stockBarBg}>
                                        <View style={[styles.stockBar, {
                                            width: `${Math.min(100, (item.stock / (item.minStock * 2)) * 100)}%`,
                                            backgroundColor: cfg.color,
                                        }]} />
                                    </View>
                                </View>
                                <View style={styles.stockControls}>
                                    <TouchableOpacity style={styles.stockBtn} onPress={() => updateStock(item.id, -1)}>
                                        <Text style={styles.stockBtnText}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.stockNum}>{item.stock}</Text>
                                    <TouchableOpacity style={[styles.stockBtn, { backgroundColor: '#F0FDF4', borderColor: '#22C55E' }]} onPress={() => updateStock(item.id, 1)}>
                                        <Text style={[styles.stockBtnText, { color: '#22C55E' }]}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {item.status !== 'ok' && (
                                <TouchableOpacity
                                    style={styles.reorderBtn}
                                    onPress={() => Alert.alert('🔁 Reorder', `Placing reorder for ${item.name}...`)}>
                                    <Text style={styles.reorderText}>🔁 Reorder Now</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
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
    addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,107,53,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FF6B35' },
    alertsRow: { gap: 10, padding: 14, paddingTop: 10 },
    alertBanner: { borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center' },
    alertTitle: { color: '#fff', fontWeight: '900', fontSize: 13 },
    alertSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
    searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5 },
    searchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
    filterScroll: { maxHeight: 52 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
    filterChipActive: { backgroundColor: '#FF6B35' },
    filterText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
    itemCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginTop: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
    itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    itemName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
    itemCategory: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
    statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 11, fontWeight: '800' },
    stockRow: { flexDirection: 'row', alignItems: 'center' },
    stockLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
    stockValue: { fontSize: 22, fontWeight: '900', marginVertical: 4 },
    minStockLabel: { fontSize: 11, color: '#94A3B8', marginBottom: 6 },
    stockBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', width: '100%' },
    stockBar: { height: '100%', borderRadius: 3 },
    stockControls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 16 },
    stockBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
    stockBtnText: { fontSize: 20, fontWeight: '900', color: '#EF4444', lineHeight: 22 },
    stockNum: { fontSize: 20, fontWeight: '900', color: '#0F172A', minWidth: 30, textAlign: 'center' },
    reorderBtn: { marginTop: 12, backgroundColor: '#FFF7ED', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#FF6B35' },
    reorderText: { color: '#FF6B35', fontWeight: '800', fontSize: 13 },
});

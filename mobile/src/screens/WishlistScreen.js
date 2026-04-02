import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    StatusBar, Alert, Share, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const WISHLIST_ITEMS = [
    { id: 1, name: 'Amul Full Cream Milk 1L', shop: 'Sharma Kirana', price: 68, oldPrice: 72, emoji: '🥛', inStock: true, category: 'Essentials', priceChange: -4 },
    { id: 2, name: 'Basmati Rice 5kg Premium', shop: 'Royal Grocery', price: 450, oldPrice: 480, emoji: '🍚', inStock: true, category: 'Grocery', priceChange: -30 },
    { id: 3, name: 'Toor Dal 1kg', shop: 'Rahul Stores', price: 145, oldPrice: 145, emoji: '🫘', inStock: false, category: 'Grocery', priceChange: 0 },
    { id: 4, name: 'Cooking Oil 1L Refined', shop: 'City Mart', price: 135, oldPrice: 120, emoji: '🫙', inStock: true, category: 'Essentials', priceChange: 15 },
    { id: 5, name: 'Bread Brown Loaf', shop: 'Fresh Bakery', price: 55, oldPrice: 60, emoji: '🍞', inStock: true, category: 'Bakery', priceChange: -5 },
];

export default function WishlistScreen({ navigation }) {
    const [items, setItems] = useState(WISHLIST_ITEMS);
    const [filter, setFilter] = useState('All');

    const categories = ['All', ...new Set(WISHLIST_ITEMS.map(i => i.category))];

    const filtered = filter === 'All' ? items : items.filter(i => i.category === filter);

    const removeItem = (id) => {
        Alert.alert('Remove Item?', 'हटाना चाहते हैं?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => setItems(prev => prev.filter(i => i.id !== id)) },
        ]);
    };

    const addToCart = (item) => {
        Alert.alert('✅ Added to Cart!', `${item.name} को cart में add किया।`);
    };

    const shareWishlist = async () => {
        try {
            await Share.share({ message: `My Apna Betul Wishlist:\n${items.map(i => `• ${i.name} - ₹${i.price}`).join('\n')}` });
        } catch (e) {}
    };

    const dropAlerts = items.filter(i => i.priceChange < 0).length;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Header */}
            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>💝 My Wishlist</Text>
                    <Text style={styles.headerSub}>{items.length} items saved</Text>
                </View>
                <TouchableOpacity style={styles.shareHeaderBtn} onPress={shareWishlist}>
                    <Text style={{ fontSize: 20 }}>🔗</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Price Drop Alert Banner */}
            {dropAlerts > 0 && (
                <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.dropBanner}>
                    <Text style={{ fontSize: 22 }}>📉</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.dropBannerTitle}>Price Drop Alert! 🎉</Text>
                        <Text style={styles.dropBannerSub}>{dropAlerts} items में कीमत कम हुई</Text>
                    </View>
                    <View style={styles.dropBadge}>
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>{dropAlerts}</Text>
                    </View>
                </LinearGradient>
            )}

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
                {categories.map(cat => (
                    <TouchableOpacity key={cat} style={[styles.filterChip, filter === cat && styles.filterChipActive]} onPress={() => setFilter(cat)}>
                        <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
                {filtered.map(item => (
                    <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemLeft}>
                            <View style={styles.itemEmoji}>
                                <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
                            </View>
                        </View>
                        <View style={styles.itemBody}>
                            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                            <Text style={styles.itemShop}>🏪 {item.shop}</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.itemPrice}>₹{item.price}</Text>
                                {item.oldPrice !== item.price && (
                                    <Text style={styles.itemOldPrice}>₹{item.oldPrice}</Text>
                                )}
                                {item.priceChange < 0 && (
                                    <View style={styles.priceDrop}>
                                        <Text style={styles.priceDropText}>↓ ₹{Math.abs(item.priceChange)}</Text>
                                    </View>
                                )}
                                {item.priceChange > 0 && (
                                    <View style={[styles.priceDrop, { backgroundColor: '#FEF2F2' }]}>
                                        <Text style={[styles.priceDropText, { color: '#EF4444' }]}>↑ ₹{item.priceChange}</Text>
                                    </View>
                                )}
                            </View>
                            {!item.inStock && (
                                <View style={styles.outOfStock}>
                                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                                </View>
                            )}
                            <View style={styles.itemActions}>
                                <TouchableOpacity
                                    style={[styles.addToCartBtn, !item.inStock && styles.addToCartBtnDisabled]}
                                    onPress={() => addToCart(item)}
                                    disabled={!item.inStock}>
                                    <Text style={[styles.addToCartText, !item.inStock && { color: '#94A3B8' }]}>
                                        {item.inStock ? '🛒 Add to Cart' : '✗ Unavailable'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id)}>
                                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

                {filtered.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={{ fontSize: 60 }}>💝</Text>
                        <Text style={styles.emptyTitle}>Empty Wishlist</Text>
                        <Text style={styles.emptySub}>Browse products and add them to your wishlist</Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation?.navigate('Essentials')}>
                            <Text style={{ color: '#fff', fontWeight: '800' }}>Shop Now →</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
    shareHeaderBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
    dropBanner: { marginHorizontal: 16, marginTop: 14, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center' },
    dropBannerTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
    dropBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 3 },
    dropBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
    filterScroll: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
    filterChipActive: { backgroundColor: '#FF6B35' },
    filterText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    filterTextActive: { color: '#fff', fontWeight: '800' },
    itemCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 14, marginTop: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
    itemLeft: { marginRight: 14 },
    itemEmoji: { width: 70, height: 70, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    itemBody: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: '800', color: '#0F172A', lineHeight: 20 },
    itemShop: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    itemPrice: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
    itemOldPrice: { fontSize: 13, color: '#94A3B8', textDecorationLine: 'line-through' },
    priceDrop: { backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    priceDropText: { fontSize: 11, color: '#22C55E', fontWeight: '800' },
    outOfStock: { backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
    outOfStockText: { fontSize: 11, color: '#EF4444', fontWeight: '700' },
    itemActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    addToCartBtn: { flex: 1, backgroundColor: '#FF6B35', borderRadius: 12, paddingVertical: 9, alignItems: 'center' },
    addToCartBtnDisabled: { backgroundColor: '#F1F5F9' },
    addToCartText: { color: '#fff', fontWeight: '800', fontSize: 12 },
    removeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center' },
    emptyBtn: { marginTop: 20, backgroundColor: '#FF6B35', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12 },
});

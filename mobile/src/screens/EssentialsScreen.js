import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
    ScrollView, TextInput, Animated, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ESSENTIALS_PRODUCTS } from '../constants/data';
import { useCart } from '../contexts/CartContext';

const TABS = [
    { key: 'morning',    label: 'नाश्ता',     emoji: '🌅', color: '#FF9800', gradient: ['#FF6B35','#FF9800'] },
    { key: 'dairy',      label: 'डेयरी',      emoji: '🥛', color: '#2196F3', gradient: ['#1565C0','#2196F3'] },
    { key: 'vegetables', label: 'सब्जियां',   emoji: '🥬', color: '#4CAF50', gradient: ['#2E7D32','#4CAF50'] },
    { key: 'fruits',     label: 'फल',         emoji: '🍎', color: '#E91E63', gradient: ['#AD1457','#E91E63'] },
    { key: 'snacks',     label: 'स्नैक्स',    emoji: '🍿', color: '#9C27B0', gradient: ['#6A1B9A','#9C27B0'] },
];

const DELIVERY_SLOTS = [
    { id: '1', time: 'सुबह 6:00 – 8:00', label: 'Early Morning', available: true },
    { id: '2', time: 'सुबह 8:00 – 10:00', label: 'Morning', available: true },
    { id: '3', time: 'दोपहर 12:00 – 2:00', label: 'Afternoon', available: false },
    { id: '4', time: 'शाम 6:00 – 8:00', label: 'Evening', available: true },
];

export default function EssentialsScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('1');
    const [showSlots, setShowSlots] = useState(false);
    const tabAnim = useRef(new Animated.Value(0)).current;
    const { addToCart, cart, cartCount, updateQuantity } = useCart();

    const getQty = (id) => {
        const item = cart.find(i => i.id === id);
        return item ? item.quantity : 0;
    };

    const currentTab = TABS[activeTab];
    const products = ESSENTIALS_PRODUCTS.filter(p => {
        const matchCat = p.category === currentTab.key;
        const matchSearch = search.length === 0 ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.nameEn.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    // Search shows all categories
    const searchResults = search.length > 0
        ? ESSENTIALS_PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.nameEn.toLowerCase().includes(search.toLowerCase())
        )
        : null;

    const handleTab = (i) => {
        Animated.spring(tabAnim, { toValue: i, useNativeDriver: false }).start();
        setActiveTab(i);
    };

    const handleAdd = (product) => {
        const now = new Date();
        const cutoff = new Date(); cutoff.setHours(8, 0, 0, 0);
        if (now > cutoff && now.getHours() < 20) {
            Alert.alert(
                '⏰ Order Window',
                'आज की delivery के लिए सुबह 8 बजे से पहले order करें। कल के लिए order करें?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: '✅ कल के लिए Order', onPress: () => addToCart(product) },
                ]
            );
        } else {
            addToCart(product);
        }
    };

    const displayProducts = searchResults || products;
    const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            {/* ── HEADER ── */}
            <LinearGradient colors={['#0D47A1', '#1976D2', '#42A5F5']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backArrow}>←</Text>
                        <Text style={styles.backLabel}>होम</Text>
                    </TouchableOpacity>
                    {cartCount > 0 && (
                        <TouchableOpacity style={styles.cartPill} onPress={() => navigation.navigate('Cart')}>
                            <Text style={styles.cartPillText}>🛒 {cartCount} items  ₹{cartTotal}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.headerTitle}>🌅 Daily Essentials</Text>
                <Text style={styles.headerSub}>ताजा सामान — रोज़ सुबह आपके दरवाजे तक</Text>

                {/* Search */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBox}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="दूध, ब्रेड, सब्जी खोजें..."
                            placeholderTextColor="rgba(255,255,255,0.55)"
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={styles.slotBtn} onPress={() => setShowSlots(!showSlots)}>
                        <Text style={styles.slotBtnText}>🕐</Text>
                    </TouchableOpacity>
                </View>

                {/* Delivery Slot Banner */}
                <TouchableOpacity
                    style={styles.slotBanner}
                    onPress={() => setShowSlots(!showSlots)}
                    activeOpacity={0.85}
                >
                    <Text style={styles.slotBannerEmoji}>🚚</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.slotBannerTitle}>
                            Delivery Slot: {DELIVERY_SLOTS.find(s => s.id === selectedSlot)?.time}
                        </Text>
                        <Text style={styles.slotBannerSub}>
                            Cutoff: 8:00 AM • Tap to change slot
                        </Text>
                    </View>
                    <Text style={styles.slotBannerArrow}>{showSlots ? '▲' : '▼'}</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Delivery Slot Picker */}
            {showSlots && (
                <View style={styles.slotDropdown}>
                    <Text style={styles.slotDropTitle}>⏰ Delivery Slot चुनें</Text>
                    {DELIVERY_SLOTS.map(slot => (
                        <TouchableOpacity
                            key={slot.id}
                            style={[
                                styles.slotOption,
                                selectedSlot === slot.id && styles.slotOptionActive,
                                !slot.available && styles.slotOptionDisabled,
                            ]}
                            onPress={() => { if (slot.available) { setSelectedSlot(slot.id); setShowSlots(false); } }}
                            disabled={!slot.available}
                        >
                            <View style={styles.slotOptionLeft}>
                                <Text style={[styles.slotOptionLabel, selectedSlot === slot.id && styles.slotOptionLabelActive]}>
                                    {slot.label}
                                </Text>
                                <Text style={styles.slotOptionTime}>{slot.time}</Text>
                            </View>
                            {!slot.available && <View style={styles.slotFullBadge}><Text style={styles.slotFullText}>Full</Text></View>}
                            {slot.available && selectedSlot === slot.id && (
                                <View style={styles.slotSelectedDot} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* ── CATEGORY TABS (only when not searching) ── */}
            {!search && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsScroll}
                    contentContainerStyle={styles.tabsContent}
                >
                    {TABS.map((tab, i) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tabChip, activeTab === i && styles.tabChipActive]}
                            onPress={() => handleTab(i)}
                            activeOpacity={0.85}
                        >
                            {activeTab === i ? (
                                <LinearGradient colors={tab.gradient} style={styles.tabChipGradient}>
                                    <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                                    <Text style={styles.tabLabelActive}>{tab.label}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.tabChipInner}>
                                    <Text style={styles.tabEmoji}>{tab.emoji}</Text>
                                    <Text style={styles.tabLabel}>{tab.label}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* ── PRODUCTS ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {search && (
                    <Text style={styles.searchResultLabel}>
                        "{search}" के लिए {searchResults?.length || 0} results
                    </Text>
                )}

                {/* Section header */}
                {!search && (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{currentTab.emoji} {currentTab.label}</Text>
                        <Text style={styles.sectionCount}>{products.length} items</Text>
                    </View>
                )}

                <View style={styles.grid}>
                    {displayProducts.map(product => {
                        const qty = getQty(product.id);
                        return (
                            <View key={product.id} style={styles.productCard}>
                                {/* Discount badge */}
                                {product.discount > 0 && (
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>{product.discount}% OFF</Text>
                                    </View>
                                )}
                                {/* Organic badge */}
                                {product.isOrganic && (
                                    <View style={styles.organicBadge}>
                                        <Text style={styles.organicText}>🌿</Text>
                                    </View>
                                )}

                                <LinearGradient
                                    colors={[product.color + '22', product.color + '08']}
                                    style={styles.productEmojiBg}
                                >
                                    <Text style={styles.productEmoji}>{product.emoji}</Text>
                                </LinearGradient>

                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.productNameEn}>{product.nameEn}</Text>
                                <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>

                                <View style={styles.productPriceRow}>
                                    <Text style={[styles.productPrice, { color: product.color }]}>₹{product.price}</Text>
                                    <Text style={styles.productUnit}> / {product.unit}</Text>
                                </View>

                                {qty === 0 ? (
                                    <TouchableOpacity
                                        style={[styles.addBtn, { backgroundColor: product.color }]}
                                        onPress={() => handleAdd(product)}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={styles.addBtnText}>+ Add</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.qtyRow}>
                                        <TouchableOpacity
                                            style={[styles.qtyBtn, { backgroundColor: product.color }]}
                                            onPress={() => updateQuantity(product.id, qty - 1)}
                                        >
                                            <Text style={styles.qtyBtnText}>−</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.qtyNum}>{qty}</Text>
                                        <TouchableOpacity
                                            style={[styles.qtyBtn, { backgroundColor: product.color }]}
                                            onPress={() => addToCart(product)}
                                        >
                                            <Text style={styles.qtyBtnText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {displayProducts.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={{ fontSize: 48 }}>🔍</Text>
                        <Text style={styles.emptyTitle}>कोई item नहीं मिला</Text>
                        <Text style={styles.emptySub}>दूसरा keyword try करें</Text>
                    </View>
                )}

                {/* ── SUBSCRIPTION CTA ── */}
                {!search && (
                    <LinearGradient colors={['#1A1A2E', '#0D47A1']} style={styles.subscriptionCard}>
                        <View style={styles.subIconBg}>
                            <Text style={styles.subEmoji}>📦</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.subTitle}>Monthly Plan</Text>
                            <Text style={styles.subDesc}>रोज़ बिना order किए — ₹999/month से शुरू</Text>
                            <View style={styles.subFeatures}>
                                <Text style={styles.subFeature}>✅ Auto-delivery</Text>
                                <Text style={styles.subFeature}>✅ 10% extra off</Text>
                                <Text style={styles.subFeature}>✅ Skip anytime</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.subBtn}>
                            <Text style={styles.subBtnText}>Subscribe →</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                )}
            </ScrollView>

            {/* ── FLOATING CART BAR ── */}
            {cartCount > 0 && (
                <TouchableOpacity
                    style={styles.cartBar}
                    onPress={() => navigation.navigate('Cart')}
                    activeOpacity={0.95}
                >
                    <LinearGradient colors={['#0D47A1', '#1976D2']} style={styles.cartBarGradient}>
                        <View style={styles.cartBarLeft}>
                            <Text style={styles.cartBarCount}>{cartCount}</Text>
                            <Text style={styles.cartBarLabel}>items in cart</Text>
                        </View>
                        <Text style={styles.cartBarTotal}>₹{cartTotal}</Text>
                        <View style={styles.cartBarCta}>
                            <Text style={styles.cartBarCtaText}>Checkout →</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4FF' },

    // Header
    header: { paddingTop: 48, paddingBottom: 16, paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
    backArrow: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    backLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    cartPill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    cartPillText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginBottom: 3 },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 14 },

    // Search
    searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    searchIcon: { fontSize: 16, marginRight: 6 },
    searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: '#FFFFFF' },
    slotBtn: { width: 46, height: 46, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    slotBtnText: { fontSize: 20 },

    // Slot banner
    slotBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: 12, gap: 10 },
    slotBannerEmoji: { fontSize: 22 },
    slotBannerTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
    slotBannerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 },
    slotBannerArrow: { color: '#FFFFFF', fontSize: 12 },

    // Slot dropdown
    slotDropdown: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 4, borderRadius: 16, elevation: 8, padding: 16, zIndex: 100 },
    slotDropTitle: { fontWeight: '800', fontSize: 15, color: '#1F2937', marginBottom: 12 },
    slotOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 6, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: 'transparent' },
    slotOptionActive: { borderColor: '#1976D2', backgroundColor: '#EFF6FF' },
    slotOptionDisabled: { opacity: 0.4 },
    slotOptionLeft: { flex: 1 },
    slotOptionLabel: { fontWeight: '700', fontSize: 14, color: '#1F2937' },
    slotOptionLabelActive: { color: '#1976D2' },
    slotOptionTime: { color: '#6B7280', fontSize: 12, marginTop: 2 },
    slotFullBadge: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    slotFullText: { color: '#EF4444', fontSize: 11, fontWeight: '700' },
    slotSelectedDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1976D2' },

    // Tabs
    tabsScroll: { backgroundColor: '#FFFFFF', elevation: 3, maxHeight: 64 },
    tabsContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8, alignItems: 'center' },
    tabChip: { borderRadius: 24, overflow: 'hidden' },
    tabChipActive: {},
    tabChipGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9, gap: 6, borderRadius: 24 },
    tabChipInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9, gap: 6, backgroundColor: '#F3F4F6', borderRadius: 24 },
    tabEmoji: { fontSize: 16 },
    tabLabel: { fontWeight: '700', color: '#6B7280', fontSize: 13 },
    tabLabelActive: { fontWeight: '800', color: '#FFFFFF', fontSize: 13 },

    // Products
    scroll: { flex: 1 },
    searchResultLabel: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 2, fontSize: 13, color: '#6B7280', fontWeight: '600' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1F2937' },
    sectionCount: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12, paddingTop: 4 },
    productCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, position: 'relative' },
    discountBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, zIndex: 10 },
    discountText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
    organicBadge: { position: 'absolute', top: 10, left: 10, zIndex: 10 },
    organicText: { fontSize: 14 },
    productEmojiBg: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', marginBottom: 10, alignSelf: 'center' },
    productEmoji: { fontSize: 34 },
    productName: { fontSize: 13, fontWeight: '800', color: '#1F2937', textAlign: 'center', marginBottom: 2 },
    productNameEn: { fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginBottom: 5 },
    productDesc: { fontSize: 10, color: '#6B7280', textAlign: 'center', lineHeight: 14, marginBottom: 8 },
    productPriceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 10 },
    productPrice: { fontSize: 19, fontWeight: '900' },
    productUnit: { fontSize: 10, color: '#9CA3AF' },
    addBtn: { borderRadius: 12, paddingVertical: 9, alignItems: 'center' },
    addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    qtyBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    qtyBtnText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', lineHeight: 22 },
    qtyNum: { fontSize: 18, fontWeight: '800', color: '#1F2937' },

    // Empty state
    emptyState: { alignItems: 'center', paddingVertical: 50 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginTop: 14 },
    emptySub: { color: '#9CA3AF', marginTop: 6 },

    // Subscription
    subscriptionCard: { marginHorizontal: 14, marginTop: 20, borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 8 },
    subIconBg: { width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    subEmoji: { fontSize: 28 },
    subTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, marginBottom: 4 },
    subDesc: { color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 17 },
    subFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    subFeature: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' },
    subBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', marginTop: 6 },
    subBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },

    // Cart bar
    cartBar: { position: 'absolute', bottom: 18, left: 14, right: 14, borderRadius: 18, overflow: 'hidden', elevation: 12, shadowColor: '#1565C0', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
    cartBarGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 },
    cartBarLeft: { flex: 1 },
    cartBarCount: { color: '#FFFFFF', fontWeight: '900', fontSize: 20 },
    cartBarLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
    cartBarTotal: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, marginRight: 14 },
    cartBarCta: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
    cartBarCtaText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});

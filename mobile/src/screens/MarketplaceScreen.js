import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    Linking, Alert, ScrollView, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MARKETPLACE_LISTINGS } from '../constants/data';

const CATEGORIES = [
    { id: 'all',        label: 'सभी',       emoji: '🏪', color: '#6B7280' },
    { id: 'bikes',      label: 'वाहन',      emoji: '🚗', color: '#FF6B35' },
    { id: 'electronics',label: 'Electronics',emoji: '📱', color: '#1976D2' },
    { id: 'realestate', label: 'Property',   emoji: '🏠', color: '#4CAF50' },
    { id: 'furniture',  label: 'Furniture',  emoji: '🪑', color: '#FF9800' },
    { id: 'jobs',       label: 'Jobs',       emoji: '💼', color: '#9C27B0' },
];

const SORT_OPTIONS = [
    { id: 'newest',     label: '🆕 Newest first' },
    { id: 'price-asc',  label: '💸 Price: Low → High' },
    { id: 'price-desc', label: '💰 Price: High → Low' },
    { id: 'views',      label: '👁 Most popular' },
];

const CAT_COLORS = {
    bikes: '#FF6B35', electronics: '#1976D2',
    realestate: '#4CAF50', furniture: '#FF9800',
    jobs: '#9C27B0', all: '#6B7280',
};

export default function MarketplaceScreen({ navigation }) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [favorites, setFavorites] = useState({});
    const [showSort, setShowSort] = useState(false);

    const toggleFav = (id) => setFavorites(f => ({ ...f, [id]: !f[id] }));

    let filtered = MARKETPLACE_LISTINGS.filter(l => {
        const q = search.toLowerCase();
        const matchSearch = !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.location.toLowerCase().includes(q);
        const matchCat = activeCategory === 'all' || l.category === activeCategory;
        return matchSearch && matchCat;
    });

    if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sortBy === 'views') filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0));

    const callSeller = (phone, name) => {
        Alert.alert(`📞 ${name}`, `${phone} पर call करें?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: '📞 Call करें', onPress: () => Linking.openURL(`tel:${phone}`) },
        ]);
    };

    const whatsappSeller = (whatsapp, title) => {
        const msg = encodeURIComponent(`नमस्ते! मुझे आपकी listing "${title}" में interest है। क्या यह available है?`);
        Linking.openURL(`https://wa.me/91${whatsapp}?text=${msg}`);
    };

    const catCounts = {};
    MARKETPLACE_LISTINGS.forEach(l => {
        catCounts[l.category] = (catCounts[l.category] || 0) + 1;
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6A1B9A" />

            {/* ── HEADER ── */}
            <LinearGradient colors={['#4A148C', '#7B1FA2', '#AB47BC']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backArrow}>←</Text>
                        <Text style={styles.backLabel}>होम</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.postHeaderBtn} onPress={() => navigation.navigate('PostItem')}>
                        <Text style={styles.postHeaderText}>+ Post</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.headerTitle}>🛍️ Local Marketplace</Text>
                <Text style={styles.headerSub}>बैतूल का अपना OLX — स्थानीय खरीद-बिक्री</Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{MARKETPLACE_LISTINGS.length}+</Text>
                        <Text style={styles.statLabel}>Listings</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>6</Text>
                        <Text style={styles.statLabel}>Categories</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>Free</Text>
                        <Text style={styles.statLabel}>Post करें</Text>
                    </View>
                </View>

                {/* Search */}
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Bike, Mobile, Property, Job खोजें..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {/* ── CATEGORY CHIPS ── */}
            <View style={styles.catSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catContent}>
                    {CATEGORIES.map(cat => {
                        const count = cat.id === 'all' ? MARKETPLACE_LISTINGS.length : (catCounts[cat.id] || 0);
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.catChip, activeCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color }]}
                                onPress={() => setActiveCategory(cat.id)}
                            >
                                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                                <Text style={[styles.catText, activeCategory === cat.id && styles.catTextActive]}>
                                    {cat.label}
                                </Text>
                                <View style={[styles.catCount, activeCategory === cat.id && styles.catCountActive]}>
                                    <Text style={[styles.catCountText, activeCategory === cat.id && styles.catCountTextActive]}>
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ── LISTINGS ── */}
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

                {/* Meta + Sort row */}
                <View style={styles.metaRow}>
                    <Text style={styles.metaCount}>
                        {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
                        {activeCategory !== 'all' && ` in ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
                            <Text style={styles.sortBtnText}>⇅ Sort</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.postBtn} onPress={() => navigation.navigate('PostItem')}>
                            <Text style={styles.postBtnText}>+ Post करें</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sort Dropdown */}
                {showSort && (
                    <View style={styles.sortDropdown}>
                        {SORT_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.id}
                                style={[styles.sortOption, sortBy === opt.id && styles.sortOptionActive]}
                                onPress={() => { setSortBy(opt.id); setShowSort(false); }}
                            >
                                <Text style={[styles.sortOptionText, sortBy === opt.id && { color: '#7B1FA2', fontWeight: '800' }]}>
                                    {opt.label}
                                </Text>
                                {sortBy === opt.id && <Text style={styles.sortCheck}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Listing Cards */}
                {filtered.map(item => {
                    const catColor = CAT_COLORS[item.category] || '#7B1FA2';
                    const cat = CATEGORIES.find(c => c.id === item.category);
                    return (
                        <View key={item.id} style={styles.listingCard}>
                            {/* Top accent */}
                            <View style={[styles.listingAccent, { backgroundColor: catColor }]} />

                            <View style={styles.listingInner}>
                                {/* Row 1: Badge + Verified + Fav */}
                                <View style={styles.listingTopRow}>
                                    <View style={[styles.catBadge, { backgroundColor: catColor + '22' }]}>
                                        <Text style={[styles.catBadgeText, { color: catColor }]}>
                                            {cat?.emoji} {cat?.label}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        {item.isVerified && (
                                            <View style={styles.verifiedBadge}>
                                                <Text style={styles.verifiedText}>✓ Verified</Text>
                                            </View>
                                        )}
                                        <TouchableOpacity onPress={() => toggleFav(item.id)}>
                                            <Text style={{ fontSize: 22 }}>{favorites[item.id] ? '❤️' : '🤍'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Title emoji + Title */}
                                <View style={styles.titleRow}>
                                    <Text style={styles.listingEmoji}>{item.emoji}</Text>
                                    <Text style={styles.listingTitle}>{item.title}</Text>
                                </View>

                                {/* Description */}
                                <Text style={styles.listingDesc} numberOfLines={2}>{item.description}</Text>

                                {/* Condition badge */}
                                {item.condition && item.condition !== 'N/A' && (
                                    <View style={styles.conditionBadge}>
                                        <Text style={styles.conditionText}>📋 {item.condition}</Text>
                                    </View>
                                )}

                                {/* Price */}
                                <Text style={[styles.listingPrice, { color: catColor }]}>
                                    {item.price === 0 ? '🤝 Free / Negotiate' : `₹${item.price.toLocaleString('en-IN')}`}
                                </Text>

                                {/* Footer: location + time + views */}
                                <View style={styles.listingMeta}>
                                    <Text style={styles.metaItem}>📍 {item.location}</Text>
                                    <Text style={styles.metaItem}>🕐 {item.timeAgo}</Text>
                                    <Text style={styles.metaItem}>👁 {item.views}</Text>
                                </View>

                                {/* Seller Row */}
                                <View style={styles.sellerRow}>
                                    <View style={styles.sellerAvatar}>
                                        <Text style={styles.sellerInitial}>
                                            {item.postedBy.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.sellerName}>{item.postedBy}</Text>
                                        <Text style={styles.sellerSub}>Seller</Text>
                                    </View>

                                    {/* Action Buttons */}
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.whatsappBtn]}
                                        onPress={() => whatsappSeller(item.whatsapp, item.title)}
                                    >
                                        <Text style={styles.wpBtnText}>💬 WhatsApp</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: catColor }]}
                                        onPress={() => callSeller(item.phone, item.postedBy)}
                                    >
                                        <Text style={styles.callBtnText}>📞</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                })}

                {/* Empty State */}
                {filtered.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={{ fontSize: 52 }}>🔍</Text>
                        <Text style={styles.emptyTitle}>कोई listing नहीं मिली</Text>
                        <Text style={styles.emptySub}>Search या category बदलें</Text>
                        <TouchableOpacity style={styles.emptyPostBtn} onPress={() => navigation.navigate('PostItem')}>
                            <Text style={styles.emptyPostBtnText}>+ पहली Listing Post करें</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Post CTA Banner */}
                <LinearGradient colors={['#4A148C', '#7B1FA2']} style={styles.postCta}>
                    <Text style={styles.postCtaEmoji}>🚀</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.postCtaTitle}>अपना सामान बेचें</Text>
                        <Text style={styles.postCtaSub}>Free listing • 50,000+ बैतूल users तक पहुंचें</Text>
                    </View>
                    <TouchableOpacity style={styles.postCtaBtn} onPress={() => navigation.navigate('PostItem')}>
                        <Text style={styles.postCtaBtnText}>Post →</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F3FF' },

    // Header
    header: { paddingTop: 48, paddingBottom: 20, paddingHorizontal: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
    backArrow: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    backLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    postHeaderBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    postHeaderText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
    headerSub: { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginBottom: 14 },

    // Stats
    statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12, marginBottom: 14, alignItems: 'center' },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { color: '#FFFFFF', fontWeight: '900', fontSize: 18 },
    statLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 2 },
    statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.25)' },

    // Search
    searchBox: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, alignItems: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: '#FFFFFF' },

    // Categories
    catSection: { backgroundColor: '#FFFFFF', elevation: 3 },
    catContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
    catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 22, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB' },
    catEmoji: { fontSize: 14 },
    catText: { fontWeight: '700', color: '#6B7280', fontSize: 12 },
    catTextActive: { color: '#FFFFFF' },
    catCount: { backgroundColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
    catCountActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
    catCountText: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
    catCountTextActive: { color: '#FFFFFF' },

    // Scroll & Meta
    scroll: { flex: 1, paddingHorizontal: 14 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
    metaCount: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
    sortBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
    sortBtnText: { color: '#374151', fontWeight: '700', fontSize: 12 },
    postBtn: { backgroundColor: '#7B1FA2', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    postBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

    // Sort Dropdown
    sortDropdown: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 8, marginBottom: 10, elevation: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10 },
    sortOptionActive: { backgroundColor: '#F5F3FF' },
    sortOptionText: { fontSize: 14, color: '#374151', fontWeight: '600' },
    sortCheck: { color: '#7B1FA2', fontWeight: '900', fontSize: 16 },

    // Listing Card
    listingCard: { backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 14, elevation: 3, shadowColor: '#4A148C', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, overflow: 'hidden' },
    listingAccent: { height: 4 },
    listingInner: { padding: 16 },
    listingTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    catBadgeText: { fontSize: 11, fontWeight: '700' },
    verifiedBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    verifiedText: { fontSize: 10, color: '#16A34A', fontWeight: '800' },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    listingEmoji: { fontSize: 28 },
    listingTitle: { fontSize: 17, fontWeight: '800', color: '#1F2937', flex: 1 },
    listingDesc: { fontSize: 13, color: '#6B7280', lineHeight: 19, marginBottom: 8 },
    conditionBadge: { alignSelf: 'flex-start', backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
    conditionText: { fontSize: 11, color: '#15803D', fontWeight: '600' },
    listingPrice: { fontSize: 22, fontWeight: '900', marginBottom: 10 },
    listingMeta: { flexDirection: 'row', gap: 12, marginBottom: 14 },
    metaItem: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },

    // Seller row
    sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
    sellerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
    sellerInitial: { fontSize: 18, fontWeight: '900', color: '#7B1FA2' },
    sellerName: { fontWeight: '700', fontSize: 13, color: '#1F2937' },
    sellerSub: { fontSize: 10, color: '#9CA3AF' },
    actionBtn: { borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
    whatsappBtn: { backgroundColor: '#25D366' },
    wpBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
    callBtnText: { fontSize: 18 },

    // Empty state
    emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
    emptySub: { color: '#9CA3AF', fontSize: 14 },
    emptyPostBtn: { marginTop: 16, backgroundColor: '#7B1FA2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    emptyPostBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

    // CTA Banner
    postCta: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
    postCtaEmoji: { fontSize: 36 },
    postCtaTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, marginBottom: 3 },
    postCtaSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
    postCtaBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
    postCtaBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});

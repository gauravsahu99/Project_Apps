import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    StatusBar, Keyboard, ScrollView, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ADS_DATA, MARKETPLACE_LISTINGS, ESSENTIALS_PRODUCTS, FAMOUS_PLACES } from '../constants/data';

const TRENDING = [
    { label: 'Cotton Saree', emoji: '🥻', type: 'fashion' },
    { label: 'Honda Activa', emoji: '🛵', type: 'vehicle' },
    { label: 'Kiryana Store', emoji: '🏪', type: 'shop' },
    { label: 'Gym near me', emoji: '🏋️', type: 'place' },
    { label: 'Pizza Betul', emoji: '🍕', type: 'food' },
    { label: 'Room for rent', emoji: '🏠', type: 'rental' },
];

const RECENT_SEARCHES = ['समोसे', 'Shirt ₹500', 'Raj Footwear', 'Gold earrings'];

const QUICK_CATEGORIES = [
    { label: 'Fashion', emoji: '👗', color: '#EC4899', screen: 'Fashion' },
    { label: 'Shops', emoji: '🏪', color: '#FF6B35', screen: 'Ads' },
    { label: 'Marketplace', emoji: '🛍️', color: '#7C3AED', screen: 'Marketplace' },
    { label: 'Essentials', emoji: '🌅', color: '#22C55E', screen: 'Essentials' },
    { label: 'Places', emoji: '🗺️', color: '#F59E0B', screen: 'FamousPlaces' },
    { label: 'Emergency', emoji: '🚨', color: '#EF4444', screen: 'Emergency' },
];

const TYPE_COLORS = {
    shop: '#FF6B35', listing: '#7C3AED', product: '#22C55E',
    place: '#F59E0B', fashion: '#EC4899',
};

export default function SearchScreen({ navigation }) {
    const [query, setQuery] = useState('');
    const [recent, setRecent] = useState(RECENT_SEARCHES);
    const inputRef = useRef(null);

    const results = query.trim().length < 2 ? [] : [
        ...ADS_DATA.filter(a =>
            a.shopName.toLowerCase().includes(query.toLowerCase()) ||
            a.category.toLowerCase().includes(query.toLowerCase())
        ).map(a => ({ ...a, _type: 'shop', _title: a.shopName, _sub: `${a.category} · ${a.offer}`, emoji: '🏪', color: TYPE_COLORS.shop })),
        ...MARKETPLACE_LISTINGS.filter(l => l.title.toLowerCase().includes(query.toLowerCase()))
            .map(l => ({ ...l, _type: 'listing', _title: l.title, _sub: `₹${l.price.toLocaleString()} · ${l.location}`, emoji: l.emoji || '🛍️', color: TYPE_COLORS.listing })),
        ...ESSENTIALS_PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.nameEn.toLowerCase().includes(query.toLowerCase())
        ).map(p => ({ ...p, _type: 'product', _title: p.name, _sub: `₹${p.price} ${p.unit}`, emoji: p.emoji, color: TYPE_COLORS.product })),
        ...FAMOUS_PLACES.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
            .map(p => ({ ...p, _type: 'place', _title: p.name, _sub: `${p.distance} · ⭐ ${p.rating}`, emoji: p.emoji, color: TYPE_COLORS.place })),
    ];

    const handleSearch = (text) => {
        setQuery(text);
    };

    const commitSearch = (text) => {
        Keyboard.dismiss();
        if (text.trim().length > 1 && !recent.includes(text)) {
            setRecent(r => [text, ...r].slice(0, 8));
        }
    };

    const handleResult = (item) => {
        commitSearch(query);
        if (item._type === 'shop') navigation.navigate('AdDetail', { ad: item });
        else if (item._type === 'listing') navigation.navigate('Marketplace');
        else if (item._type === 'product') navigation.navigate('Essentials');
        else if (item._type === 'place') navigation.navigate('FamousPlaces');
    };

    const clearRecent = () => Alert.alert('Clear History?', 'Remove all recent searches?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setRecent([]) },
    ]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                <View style={styles.searchRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.searchBox}>
                        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder="Search shops, products, places..."
                            placeholderTextColor="#9CA3AF"
                            value={query}
                            onChangeText={handleSearch}
                            onSubmitEditing={() => commitSearch(query)}
                            autoFocus
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <Text style={{ fontSize: 17, color: '#9CA3AF' }}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={styles.voiceBtn}
                        onPress={() => Alert.alert('🎤 Voice Search', 'Voice search coming soon!\nTap the mic icon to search by voice.')}>
                        <Text style={{ fontSize: 20 }}>🎤</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {query.length < 2 ? (
                    <>
                        {/* Quick Category Grid */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>✨ Quick Explore</Text>
                            <View style={styles.quickGrid}>
                                {QUICK_CATEGORIES.map((q, i) => (
                                    <TouchableOpacity key={i}
                                        style={[styles.quickCard, { borderColor: q.color + '44', backgroundColor: q.color + '0D' }]}
                                        onPress={() => navigation.navigate(q.screen)}>
                                        <View style={[styles.quickEmojiBox, { backgroundColor: q.color + '18' }]}>
                                            <Text style={{ fontSize: 26 }}>{q.emoji}</Text>
                                        </View>
                                        <Text style={[styles.quickLabel, { color: q.color }]}>{q.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Trending Searches */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🔥 Trending in Betul</Text>
                            <View style={styles.trendingList}>
                                {TRENDING.map((t, i) => (
                                    <TouchableOpacity key={i} style={styles.trendItem} onPress={() => {
                                        setQuery(t.label);
                                        commitSearch(t.label);
                                    }}>
                                        <View style={styles.trendRank}>
                                            <Text style={styles.trendRankText}>{i + 1}</Text>
                                        </View>
                                        <Text style={styles.trendEmoji}>{t.emoji}</Text>
                                        <Text style={styles.trendLabel}>{t.label}</Text>
                                        <Text style={styles.trendArrow}>↗</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Recent Searches */}
                        {recent.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>🕐 Recent Searches</Text>
                                    <TouchableOpacity onPress={clearRecent}>
                                        <Text style={styles.clearBtn}>Clear All</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.recentChips}>
                                    {recent.map((r, i) => (
                                        <TouchableOpacity key={i} style={styles.recentChip} onPress={() => setQuery(r)}>
                                            <Text style={styles.recentChipText}>🕐 {r}</Text>
                                            <TouchableOpacity onPress={() => setRecent(rc => rc.filter((_, idx) => idx !== i))}>
                                                <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 6 }}>✕</Text>
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        {/* Results count */}
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultsCount}>
                                {results.length > 0 ? `🔍 ${results.length} results for "${query}"` : `No results for "${query}"`}
                            </Text>
                        </View>

                        {results.length === 0 ? (
                            <View style={styles.noResults}>
                                <Text style={{ fontSize: 50, marginBottom: 14 }}>🔎</Text>
                                <Text style={styles.noResultsTitle}>Nothing found</Text>
                                <Text style={styles.noResultsSub}>Try different keywords or browse categories below</Text>
                                <View style={styles.suggestChips}>
                                    {TRENDING.slice(0, 4).map((t, i) => (
                                        <TouchableOpacity key={i} style={styles.suggestChip} onPress={() => setQuery(t.label)}>
                                            <Text style={styles.suggestChipText}>{t.emoji} {t.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            results.map((item, i) => (
                                <TouchableOpacity key={`${item._type}-${i}`} style={styles.resultCard} onPress={() => handleResult(item)} activeOpacity={0.85}>
                                    <View style={[styles.resultIcon, { backgroundColor: item.color + '18' }]}>
                                        <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                                    </View>
                                    <View style={styles.resultInfo}>
                                        <Text style={styles.resultTitle} numberOfLines={1}>{item._title}</Text>
                                        <Text style={styles.resultSub} numberOfLines={1}>{item._sub}</Text>
                                    </View>
                                    <View style={[styles.resultTypeBadge, { backgroundColor: item.color + '18' }]}>
                                        <Text style={[styles.resultTypeText, { color: item.color }]}>
                                            {item._type === 'shop' ? 'Shop' : item._type === 'listing' ? 'Sale' : item._type === 'product' ? 'Product' : 'Place'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    backIcon: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11 },
    input: { flex: 1, fontSize: 14, color: '#1F2937', fontWeight: '500' },
    voiceBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    scroll: { flex: 1 },
    section: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 14 },
    clearBtn: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    quickCard: { width: '30%', flexGrow: 1, alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5 },
    quickEmojiBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    quickLabel: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
    trendingList: {},
    trendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9', gap: 12 },
    trendRank: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    trendRankText: { fontSize: 12, fontWeight: '900', color: '#64748B' },
    trendEmoji: { fontSize: 20, width: 28 },
    trendLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1E293B' },
    trendArrow: { fontSize: 16, color: '#94A3B8' },
    recentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    recentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    recentChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
    resultsHeader: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
    resultsCount: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 8, borderRadius: 16, padding: 14, gap: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5 },
    resultIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    resultInfo: { flex: 1 },
    resultTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 3 },
    resultSub: { fontSize: 12, color: '#64748B' },
    resultTypeBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, flexShrink: 0 },
    resultTypeText: { fontSize: 11, fontWeight: '800' },
    noResults: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
    noResultsTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
    noResultsSub: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 20, lineHeight: 19 },
    suggestChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    suggestChip: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1 },
    suggestChipText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
});

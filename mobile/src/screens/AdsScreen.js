import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Linking, Alert, TextInput,
    StatusBar, Animated, Share, FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ADS_DATA } from '../constants/data';

// ─── EXTENDED DATA ────────────────────────────────────────────────────────────
const SHOP_CATEGORIES = [
    { id: 'all',         label: 'सभी',        emoji: '🏪', color: '#FF6B35' },
    { id: 'grocery',     label: 'किराना',     emoji: '🛒', color: '#4CAF50' },
    { id: 'clothing',    label: 'कपड़े',      emoji: '👗', color: '#E91E63' },
    { id: 'electronics', label: 'Electronics', emoji: '📱', color: '#1976D2' },
    { id: 'medical',     label: 'Medical',     emoji: '💊', color: '#43A047' },
    { id: 'food',        label: 'Food',        emoji: '🍕', color: '#FF9800' },
    { id: 'services',    label: 'Services',    emoji: '🔧', color: '#607D8B' },
    { id: 'education',   label: 'Education',   emoji: '📚', color: '#7B1FA2' },
];

const SORT_OPTIONS = [
    { id: 'default',  label: '⭐ Recommended' },
    { id: 'rating',   label: '⬆ Top Rated'    },
    { id: 'reviews',  label: '💬 Most Reviews' },
    { id: 'open',     label: '🟢 Open First'   },
    { id: 'newest',   label: '🆕 Newest'       },
];

const PROMO_OFFERS = [
    { id: '1', code: 'BETUL20', discount: '20% OFF', shop: 'Tech World Betul', color: '#1976D2', emoji: '📱' },
    { id: '2', code: 'FRESH10', discount: '₹50 OFF', shop: 'Betul Sweets', color: '#FF9800', emoji: '🍬' },
    { id: '3', code: 'NEWUSER', discount: 'Free Delivery', shop: 'Ganesh Kirana', color: '#4CAF50', emoji: '🛒' },
];

const MOCK_REVIEWS = {
    '1': [
        { name: 'Ravi K.', rating: 5, text: 'बहुत अच्छी दुकान! Quality और price दोनों best हैं। Highly recommended!', time: '2 दिन पहले' },
        { name: 'Sunita M.', rating: 4, text: 'Good variety, fast delivery. Staff is very helpful.', time: '5 दिन पहले' },
    ],
    '2': [
        { name: 'Priya S.', rating: 5, text: 'Amazing clothes collection, latest fashion at great prices!', time: '1 दिन पहले' },
        { name: 'Anjali R.', rating: 4, text: 'Good discount offers. Will shop again!', time: '1 हफ्ते पहले' },
    ],
    '3': [
        { name: 'Amit T.', rating: 5, text: 'Best electronics shop in Betul! Low prices and genuine products.', time: '3 दिन पहले' },
        { name: 'Rahul V.', rating: 5, text: 'Excellent service and fast repair. Very professional!', time: '4 दिन पहले' },
    ],
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdsScreen({ navigation }) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch]       = useState('');
    const [sortBy, setSortBy]       = useState('default');
    const [showSort, setShowSort]   = useState(false);
    const [showOpen, setShowOpen]   = useState(false);   // filter open only
    const [favorites, setFavorites] = useState({});
    const [expanded, setExpanded]   = useState(null);    // expanded shop id

    const scrollRef = useRef(null);
    const headerAnim = useRef(new Animated.Value(0)).current;

    // ── Helpers ──
    const toggleFav = (id) => setFavorites(f => ({ ...f, [id]: !f[id] }));
    const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

    const callShop = (phone, shopName) => {
        Alert.alert(`📞 ${shopName}`, `${phone} पर call करें?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: '📞 Call करें', onPress: () => Linking.openURL(`tel:${phone}`) },
        ]);
    };

    const whatsappShop = (whatsapp, shopName) => {
        const msg = encodeURIComponent(`नमस्ते! मैं "${shopName}" के बारे में जानकारी चाहता हूँ। क्या आप मुझे details दे सकते हैं?`);
        Linking.openURL(`https://wa.me/91${whatsapp}?text=${msg}`);
    };

    const openMap = (address) => {
        const url = `https://maps.google.com/?q=${encodeURIComponent(address + ', Betul, Madhya Pradesh')}`;
        Linking.openURL(url);
    };

    const shareShop = async (shop) => {
        try {
            await Share.share({
                message: `🏪 ${shop.shopName}\n${shop.tagline}\n📍 ${shop.address}\n📞 ${shop.phone}\n\n🎁 ${shop.offer}\n\nApna Betul App से खोजें!`,
                title: shop.shopName,
            });
        } catch (e) {}
    };

    const renderStars = (rating, size = 13) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Text key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB' }}>
                    ★
                </Text>
            );
        }
        return <View style={{ flexDirection: 'row' }}>{stars}</View>;
    };

    // ── Filter & Sort ──
    let displayShops = ADS_DATA.filter(ad => {
        const matchCat    = activeCategory === 'all' || ad.category === activeCategory;
        const q           = search.toLowerCase();
        const matchSearch = !q ||
            ad.shopName.toLowerCase().includes(q) ||
            ad.tagline.toLowerCase().includes(q) ||
            (ad.tags || []).some(t => t.toLowerCase().includes(q));
        const matchOpen   = !showOpen || ad.isOpen;
        return matchCat && matchSearch && matchOpen;
    });

    if (sortBy === 'rating')   displayShops = [...displayShops].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'reviews')  displayShops = [...displayShops].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    if (sortBy === 'open')     displayShops = [...displayShops].sort((a, b) => (b.isOpen ? 1 : 0) - (a.isOpen ? 1 : 0));

    const featured  = ADS_DATA.filter(a => a.plan === 'homepage');
    const openCount = ADS_DATA.filter(a => a.isOpen).length;
    const avgRating = (ADS_DATA.reduce((s, a) => s + a.rating, 0) / ADS_DATA.length).toFixed(1);

    // ─────────────── RENDER ───────────────────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#BF360C" />

            {/* ══════════ HEADER ══════════ */}
            <LinearGradient colors={['#7B1D00', '#BF360C', '#E64A19', '#FF7043']} style={styles.header}>

                {/* top row */}
                <View style={styles.headerTopRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                        <Text style={styles.backArrow}>←</Text>
                        <Text style={styles.backLabel}>होम</Text>
                    </TouchableOpacity>
                    <View style={styles.headerRightRow}>
                        <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>{openCount} Open</Text>
                        </View>
                        <TouchableOpacity style={styles.listShopBtn} onPress={() => Alert.alert('🏪 अपनी दुकान List करें', 'Coming soon! हम जल्द यह feature launch करेंगे।')}>
                            <Text style={styles.listShopText}>+ List Shop</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* title */}
                <Text style={styles.headerTitle}>🏪 Local Shops</Text>
                <Text style={styles.headerSub}>बैतूल की दुकानें — Deals, Offers & Direct Contact</Text>

                {/* ── 4-stat row ── */}
                <View style={styles.statsRow}>
                    {[
                        { num: `${ADS_DATA.length}+`, lbl: 'Shops' },
                        { num: `${openCount}`,         lbl: 'Open Now' },
                        { num: `${avgRating}`,         lbl: 'Avg Rating' },
                        { num: '8',                    lbl: 'Categories' },
                    ].map((s, i) => (
                        <View key={i} style={styles.statBox}>
                            <Text style={styles.statNum}>{s.num}</Text>
                            <Text style={styles.statLbl}>{s.lbl}</Text>
                        </View>
                    ))}
                </View>

                {/* ── Search bar ── */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBox}>
                        <Text style={styles.searchEmoji}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Shop, Service, Offer खोजें..."
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Text style={styles.searchClear}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={[styles.filterBtn, showOpen && styles.filterBtnActive]} onPress={() => setShowOpen(!showOpen)}>
                        <Text style={styles.filterBtnText}>{showOpen ? '🟢' : '⬤'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sortHeaderBtn} onPress={() => setShowSort(!showSort)}>
                        <Text style={styles.sortHeaderText}>⇅</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* ── Sort dropdown ── */}
            {showSort && (
                <View style={styles.sortDropdown}>
                    <Text style={styles.sortDropTitle}>Sort By</Text>
                    {SORT_OPTIONS.map(opt => (
                        <TouchableOpacity
                            key={opt.id}
                            style={[styles.sortOpt, sortBy === opt.id && styles.sortOptActive]}
                            onPress={() => { setSortBy(opt.id); setShowSort(false); }}
                        >
                            <Text style={[styles.sortOptText, sortBy === opt.id && { color: '#FF6B35', fontWeight: '800' }]}>
                                {opt.label}
                            </Text>
                            {sortBy === opt.id && <Text style={styles.sortCheck}>✓</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* ── Category chips ── */}
            <View style={styles.catBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catContent}>
                    {SHOP_CATEGORIES.map(cat => {
                        const count = cat.id === 'all' ? ADS_DATA.length : ADS_DATA.filter(a => a.category === cat.id).length;
                        const active = activeCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.catChip, active && { backgroundColor: cat.color, borderColor: cat.color }]}
                                onPress={() => setActiveCategory(cat.id)}
                            >
                                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                                <Text style={[styles.catText, active && { color: '#FFF' }]}>{cat.label}</Text>
                                <View style={[styles.catCount, active && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                                    <Text style={[styles.catCountText, active && { color: '#FFF' }]}>{count}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ══════════ MAIN SCROLL ══════════ */}
            <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {/* ── PROMO CODES STRIP ── */}
                {!search && activeCategory === 'all' && (
                    <View style={styles.promoSection}>
                        <View style={styles.promoHead}>
                            <Text style={styles.promoHeadTitle}>🎟️ आज के Promo Codes</Text>
                            <Text style={styles.promoHeadSub}>Tap to copy</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 4 }}>
                            {PROMO_OFFERS.map(p => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={[styles.promoCard, { borderColor: p.color + '40' }]}
                                    onPress={() => Alert.alert('🎟️ Promo Copied!', `Code: ${p.code}\n${p.discount} at ${p.shop}`)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.promoEmoji}>{p.emoji}</Text>
                                    <View style={[styles.promoCodeBox, { backgroundColor: p.color + '15' }]}>
                                        <Text style={[styles.promoCode, { color: p.color }]}>{p.code}</Text>
                                    </View>
                                    <Text style={styles.promoDiscount}>{p.discount}</Text>
                                    <Text style={styles.promoShop} numberOfLines={1}>{p.shop}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* ── FEATURED CAROUSEL ── */}
                {!search && activeCategory === 'all' && (
                    <View style={styles.section}>
                        <View style={styles.sectionHead}>
                            <Text style={styles.sectionTitle}>💎 Featured Businesses</Text>
                            <Text style={styles.sectionSub}>Top rated • Verified</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 20 }}>
                            {featured.map(ad => (
                                <TouchableOpacity
                                    key={ad.id}
                                    activeOpacity={0.92}
                                    onPress={() => navigation.navigate('AdDetail', { ad })}
                                >
                                    <LinearGradient colors={[ad.color + 'EE', ad.color + '88', '#1A1A2E']} style={styles.featCard}>
                                        {/* Fav + Open status */}
                                        <View style={styles.featTopRow}>
                                            <LinearGradient
                                                colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)']}
                                                style={styles.featBadgeBox}
                                            >
                                                <Text style={styles.featBadgeText}>{ad.badge}</Text>
                                            </LinearGradient>
                                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                                <View style={ad.isOpen ? styles.openPill : styles.closedPill}>
                                                    <View style={[styles.statusDot, { backgroundColor: ad.isOpen ? '#4ADE80' : '#9CA3AF' }]} />
                                                    <Text style={styles.statusText}>{ad.isOpen ? 'Open' : 'Closed'}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => toggleFav(ad.id)}>
                                                    <Text style={{ fontSize: 22 }}>{favorites[ad.id] ? '❤️' : '🤍'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Shop name + tagline */}
                                        <Text style={styles.featName}>{ad.shopName}</Text>
                                        <Text style={styles.featTagline}>{ad.tagline}</Text>

                                        {/* Stars */}
                                        <View style={styles.featRating}>
                                            {renderStars(ad.rating, 14)}
                                            <Text style={styles.featRatingNum}> {ad.rating} ({ad.reviews})</Text>
                                        </View>

                                        {/* Offer pill */}
                                        <View style={styles.featOfferPill}>
                                            <Text style={styles.featOfferText}>🎁 {ad.offer}</Text>
                                        </View>

                                        {/* Hours + Address */}
                                        <Text style={styles.featHours}>🕐 {ad.openTime}</Text>
                                        <Text style={styles.featAddr}>📍 {ad.address}</Text>

                                        {/* Action buttons */}
                                        <View style={styles.featActions}>
                                            <TouchableOpacity style={styles.featCallBtn} onPress={() => callShop(ad.phone, ad.shopName)}>
                                                <Text style={styles.featCallText}>📞 Call</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.featWaBtn} onPress={() => whatsappShop(ad.whatsapp, ad.shopName)}>
                                                <Text style={styles.featWaText}>💬 WA</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.featDetailBtn} onPress={() => navigation.navigate('AdDetail', { ad })}>
                                                <Text style={styles.featDetailText}>Details →</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* ── TRENDING / QUICK FILTER TAGS ── */}
                {!search && activeCategory === 'all' && (
                    <View style={styles.trendingSection}>
                        <Text style={styles.trendingTitle}>🔥 Trending Searches</Text>
                        <View style={styles.trendingTags}>
                            {['Medical 24/7', 'Home Delivery', 'EMI Available', 'Latest Fashion', 'Fresh Food', 'Repair Service'].map(tag => (
                                <TouchableOpacity
                                    key={tag}
                                    style={styles.trendTag}
                                    onPress={() => setSearch(tag.split(' ')[0])}
                                >
                                    <Text style={styles.trendTagText}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* ── ALL SHOPS LIST ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHead}>
                        <Text style={styles.sectionTitle}>
                            {search ? `🔍 Results for "${search}"` :
                             showOpen ? '🟢 Open Now' :
                             activeCategory !== 'all' ? `${SHOP_CATEGORIES.find(c => c.id === activeCategory)?.emoji} ${SHOP_CATEGORIES.find(c => c.id === activeCategory)?.label}` :
                             '🏪 सभी दुकानें'}
                        </Text>
                        <Text style={styles.sectionSub}>{displayShops.length} shops</Text>
                    </View>

                    {displayShops.map((ad) => {
                        const isExpanded = expanded === ad.id;
                        const reviews = MOCK_REVIEWS[ad.id] || [];
                        const catObj  = SHOP_CATEGORIES.find(c => c.id === ad.category);

                        return (
                            <View key={ad.id} style={[styles.shopCard, !ad.isOpen && styles.shopCardClosed]}>
                                {/* Top gradient strip */}
                                <LinearGradient colors={[ad.color, ad.color + '66']} style={styles.shopStrip} />

                                <View style={styles.shopInner}>
                                    {/* ── ROW 1: Name + status + fav ── */}
                                    <View style={styles.shopRow1}>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.shopNameRow}>
                                                <Text style={styles.shopName} numberOfLines={1}>{ad.shopName}</Text>
                                                {ad.plan === 'homepage' && (
                                                    <View style={styles.verifiedBadge}>
                                                        <Text style={styles.verifiedText}>✓</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.shopCatLabel}>{catObj?.emoji} {catObj?.label}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <View style={ad.isOpen ? styles.openChip : styles.closedChip}>
                                                <View style={[styles.chipDot, { backgroundColor: ad.isOpen ? '#22C55E' : '#9CA3AF' }]} />
                                                <Text style={[styles.chipText, { color: ad.isOpen ? '#15803D' : '#9CA3AF' }]}>
                                                    {ad.isOpen ? 'Open' : 'Closed'}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => toggleFav(ad.id)}>
                                                <Text style={{ fontSize: 22 }}>{favorites[ad.id] ? '❤️' : '🤍'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* ── Tagline ── */}
                                    <Text style={styles.shopTagline}>{ad.tagline}</Text>

                                    {/* ── Stars + Review count ── */}
                                    <View style={styles.shopRatingRow}>
                                        {renderStars(ad.rating)}
                                        <Text style={styles.shopRatingNum}>{ad.rating}</Text>
                                        <Text style={styles.shopReviews}>({ad.reviews} reviews)</Text>
                                        <View style={[styles.planBadge, { backgroundColor: ad.color + '18', borderColor: ad.color + '44' }]}>
                                            <Text style={[styles.planText, { color: ad.color }]}>{ad.plan}</Text>
                                        </View>
                                    </View>

                                    {/* ── Offer pill ── */}
                                    <View style={[styles.offerPill, { borderColor: ad.color + '40' }]}>
                                        <Text style={[styles.offerPillIcon, { color: ad.color }]}>🎁</Text>
                                        <Text style={[styles.offerPillText, { color: ad.color }]}>{ad.offer}</Text>
                                    </View>

                                    {/* ── Tags ── */}
                                    {ad.tags && (
                                        <View style={styles.tagsRow}>
                                            {ad.tags.map(tag => (
                                                <View key={tag} style={styles.tag}>
                                                    <Text style={styles.tagText}>#{tag}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* ── Hours + Address ── */}
                                    <View style={styles.shopMeta}>
                                        <View style={styles.shopMetaItem}>
                                            <Text style={styles.shopMetaIcon}>🕐</Text>
                                            <Text style={styles.shopMetaText}>{ad.openTime}</Text>
                                        </View>
                                        <View style={styles.shopMetaItem}>
                                            <Text style={styles.shopMetaIcon}>📍</Text>
                                            <Text style={styles.shopMetaText} numberOfLines={1}>{ad.address}</Text>
                                        </View>
                                    </View>

                                    {/* ── 4 Action buttons ── */}
                                    <View style={styles.shopActions}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: ad.color }]}
                                            onPress={() => callShop(ad.phone, ad.shopName)}
                                        >
                                            <Text style={styles.actionBtnText}>📞 Call</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.waBtn]}
                                            onPress={() => whatsappShop(ad.whatsapp, ad.shopName)}
                                        >
                                            <Text style={styles.actionBtnText}>💬 WA</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.mapBtn]}
                                            onPress={() => openMap(ad.address)}
                                        >
                                            <Text style={styles.actionBtnText}>🗺️ Map</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.shareBtn]}
                                            onPress={() => shareShop(ad)}
                                        >
                                            <Text style={styles.actionBtnText}>↗️ Share</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* ── More / Expand toggle ── */}
                                    <TouchableOpacity
                                        style={styles.expandBtn}
                                        onPress={() => toggleExpand(ad.id)}
                                    >
                                        <Text style={styles.expandBtnText}>
                                            {isExpanded ? '▲ कम दिखाएं' : '▼ Reviews & Details देखें'}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* ── EXPANDED SECTION ── */}
                                    {isExpanded && (
                                        <View style={styles.expandedSection}>
                                            {/* Details info grid */}
                                            <View style={styles.detailGrid}>
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailIcon}>📞</Text>
                                                    <Text style={styles.detailValue}>{ad.phone}</Text>
                                                    <Text style={styles.detailLabel}>Phone</Text>
                                                </View>
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailIcon}>📦</Text>
                                                    <Text style={styles.detailValue}>{ad.plan.toUpperCase()}</Text>
                                                    <Text style={styles.detailLabel}>Plan</Text>
                                                </View>
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailIcon}>⭐</Text>
                                                    <Text style={styles.detailValue}>{ad.rating}/5</Text>
                                                    <Text style={styles.detailLabel}>Rating</Text>
                                                </View>
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailIcon}>💬</Text>
                                                    <Text style={styles.detailValue}>{ad.reviews}</Text>
                                                    <Text style={styles.detailLabel}>Reviews</Text>
                                                </View>
                                            </View>

                                            {/* Reviews */}
                                            {reviews.length > 0 && (
                                                <View style={styles.reviewsSection}>
                                                    <Text style={styles.reviewsTitle}>💬 Customer Reviews</Text>
                                                    {reviews.map((r, idx) => (
                                                        <View key={idx} style={styles.reviewCard}>
                                                            <View style={styles.reviewHeader}>
                                                                <View style={styles.reviewAvatar}>
                                                                    <Text style={styles.reviewInitial}>{r.name[0]}</Text>
                                                                </View>
                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={styles.reviewName}>{r.name}</Text>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                                        {renderStars(r.rating, 11)}
                                                                        <Text style={styles.reviewTime}>{r.time}</Text>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            <Text style={styles.reviewText}>{r.text}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}

                                            {/* Full details button */}
                                            <TouchableOpacity
                                                style={[styles.fullDetailBtn, { borderColor: ad.color }]}
                                                onPress={() => navigation.navigate('AdDetail', { ad })}
                                            >
                                                <Text style={[styles.fullDetailBtnText, { color: ad.color }]}>
                                                    View Full Details →
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}

                    {displayShops.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>🏪</Text>
                            <Text style={styles.emptyTitle}>कोई shop नहीं मिली</Text>
                            <Text style={styles.emptySub}>Search, Category, या Open filter बदलें</Text>
                            <TouchableOpacity style={styles.emptyResetBtn} onPress={() => { setSearch(''); setActiveCategory('all'); setShowOpen(false); }}>
                                <Text style={styles.emptyResetText}>Reset Filters</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* ── ADVERTISE YOUR SHOP CTA ── */}
                <LinearGradient colors={['#0F0F1E', '#1A1A2E', '#2D1B69']} style={styles.advertCta}>
                    <View style={styles.advertGlow} />
                    <Text style={styles.advertMainEmoji}>📢</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.advertTitle}>अपनी दुकान List करें</Text>
                        <Text style={styles.advertSub}>50,000+ बैतूल users तक — ₹999/month से</Text>
                        <View style={styles.advertFeatureRow}>
                            {['✅ Featured card', '✅ WhatsApp button', '✅ Offer banner', '✅ Reviews'].map(f => (
                                <Text key={f} style={styles.advertFeature}>{f}</Text>
                            ))}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.advertBtn}
                        onPress={() => Alert.alert('🎉 Great!', 'हम जल्द आपसे contact करेंगे!\n\nAbhiके liye: 9876543000 पर WhatsApp करें।')}
                    >
                        <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.advertBtnGradient}>
                            <Text style={styles.advertBtnText}>List Now →</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
            </ScrollView>
        </View>
    );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF8F5' },

    // ── Header ──
    header: { paddingTop: 48, paddingBottom: 18, paddingHorizontal: 20 },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    backArrow: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    backLabel: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    headerRightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74,222,128,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(74,222,128,0.4)' },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
    liveText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
    listShopBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
    listShopText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
    headerTitle: { fontSize: 30, fontWeight: '900', color: '#FFF', marginBottom: 4, letterSpacing: -0.5 },
    headerSub: { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginBottom: 16 },

    // ── Stats ──
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    statNum: { color: '#FFF', fontWeight: '900', fontSize: 18 },
    statLbl: { color: 'rgba(255,255,255,0.65)', fontSize: 9, marginTop: 2, fontWeight: '600' },

    // ── Search ──
    searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    searchEmoji: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#FFF' },
    searchClear: { color: 'rgba(255,255,255,0.7)', fontSize: 18 },
    filterBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    filterBtnActive: { backgroundColor: 'rgba(74,222,128,0.35)', borderColor: '#4ADE80' },
    filterBtnText: { fontSize: 18 },
    sortHeaderBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    sortHeaderText: { color: '#FFF', fontSize: 20, fontWeight: '700' },

    // ── Sort Dropdown ──
    sortDropdown: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 4, borderRadius: 18, elevation: 12, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, padding: 12, zIndex: 200 },
    sortDropTitle: { fontWeight: '900', fontSize: 14, color: '#1F2937', marginBottom: 8, paddingHorizontal: 4 },
    sortOpt: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12 },
    sortOptActive: { backgroundColor: '#FFF5F0' },
    sortOptText: { fontSize: 14, color: '#374151', fontWeight: '600' },
    sortCheck: { color: '#FF6B35', fontWeight: '900', fontSize: 16 },

    // ── Category bar ──
    catBar: { backgroundColor: '#FFF', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
    catContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
    catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 22, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB' },
    catEmoji: { fontSize: 14 },
    catText: { fontWeight: '700', color: '#6B7280', fontSize: 12 },
    catCount: { backgroundColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
    catCountText: { fontSize: 10, fontWeight: '700', color: '#6B7280' },

    // ── Main scroll ──
    scroll: { flex: 1 },

    // ── Promo codes ──
    promoSection: { paddingTop: 18 },
    promoHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 16, marginBottom: 12 },
    promoHeadTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
    promoHeadSub: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
    promoCard: { width: 140, backgroundColor: '#FFF', borderRadius: 16, padding: 14, elevation: 3, alignItems: 'center', borderWidth: 1.5 },
    promoEmoji: { fontSize: 28, marginBottom: 8 },
    promoCodeBox: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 6 },
    promoCode: { fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
    promoDiscount: { fontWeight: '800', fontSize: 14, color: '#1F2937', marginBottom: 3 },
    promoShop: { fontSize: 10, color: '#9CA3AF', textAlign: 'center' },

    // ── Sections ──
    section: { paddingHorizontal: 16, paddingTop: 18 },
    sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1F2937' },
    sectionSub: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },

    // ── Featured carousel card ──
    featCard: { width: 300, borderRadius: 24, padding: 20, elevation: 10, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14 },
    featTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    featBadgeBox: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    featBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
    openPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(74,222,128,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    closedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
    featName: { color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 4, lineHeight: 28 },
    featTagline: { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginBottom: 12 },
    featRating: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    featRatingNum: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700' },
    featOfferPill: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 12 },
    featOfferText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    featHours: { color: 'rgba(255,255,255,0.72)', fontSize: 11, marginBottom: 4 },
    featAddr: { color: 'rgba(255,255,255,0.72)', fontSize: 11, marginBottom: 14 },
    featActions: { flexDirection: 'row', gap: 8 },
    featCallBtn: { flex: 1.2, backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 11, alignItems: 'center' },
    featCallText: { color: '#1F2937', fontWeight: '800', fontSize: 12 },
    featWaBtn: { flex: 1, backgroundColor: '#25D366', borderRadius: 14, paddingVertical: 11, alignItems: 'center' },
    featWaText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
    featDetailBtn: { flex: 1.4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
    featDetailText: { color: '#FFF', fontWeight: '800', fontSize: 12 },

    // ── Trending ──
    trendingSection: { paddingHorizontal: 16, paddingTop: 16 },
    trendingTitle: { fontSize: 15, fontWeight: '800', color: '#1F2937', marginBottom: 10 },
    trendingTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    trendTag: { backgroundColor: '#FFF3EE', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: '#FECDB2' },
    trendTagText: { color: '#EA580C', fontWeight: '700', fontSize: 12 },

    // ── Shop Card ──
    shopCard: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 14, elevation: 4, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, overflow: 'hidden' },
    shopCardClosed: { opacity: 0.78 },
    shopStrip: { height: 5 },
    shopInner: { padding: 16 },
    shopRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    shopNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    shopName: { fontSize: 17, fontWeight: '900', color: '#1F2937', flex: 1 },
    verifiedBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
    verifiedText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    shopCatLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },
    openChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    closedChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    chipDot: { width: 6, height: 6, borderRadius: 3 },
    chipText: { fontSize: 11, fontWeight: '700' },
    shopTagline: { color: '#6B7280', fontSize: 12, lineHeight: 18, marginBottom: 10 },
    shopRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    shopRatingNum: { fontWeight: '800', fontSize: 13, color: '#1F2937' },
    shopReviews: { fontSize: 11, color: '#9CA3AF', flex: 1 },
    planBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
    planText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    offerPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#FFF7ED', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, marginBottom: 10 },
    offerPillIcon: { fontSize: 14 },
    offerPillText: { fontWeight: '700', fontSize: 12 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
    tag: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    tagText: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
    shopMeta: { gap: 5, marginBottom: 14 },
    shopMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    shopMetaIcon: { fontSize: 14, width: 20, textAlign: 'center' },
    shopMetaText: { fontSize: 12, color: '#6B7280', flex: 1 },
    shopActions: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
    actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 11 },
    waBtn: { backgroundColor: '#25D366' },
    mapBtn: { backgroundColor: '#1A73E8' },
    shareBtn: { backgroundColor: '#6B7280' },
    expandBtn: { alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 4 },
    expandBtnText: { color: '#FF6B35', fontWeight: '700', fontSize: 12 },

    // ── Expanded section ──
    expandedSection: { paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 4 },
    detailGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    detailItem: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 10, alignItems: 'center' },
    detailIcon: { fontSize: 20, marginBottom: 4 },
    detailValue: { fontWeight: '800', fontSize: 12, color: '#1F2937', textAlign: 'center' },
    detailLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
    reviewsSection: { marginBottom: 14 },
    reviewsTitle: { fontWeight: '800', fontSize: 13, color: '#1F2937', marginBottom: 10 },
    reviewCard: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12, marginBottom: 8 },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    reviewAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
    reviewInitial: { fontSize: 16, fontWeight: '900', color: '#EF4444' },
    reviewName: { fontWeight: '700', fontSize: 12, color: '#1F2937', marginBottom: 2 },
    reviewTime: { fontSize: 10, color: '#9CA3AF', marginLeft: 4 },
    reviewText: { fontSize: 12, color: '#4B5563', lineHeight: 18 },
    fullDetailBtn: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 11, alignItems: 'center' },
    fullDetailBtnText: { fontWeight: '800', fontSize: 13 },

    // ── Empty state ──
    emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
    emptyEmoji: { fontSize: 52 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
    emptySub: { color: '#9CA3AF', fontSize: 13, textAlign: 'center' },
    emptyResetBtn: { marginTop: 12, backgroundColor: '#FF6B35', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 14 },
    emptyResetText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

    // ── Advertise CTA ──
    advertCta: { marginHorizontal: 16, marginTop: 16, marginBottom: 16, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 14, overflow: 'hidden', position: 'relative' },
    advertGlow: { position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: '#FF6B35', opacity: 0.12 },
    advertMainEmoji: { fontSize: 36, marginTop: 4 },
    advertTitle: { color: '#FFF', fontWeight: '900', fontSize: 18, marginBottom: 4 },
    advertSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 10 },
    advertFeatureRow: { flexWrap: 'wrap', flexDirection: 'row', gap: 6 },
    advertFeature: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600' },
    advertBtn: { alignSelf: 'flex-start', marginTop: 6, borderRadius: 14, overflow: 'hidden', elevation: 4 },
    advertBtnGradient: { paddingHorizontal: 16, paddingVertical: 11 },
    advertBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
});

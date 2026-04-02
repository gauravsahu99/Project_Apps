import React, { useRef, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, Alert,
    TouchableOpacity, Dimensions, Animated, StatusBar, TextInput
    , ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { BANNER_DATA, HOME_CATEGORIES, ADS_DATA, FAMOUS_PLACES } from '../constants/data';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const { width } = Dimensions.get('window');
const BANNER_W = width - 48;

export default function HomeScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const scrollX = useRef(new Animated.Value(0)).current;
    const bannerRef = useRef(null);
    const [activeBanner, setActiveBanner] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [countdown, setCountdown] = useState({ h: '02', m: '34', s: '59' });

    // countdown timer for flash deals
    useEffect(() => {
        let secs = 2 * 3600 + 34 * 60 + 59;
        const t = setInterval(() => {
            secs = Math.max(0, secs - 1);
            const h = String(Math.floor(secs / 3600)).padStart(2, '0');
            const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
            const s = String(secs % 60).padStart(2, '0');
            setCountdown({ h, m, s });
        }, 1000);
        return () => clearInterval(t);
    }, []);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'सुप्रभात 🌅';
        if (h < 17) return 'नमस्ते ☀️';
        return 'शुभ संध्या 🌙';
    };

    const getWeather = () => {
        const h = new Date().getHours();
        if (h < 6) return { icon: '🌙', temp: '18°C', desc: 'ठंडी रात' };
        if (h < 10) return { icon: '🌤️', temp: '22°C', desc: 'सुबह की धूप' };
        if (h < 16) return { icon: '☀️', temp: '32°C', desc: 'गर्म दोपहर' };
        return { icon: '🌇', temp: '28°C', desc: 'शाम की हवा' };
    };
    const weather = getWeather();

    // Auto-scroll banner
    useEffect(() => {
        const interval = setInterval(() => {
            const next = (activeBanner + 1) % BANNER_DATA.length;
            setActiveBanner(next);
            bannerRef?.current?.scrollTo({ x: next * (BANNER_W + 12), animated: true });
        }, 3000);
        return () => clearInterval(interval);
    }, [activeBanner]);

    const ALL_CATEGORIES_EXTENDED = [
        ...HOME_CATEGORIES,
        { id: '7', name: 'Jobs', nameHi: 'नौकरी', emoji: '💼', screen: 'Marketplace', color: '#9C27B0' },
        { id: '8', name: 'News', nameHi: 'समाचार', emoji: '📰', screen: 'CityInfo', color: '#607D8B' },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* ── HEADER ── */}
            <LinearGradient colors={['#FF6B35', '#E85D2E', '#C94A23']} style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.greeting}>{greeting()}</Text>
                        <Text style={styles.userName}>{user?.name || 'बैतूल निवासी'} 👋</Text>
                    </View>
                    <View style={styles.headerRight}>
                        {/* Weather Widget */}
                        <View style={styles.weatherBadge}>
                            <Text style={{ fontSize: 16 }}>{weather.icon}</Text>
                            <Text style={styles.weatherTemp}>{weather.temp}</Text>
                        </View>
                        {/* Notifications */}
                        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
                            <Text style={{ fontSize: 20 }}>🔔</Text>
                            <View style={styles.notifDot} />
                        </TouchableOpacity>
                        {/* Cart */}
                        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
                            <Text style={{ fontSize: 20 }}>🛒</Text>
                            {cartCount > 0 && (
                                <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>
                            )}
                        </TouchableOpacity>
                        {/* Profile */}
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            <View style={styles.avatarCircle}>
                                <Text style={{ fontSize: 18 }}>👤</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Location Row */}
                <View style={styles.locationRow}>
                    <Text style={styles.locationText}>📍 बैतूल, मध्यप्रदेश</Text>
                    <View style={styles.weatherSmall}>
                        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{weather.desc}</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="दुकान, सामान या जगह खोजें..."
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                        onFocus={() => navigation.navigate('Search')}
                    />
                </View>
            </LinearGradient>

            <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>

                {/* ── FLASH DEALS COUNTDOWN ── */}
                <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Fashion')}>
                    <LinearGradient colors={['#EF4444', '#7C3AED']} style={styles.flashBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <Text style={styles.flashEmoji}>⚡</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.flashTitle}>Flash Sale — Ends in</Text>
                            <Text style={styles.flashSub}>Fashion items up to 70% OFF</Text>
                        </View>
                        <View style={styles.countdownBox}>
                            <View style={styles.cdUnit}><Text style={styles.cdNum}>{countdown.h}</Text><Text style={styles.cdLabel}>HR</Text></View>
                            <Text style={styles.cdColon}>:</Text>
                            <View style={styles.cdUnit}><Text style={styles.cdNum}>{countdown.m}</Text><Text style={styles.cdLabel}>MIN</Text></View>
                            <Text style={styles.cdColon}>:</Text>
                            <View style={styles.cdUnit}><Text style={styles.cdNum}>{countdown.s}</Text><Text style={styles.cdLabel}>SEC</Text></View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* ── LIVE STATS BAR ── */}
                <View style={styles.statsBar}>
                    {[
                        { label: '🏪 Active Shops', value: '124+' },
                        { label: '👥 Online Now', value: '1.2K' },
                        { label: '📦 Orders Today', value: '340+' },
                    ].map((s, i) => (
                        <View key={i} style={styles.statItem}>
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── BANNER CAROUSEL ── */}
                <View style={styles.section}>
                    <ScrollView
                        ref={bannerRef}
                        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                        scrollEventThrottle={16}
                        style={styles.bannerScroll}
                        onMomentumScrollEnd={e => {
                            const idx = Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + 12));
                            setActiveBanner(idx);
                        }}
                    >
                        {BANNER_DATA.map((b, i) => (
                            <LinearGradient key={b.id} colors={b.gradient} style={[styles.banner, { width: BANNER_W }]}>
                                <Text style={styles.bannerEmoji}>{b.emoji}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.bannerTitle}>{b.title}</Text>
                                    <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                                </View>
                            </LinearGradient>
                        ))}
                    </ScrollView>
                    {/* Dots Indicator */}
                    <View style={styles.dotsRow}>
                        {BANNER_DATA.map((_, i) => (
                            <View key={i} style={[styles.dot, activeBanner === i && styles.dotActive]} />
                        ))}
                    </View>
                </View>

                {/* ── ADVERTISEMENT BANNERS (above Quick Access) ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📢 Advertisement</Text>
                        <View style={styles.adLiveTag}><Text style={styles.adLiveText}>● LIVE</Text></View>
                    </View>
                    {[
                        { id: 1, shop: 'Sharma Garments', tagline: '👔 Summer Collection 2025', desc: 'Arrow, Raymond & Van Heusen — shirts from ₹499. Civil Lines, Betul.', offer: '40% OFF', emoji: '👔', grad: ['#1E3A5F', '#2563EB'], phone: '9876543210' },
                        { id: 2, shop: 'Priya Saree Center', tagline: '🥻 Wedding & Festival Sarees', desc: 'Pure silk sarees from ₹999. 500+ designs. Free blouse stitching! Sarafa Bazar.', offer: 'Buy 2 Get 1 Free', emoji: '🥻', grad: ['#7C1C60', '#DB2777'], phone: '9812345678' },
                        { id: 3, shop: 'Betul Jewellers', tagline: '💍 Gold & Silver — 40 Yr Trust', desc: 'Hallmark certified jewelry. No making charges today! Sarafa Bazar, Betul.', offer: 'No Making Charges', emoji: '💍', grad: ['#78350F', '#D97706'], phone: '9901234567' },
                    ].map(ad => (
                        <TouchableOpacity key={ad.id} activeOpacity={0.9}
                            onPress={() => Alert.alert(`🏪 ${ad.shop}`, `${ad.desc}\n\n🎁 Offer: ${ad.offer}\n📞 Call: ${ad.phone}`)}
                            style={styles.homeAdWrap}>
                            <LinearGradient colors={ad.grad} style={styles.homeAdCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View style={styles.homeAdTop}>
                                    <Text style={styles.homeAdEmoji}>{ad.emoji}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.homeAdShop}>{ad.shop}</Text>
                                        <Text style={styles.homeAdTagline}>{ad.tagline}</Text>
                                        <Text style={styles.homeAdDesc} numberOfLines={2}>{ad.desc}</Text>
                                    </View>
                                </View>
                                <View style={styles.homeAdFooter}>
                                    <View style={styles.homeOfferBadge}>
                                        <Text style={styles.homeOfferText}>🎁 {ad.offer}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.homeCallBtn}
                                        onPress={() => Alert.alert(`📞 ${ad.shop}`, `Calling ${ad.phone}...`)}>
                                        <Text style={styles.homeCallText}>📞 Call Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── QUICK ACCESS CATEGORIES ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📌 Quick Access</Text>
                    <View style={styles.categoryGrid}>
                        {ALL_CATEGORIES_EXTENDED.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.categoryCard, { borderColor: cat.color + '33' }]}
                                onPress={() => navigation.navigate(cat.screen)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.catIconBg, { backgroundColor: cat.color + '18' }]}>
                                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                                </View>
                                <Text style={styles.catName}>{cat.nameHi}</Text>
                                <Text style={styles.catNameEn}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── FEATURED ADS ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📢 Local Shops</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Ads')}>
                            <Text style={styles.seeAll}>सभी देखें →</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled={true}>
                        {ADS_DATA.slice(0, 4).map(ad => (
                            <TouchableOpacity
                                key={ad.id}
                                style={styles.adCard}
                                onPress={() => navigation.navigate('AdDetail', { ad })}
                                activeOpacity={0.9}
                            >
                                <LinearGradient colors={[ad.color, ad.color + 'CC']} style={styles.adGradient}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Text style={styles.adBadge}>{ad.badge}</Text>
                                        <Text style={{ color: '#fff', fontSize: 11 }}>⭐ {ad.rating}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.adShopName}>{ad.shopName}</Text>
                                        <Text style={styles.adOffer}>{ad.offer}</Text>
                                    </View>
                                    <View style={styles.adFooter}>
                                        <Text style={styles.adPhone}>📞 Call Now</Text>
                                        <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, padding: 4 }}>
                                            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>View →</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ── MORNING DELIVERY CTA ── */}
                <View style={[styles.section, { paddingBottom: 8 }]}>
                    <TouchableOpacity onPress={() => navigation.navigate('Essentials')} activeOpacity={0.9}>
                        <LinearGradient colors={['#1A1A2E', '#0F3460']} style={styles.morningCta}>
                            <Text style={styles.ctaEmoji}>🌅</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.ctaTitle}>सुबह की डिलीवरी</Text>
                                <Text style={styles.ctaSubtitle}>अंडा • रोटी • दूध • समोसे</Text>
                                <View style={styles.ctaHintBox}>
                                    <Text style={styles.ctaHint}>सुबह 8 बजे से पहले Order करें</Text>
                                </View>
                            </View>
                            <Text style={styles.ctaArrow}>→</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>



                {/* ── FAMOUS PLACES ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🗺️ Famous Places</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('FamousPlaces')}>
                            <Text style={styles.seeAll}>सभी देखें →</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled={true}>
                        {FAMOUS_PLACES.slice(0, 4).map(place => (
                            <TouchableOpacity key={place.id} style={styles.placeCard} activeOpacity={0.9}>
                                <View style={[styles.placeEmojiBg, { backgroundColor: place.color + '22' }]}>
                                    <Text style={styles.placeEmoji}>{place.emoji}</Text>
                                </View>
                                <Text style={styles.placeName}>{place.name}</Text>
                                <Text style={styles.placeDistance}>📍 {place.distance}</Text>
                                <Text style={styles.placeRating}>⭐ {place.rating}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    userName: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    weatherBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 5
    },
    weatherTemp: { color: '#fff', fontSize: 13, fontWeight: '700' },
    iconBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative'
    },
    notifDot: {
        position: 'absolute', top: 6, right: 6,
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#FF3B30', borderWidth: 1.5, borderColor: '#FF6B35'
    },
    cartBadge: {
        position: 'absolute', top: -3, right: -3,
        backgroundColor: '#F7C948', width: 18, height: 18, borderRadius: 9,
        alignItems: 'center', justifyContent: 'center'
    },
    cartBadgeText: { fontSize: 10, fontWeight: '800', color: '#1A1A2E' },
    avatarCircle: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)'
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    locationText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    weatherSmall: {},
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFFFF', borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3
    },
    searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
    scroll: { flex: 1 },
    section: { paddingHorizontal: 20, paddingTop: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1F2937', marginBottom: 14 },
    seeAll: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
    bannerScroll: { borderRadius: 16, marginBottom: 10 },
    banner: { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginRight: 12, height: 105 },
    bannerEmoji: { fontSize: 42 },
    bannerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginBottom: 4 },
    bannerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
    dotActive: { width: 18, backgroundColor: COLORS.primary },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryCard: {
        width: (width - 40 - 24) / 4,
        backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 4,
        alignItems: 'center', borderWidth: 1.5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    catIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
    catEmoji: { fontSize: 22 },
    catName: { fontSize: 11, fontWeight: '800', color: '#1F2937', textAlign: 'center', lineHeight: 14 },
    catNameEn: { fontSize: 9, color: '#9CA3AF', textAlign: 'center', marginTop: 2 },
    adCard: { width: 190, marginRight: 12, borderRadius: 16, overflow: 'hidden', elevation: 4 },
    adGradient: { padding: 14, height: 130, justifyContent: 'space-between' },
    adBadge: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
    adShopName: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', lineHeight: 18 },
    adOffer: { color: 'rgba(255,255,255,0.9)', fontSize: 11, marginTop: 2 },
    adFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    adPhone: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
    morningCta: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
    ctaEmoji: { fontSize: 40 },
    ctaTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 2 },
    ctaSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 8 },
    ctaHintBox: { backgroundColor: '#FF6B35', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    ctaHint: { color: '#fff', fontSize: 11, fontWeight: '700' },
    ctaArrow: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginLeft: 'auto' },
    placeCard: { width: 130, marginRight: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, alignItems: 'center', elevation: 2 },
    placeEmojiBg: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    placeEmoji: { fontSize: 26 },
    placeName: { fontSize: 11, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 4, lineHeight: 15 },
    placeDistance: { fontSize: 10, color: '#9CA3AF' },
    placeRating: { fontSize: 10, color: '#FF9800', fontWeight: '600', marginTop: 2 },

    // Home Advertisement Banners
    adLiveTag: { backgroundColor: '#EF4444', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
    adLiveText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
    homeAdWrap: { marginBottom: 14 },
    homeAdCard: { borderRadius: 20, padding: 16, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 10 },
    homeAdTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
    homeAdEmoji: { fontSize: 44, marginTop: 2 },
    homeAdShop: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 },
    homeAdTagline: { fontSize: 17, fontWeight: '900', color: '#FFFFFF', marginTop: 3, lineHeight: 22 },
    homeAdDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 5, lineHeight: 17 },
    homeAdFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    homeOfferBadge: { flex: 1, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
    homeOfferText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
    homeCallBtn: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9, flexShrink: 0 },
    homeCallText: { fontSize: 12, fontWeight: '800', color: '#1E293B' },

    // Flash Deal Banner
    flashBanner: { marginHorizontal: 16, marginTop: 10, marginBottom: 4, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 6, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 10 },
    flashEmoji: { fontSize: 34 },
    flashTitle: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },
    flashSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
    countdownBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cdUnit: { backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, alignItems: 'center', minWidth: 38 },
    cdNum: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', lineHeight: 22 },
    cdLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
    cdColon: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },

    // Live Stats Bar
    statsBar: { flexDirection: 'row', marginHorizontal: 16, marginTop: 10, marginBottom: 4, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
    statItem: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F1F5F9' },
    statValue: { fontSize: 17, fontWeight: '900', color: '#0F172A' },
    statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2, textAlign: 'center' },
});

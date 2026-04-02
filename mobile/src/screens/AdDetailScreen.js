import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Linking,
    Alert, ScrollView, StatusBar, Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_REVIEWS = {
    '1': [
        { name: 'Ravi Kumar', rating: 5, text: 'बहुत अच्छी दुकान! Quality और price दोनों best हैं।', time: '2 दिन पहले', helpful: 14 },
        { name: 'Sunita Mehra', rating: 4, text: 'Good variety, fast delivery. Staff is very polite and helpful.', time: '5 दिन पहले', helpful: 8 },
        { name: 'Priya Sharma', rating: 5, text: 'सबसे best place! Always fresh products and good service.', time: '1 हफ्ते पहले', helpful: 21 },
    ],
    '2': [
        { name: 'Anjali Roy', rating: 5, text: 'Amazing collection! Latest fashion at great prices.', time: '1 दिन पहले', helpful: 6 },
        { name: 'Meena Patil', rating: 4, text: 'Good discount offers. Will shop again! Nice staff.', time: '4 दिन पहले', helpful: 3 },
    ],
    '3': [
        { name: 'Amit Thakur', rating: 5, text: 'Best electronics shop in Betul! Low prices and genuine products.', time: '3 दिन पहले', helpful: 19 },
        { name: 'Rahul Verma', rating: 5, text: 'Excellent mobile repair service. Very professional!', time: '6 दिन पहले', helpful: 11 },
        { name: 'Sanjay Gupta', rating: 4, text: 'Good stock, transparent pricing. Recommended!', time: '2 हफ्ते पहले', helpful: 7 },
    ],
};

const SIMILAR_SHOPS_DATA = [
    { emoji: '🛒', label: 'किराना shops', category: 'grocery' },
    { emoji: '📱', label: 'Electronics',  category: 'electronics' },
    { emoji: '🍕', label: 'Food shops',   category: 'food' },
    { emoji: '💊', label: 'Medical',      category: 'medical' },
];

export default function AdDetailScreen({ route, navigation }) {
    const { ad } = route.params;
    const [helpfulVotes, setHelpfulVotes] = useState({});

    const reviews = MOCK_REVIEWS[ad.id] || [
        { name: 'Customer', rating: 4, text: 'Great shop! Highly recommended.', time: '1 दिन पहले', helpful: 5 },
    ];

    const callShop = () => {
        Alert.alert(`📞 ${ad.shopName}`, `${ad.phone} पर call करें?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: '📞 Call करें', onPress: () => Linking.openURL(`tel:${ad.phone}`) },
        ]);
    };

    const openWhatsApp = () => {
        const msg = encodeURIComponent(`नमस्ते! मैं "${ad.shopName}" के बारे में जानकारी चाहता हूँ। कृपया details बताएं।`);
        Linking.openURL(`https://wa.me/91${ad.whatsapp || ad.phone}?text=${msg}`);
    };

    const openMap = () => {
        const url = `https://maps.google.com/?q=${encodeURIComponent(ad.address + ', Betul, Madhya Pradesh')}`;
        Linking.openURL(url);
    };

    const shareShop = async () => {
        try {
            await Share.share({
                message: `🏪 ${ad.shopName}\n${ad.tagline}\n📍 ${ad.address}\n📞 ${ad.phone}\n🎁 ${ad.offer}\n\nApna Betul App पर देखें!`,
                title: ad.shopName,
            });
        } catch (e) {}
    };

    const voteHelpful = (idx) => {
        setHelpfulVotes(v => ({ ...v, [idx]: !v[idx] }));
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Text key={i} style={{ fontSize: 14, color: i < Math.round(rating) ? '#F59E0B' : '#E5E7EB' }}>★</Text>
        ));
    };

    const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    const ratingDist = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        pct: Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100),
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={ad.color} />

            {/* ══ HERO HEADER ══ */}
            <LinearGradient colors={[ad.color + 'FF', ad.color + 'BB', '#1A1A2E']} style={styles.hero}>
                {/* Back + Share */}
                <View style={styles.heroTopRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                        <Text style={styles.backArrow}>←</Text>
                        <Text style={styles.backLabel}>Shops</Text>
                    </TouchableOpacity>
                    <View style={styles.heroRightRow}>
                        <TouchableOpacity style={styles.heroIconBtn} onPress={shareShop}>
                            <Text style={styles.heroIconText}>↗</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Badge + Open status */}
                <View style={styles.heroBadgeRow}>
                    <View style={styles.badgeBox}>
                        <Text style={styles.badgeText}>{ad.badge}</Text>
                    </View>
                    <View style={ad.isOpen ? styles.openPill : styles.closedPill}>
                        <View style={[styles.statusDot, { backgroundColor: ad.isOpen ? '#4ADE80' : '#9CA3AF' }]} />
                        <Text style={styles.statusText}>{ad.isOpen ? 'Open Now' : 'Currently Closed'}</Text>
                    </View>
                </View>

                {/* Shop name + tagline */}
                <Text style={styles.heroName}>{ad.shopName}</Text>
                <Text style={styles.heroTagline}>{ad.tagline}</Text>

                {/* Plan + Rating row */}
                <View style={styles.heroMetaRow}>
                    <View style={styles.heroPlanBadge}>
                        <Text style={styles.heroPlanText}>{ad.plan?.toUpperCase()} MEMBER</Text>
                    </View>
                    <View style={styles.heroRatingBox}>
                        <Text style={styles.heroRatingStar}>⭐</Text>
                        <Text style={styles.heroRatingNum}>{ad.rating}</Text>
                        <Text style={styles.heroRatingReviews}>({reviews.length} reviews)</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* ══ 4 Quick Action Buttons ══ */}
            <View style={styles.quickActions}>
                <TouchableOpacity style={styles.qaBtn} onPress={callShop}>
                    <LinearGradient colors={[ad.color, ad.color + 'CC']} style={styles.qaBtnGradient}>
                        <Text style={styles.qaBtnEmoji}>📞</Text>
                        <Text style={styles.qaBtnLabel}>Call</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.qaBtn} onPress={openWhatsApp}>
                    <LinearGradient colors={['#25D366', '#128C7E']} style={styles.qaBtnGradient}>
                        <Text style={styles.qaBtnEmoji}>💬</Text>
                        <Text style={styles.qaBtnLabel}>WhatsApp</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.qaBtn} onPress={openMap}>
                    <LinearGradient colors={['#1A73E8', '#0D5CB5']} style={styles.qaBtnGradient}>
                        <Text style={styles.qaBtnEmoji}>🗺️</Text>
                        <Text style={styles.qaBtnLabel}>Map</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.qaBtn} onPress={shareShop}>
                    <LinearGradient colors={['#6B7280', '#4B5563']} style={styles.qaBtnGradient}>
                        <Text style={styles.qaBtnEmoji}>↗️</Text>
                        <Text style={styles.qaBtnLabel}>Share</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* ══ SPECIAL OFFER CARD ══ */}
                <View style={[styles.offerCard, { borderColor: ad.color + '50', shadowColor: ad.color }]}>
                    <LinearGradient colors={[ad.color + '18', ad.color + '06']} style={styles.offerCardInner}>
                        <View style={[styles.offerIconBox, { backgroundColor: ad.color + '22' }]}>
                            <Text style={styles.offerEmoji}>🎁</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.offerLabel}>Special Offer for You</Text>
                            <Text style={[styles.offerText, { color: ad.color }]}>{ad.offer}</Text>
                            <Text style={styles.offerSub}>Limited time • Show this to claim</Text>
                        </View>
                        <TouchableOpacity style={[styles.claimBtn, { backgroundColor: ad.color }]} onPress={callShop}>
                            <Text style={styles.claimBtnText}>Claim</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* ══ SHOP DETAILS CARD ══ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏪 Shop Details</Text>
                    {[
                        { icon: '📍', label: 'Address',  value: ad.address },
                        { icon: '📞', label: 'Phone',    value: ad.phone },
                        { icon: '🕐', label: 'Hours',    value: ad.openTime || 'Mon–Sat: 9 AM – 9 PM' },
                        { icon: '🏷️', label: 'Category', value: ad.category?.charAt(0).toUpperCase() + ad.category?.slice(1) },
                        { icon: '📦', label: 'Plan',     value: ad.plan?.toUpperCase() },
                    ].map(row => (
                        <View key={row.label} style={styles.detailRow}>
                            <Text style={styles.detailIcon}>{row.icon}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.detailLabel}>{row.label}</Text>
                                <Text style={styles.detailValue}>{row.value}</Text>
                            </View>
                            {row.label === 'Address' && (
                                <TouchableOpacity style={[styles.miniBtn, { backgroundColor: '#1A73E8' }]} onPress={openMap}>
                                    <Text style={styles.miniBtnText}>Maps</Text>
                                </TouchableOpacity>
                            )}
                            {row.label === 'Phone' && (
                                <TouchableOpacity style={[styles.miniBtn, { backgroundColor: ad.color }]} onPress={callShop}>
                                    <Text style={styles.miniBtnText}>Call</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {/* Tags */}
                    {ad.tags && (
                        <View style={styles.tagsSection}>
                            <Text style={styles.tagsLabel}>Tags</Text>
                            <View style={styles.tagsRow}>
                                {ad.tags.map(tag => (
                                    <View key={tag} style={[styles.tag, { backgroundColor: ad.color + '15', borderColor: ad.color + '40' }]}>
                                        <Text style={[styles.tagText, { color: ad.color }]}>#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* ══ RATINGS & REVIEWS ══ */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>⭐ Ratings & Reviews</Text>

                    {/* Rating summary */}
                    <View style={styles.ratingSummary}>
                        <View style={styles.ratingBig}>
                            <Text style={styles.ratingBigNum}>{avgRating}</Text>
                            <View style={{ flexDirection: 'row' }}>{renderStars(parseFloat(avgRating))}</View>
                            <Text style={styles.ratingBigCount}>{reviews.length} reviews</Text>
                        </View>
                        <View style={styles.ratingBars}>
                            {ratingDist.map(d => (
                                <View key={d.star} style={styles.ratingBarRow}>
                                    <Text style={styles.ratingBarStar}>{d.star}★</Text>
                                    <View style={styles.ratingBarBg}>
                                        <View style={[styles.ratingBarFill, { width: `${d.pct || 0}%`, backgroundColor: d.star >= 4 ? '#22C55E' : d.star === 3 ? '#F59E0B' : '#EF4444' }]} />
                                    </View>
                                    <Text style={styles.ratingBarCount}>{d.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Review cards */}
                    <View style={styles.reviewsList}>
                        {reviews.map((review, idx) => (
                            <View key={idx} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={[styles.reviewAvatar, { backgroundColor: ad.color + '22' }]}>
                                        <Text style={[styles.reviewInitial, { color: ad.color }]}>
                                            {review.name.charAt(0)}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.reviewName}>{review.name}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <View style={{ flexDirection: 'row' }}>{renderStars(review.rating)}</View>
                                            <Text style={styles.reviewTime}>{review.time}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.reviewText}>{review.text}</Text>
                                <TouchableOpacity
                                    style={styles.helpfulBtn}
                                    onPress={() => voteHelpful(idx)}
                                >
                                    <Text style={[styles.helpfulBtnText, helpfulVotes[idx] && { color: '#1976D2', fontWeight: '800' }]}>
                                        👍 Helpful ({review.helpful + (helpfulVotes[idx] ? 1 : 0)})
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* Write review CTA */}
                        <TouchableOpacity
                            style={[styles.writeReviewBtn, { borderColor: ad.color + '50' }]}
                            onPress={() => Alert.alert('✍️ Review लिखें', 'Coming soon! यह feature जल्द launch होगा।')}
                        >
                            <Text style={[styles.writeReviewText, { color: ad.color }]}>✍️ Review लिखें</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ══ CONTACT FLOATING CTA ══ */}
                <View style={styles.ctaCard}>
                    <LinearGradient colors={['#0F0F1E', '#1A1A2E']} style={styles.ctaGradient}>
                        <Text style={styles.ctaTitle}>Ready to visit or order?</Text>
                        <Text style={styles.ctaSub}>Contact {ad.shopName} directly</Text>
                        <View style={styles.ctaActions}>
                            <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: ad.color }]} onPress={callShop}>
                                <Text style={styles.ctaBtnText}>📞 Call Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: '#25D366' }]} onPress={openWhatsApp}>
                                <Text style={styles.ctaBtnText}>💬 WhatsApp</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },

    // ── Hero ──
    hero: { paddingTop: 48, paddingBottom: 28, paddingHorizontal: 22 },
    heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    backArrow: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    backLabel: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    heroRightRow: { flexDirection: 'row', gap: 10 },
    heroIconBtn: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    heroIconText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
    heroBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    badgeBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
    openPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(74,222,128,0.25)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    closedPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    heroName: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 6, lineHeight: 36 },
    heroTagline: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 16, lineHeight: 21 },
    heroMetaRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    heroPlanBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    heroPlanText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    heroRatingBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    heroRatingStar: { fontSize: 16 },
    heroRatingNum: { color: '#FFF', fontWeight: '900', fontSize: 18 },
    heroRatingReviews: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

    // ── Quick Actions ──
    quickActions: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFF', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, gap: 10 },
    qaBtn: { flex: 1, borderRadius: 14, overflow: 'hidden', elevation: 3 },
    qaBtnGradient: { paddingVertical: 13, alignItems: 'center' },
    qaBtnEmoji: { fontSize: 20, marginBottom: 2 },
    qaBtnLabel: { color: '#FFF', fontWeight: '800', fontSize: 10 },

    // ── Scroll ──
    scroll: { flex: 1 },

    // ── Offer Card ──
    offerCard: { marginHorizontal: 16, marginTop: 18, borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, elevation: 4, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 10 },
    offerCardInner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
    offerIconBox: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    offerEmoji: { fontSize: 30 },
    offerLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4, fontWeight: '600' },
    offerText: { fontSize: 17, fontWeight: '900', marginBottom: 3 },
    offerSub: { fontSize: 11, color: '#9CA3AF' },
    claimBtn: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
    claimBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },

    // ── Generic Card ──
    card: { marginHorizontal: 16, marginTop: 14, backgroundColor: '#FFF', borderRadius: 20, padding: 18, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
    cardTitle: { fontSize: 17, fontWeight: '900', color: '#1F2937', marginBottom: 16 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
    detailIcon: { fontSize: 22, width: 28, textAlign: 'center' },
    detailLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
    detailValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
    miniBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
    miniBtnText: { color: '#FFF', fontWeight: '800', fontSize: 11 },
    tagsSection: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14, marginTop: 6 },
    tagsLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
    tagText: { fontSize: 12, fontWeight: '700' },

    // ── Ratings ──
    ratingSummary: { flexDirection: 'row', gap: 20, marginBottom: 20 },
    ratingBig: { alignItems: 'center', justifyContent: 'center' },
    ratingBigNum: { fontSize: 52, fontWeight: '900', color: '#1F2937', lineHeight: 58 },
    ratingBigCount: { fontSize: 11, color: '#9CA3AF', marginTop: 4, fontWeight: '600' },
    ratingBars: { flex: 1, justifyContent: 'center', gap: 5 },
    ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    ratingBarStar: { fontSize: 11, color: '#F59E0B', fontWeight: '700', width: 20 },
    ratingBarBg: { flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
    ratingBarFill: { height: '100%', borderRadius: 4 },
    ratingBarCount: { fontSize: 11, color: '#9CA3AF', width: 16, textAlign: 'right' },

    // ── Reviews ──
    reviewsList: { gap: 12 },
    reviewCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 14 },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    reviewAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    reviewInitial: { fontSize: 20, fontWeight: '900' },
    reviewName: { fontWeight: '800', fontSize: 13, color: '#1F2937', marginBottom: 3 },
    reviewTime: { fontSize: 10, color: '#9CA3AF', marginLeft: 4 },
    reviewText: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginBottom: 10 },
    helpfulBtn: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#F3F4F6', borderRadius: 8 },
    helpfulBtnText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
    writeReviewBtn: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
    writeReviewText: { fontWeight: '800', fontSize: 14 },

    // ── CTA ──
    ctaCard: { marginHorizontal: 16, marginTop: 14, borderRadius: 22, overflow: 'hidden' },
    ctaGradient: { padding: 22 },
    ctaTitle: { color: '#FFF', fontWeight: '900', fontSize: 20, marginBottom: 4 },
    ctaSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 18 },
    ctaActions: { flexDirection: 'row', gap: 12 },
    ctaBtn: { flex: 1, borderRadius: 16, paddingVertical: 15, alignItems: 'center', elevation: 4 },
    ctaBtnText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
});

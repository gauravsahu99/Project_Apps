import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Animated, StatusBar, Dimensions, Alert, Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TIERS = [
    { name: 'Bronze', nameHi: 'कांस्य', min: 0, max: 500, color: '#CD7F32', icon: '🥉' },
    { name: 'Silver', nameHi: 'चाँदी', min: 500, max: 2000, color: '#C0C0C0', icon: '🥈' },
    { name: 'Gold', nameHi: 'सोना', min: 2000, max: 5000, color: '#FFD700', icon: '🥇' },
    { name: 'Platinum', nameHi: 'प्लैटिनम', min: 5000, max: 999999, color: '#E5E4E2', icon: '💎' },
];

const REWARDS = [
    { id: 1, title: 'Free Delivery', titleHi: 'मुफ्त डिलीवरी', points: 100, icon: '🚴', value: '₹40 off', expires: '30 days', category: 'delivery' },
    { id: 2, title: '10% Cashback', titleHi: '10% कैशबैक', points: 200, icon: '💰', value: 'up to ₹50', expires: '15 days', category: 'cashback' },
    { id: 3, title: 'Flash Sale Access', titleHi: 'फ्लैश सेल', points: 350, icon: '⚡', value: 'Early Access', expires: '7 days', category: 'special' },
    { id: 4, title: 'Grocery Voucher', titleHi: 'किराना कूपन', points: 500, icon: '🛒', value: '₹100 off', expires: '30 days', category: 'voucher' },
    { id: 5, title: 'Premium Membership', titleHi: 'प्रीमियम सदस्यता', points: 1000, icon: '👑', value: '1 Month Free', expires: '90 days', category: 'premium' },
];

const BADGES = [
    { id: 1, name: 'First Order', nameHi: 'पहला ऑर्डर', icon: '🎯', earned: true, desc: 'Completed your first order' },
    { id: 2, name: 'Regular', nameHi: 'नियमित', icon: '📅', earned: true, desc: '10 orders completed' },
    { id: 3, name: 'Big Spender', nameHi: 'बड़ा खरीदार', icon: '💎', earned: true, desc: 'Spent ₹5000+' },
    { id: 4, name: 'Referral King', nameHi: 'रेफरल किंग', icon: '👑', earned: false, desc: 'Refer 5 friends' },
    { id: 5, name: 'Night Owl', nameHi: 'रात का उल्लू', icon: '🦉', earned: false, desc: 'Order after 10 PM' },
    { id: 6, name: 'Foodie', nameHi: 'फूडी', icon: '🍕', earned: false, desc: 'Order from 5 food shops' },
];

const MY_POINTS = 1340;
const MY_TIER_IDX = 2; // Gold

export default function LoyaltyScreen({ navigation }) {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(-200)).current;
    const [selectedTab, setSelectedTab] = useState('rewards');

    const tier = TIERS[MY_TIER_IDX];
    const nextTier = TIERS[MY_TIER_IDX + 1];
    const progressPct = nextTier
        ? ((MY_POINTS - tier.min) / (nextTier.min - tier.min)) * 100
        : 100;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progressPct,
            duration: 1200,
            useNativeDriver: false,
        }).start();

        const shimmer = Animated.loop(
            Animated.timing(shimmerAnim, { toValue: width + 200, duration: 1800, useNativeDriver: true })
        );
        shimmerAnim.setValue(-200);
        shimmer.start();
        return () => shimmer.stop();
    }, []);

    const handleRedeem = (reward) => {
        if (MY_POINTS >= reward.points) {
            Alert.alert(
                `🎉 Redeem ${reward.title}?`,
                `Use ${reward.points} points to get ${reward.value}\n\nValid for: ${reward.expires}`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Redeem Now', onPress: () => Alert.alert('✅ Redeemed!', 'Coupon added to your wallet.') },
                ]
            );
        } else {
            Alert.alert('❌ Not Enough Points', `You need ${reward.points - MY_POINTS} more points.`);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `🎁 Join Apna Betul and get ₹50 cashback on your first order! Use my referral code: AB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                title: 'Apna Betul Referral',
            });
        } catch (e) {}
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header Card */}
                <LinearGradient colors={['#0F172A', '#1E293B', '#2D3748']} style={styles.heroCard}>
                    <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                        <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.tierBadge}>
                        <Text style={{ fontSize: 36 }}>{tier.icon}</Text>
                        <View>
                            <Text style={[styles.tierName, { color: tier.color }]}>{tier.name} Member</Text>
                            <Text style={styles.tierNameHi}>{tier.nameHi} सदस्य</Text>
                        </View>
                    </View>

                    <View style={styles.pointsContainer}>
                        <Text style={styles.pointsNumber}>{MY_POINTS.toLocaleString()}</Text>
                        <Text style={styles.pointsLabel}>Points • पॉइंट्स</Text>
                    </View>

                    {/* Progress to next tier */}
                    {nextTier && (
                        <View style={styles.progressSection}>
                            <View style={styles.progressLabelRow}>
                                <Text style={styles.progressText}>{tier.icon} {tier.name}</Text>
                                <Text style={styles.progressPoints}>{nextTier.min - MY_POINTS} pts to {nextTier.name}</Text>
                                <Text style={styles.progressText}>{nextTier.icon} {nextTier.name}</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: tier.color }]}>
                                    <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerAnim }] }]} />
                                </Animated.View>
                            </View>
                        </View>
                    )}
                </LinearGradient>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    {[
                        { label: 'Total Earned', value: '2,840', icon: '✨' },
                        { label: 'Redeemed', value: '1,500', icon: '🎁' },
                        { label: 'Expiring Soon', value: '200', icon: '⏰' },
                    ].map((s, i) => (
                        <View key={i} style={styles.statCard}>
                            <Text style={styles.statIcon}>{s.icon}</Text>
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Referral Card */}
                <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.referralCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.referralTitle}>👥 Refer & Earn</Text>
                        <Text style={styles.referralSub}>दोस्त को invite करें</Text>
                        <Text style={styles.referralDesc}>You get 200pts · Friend gets ₹50 cashback</Text>
                    </View>
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                        <Text style={{ color: '#7C3AED', fontWeight: '900', fontSize: 13 }}>Share 🔗</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Tabs */}
                <View style={styles.tabs}>
                    {['rewards', 'badges', 'history'].map(tab => (
                        <TouchableOpacity key={tab} style={[styles.tab, selectedTab === tab && styles.tabActive]} onPress={() => setSelectedTab(tab)}>
                            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                                {tab === 'rewards' ? '🎁 Rewards' : tab === 'badges' ? '🏅 Badges' : '📋 History'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Rewards Tab */}
                {selectedTab === 'rewards' && (
                    <View style={styles.rewardsGrid}>
                        {REWARDS.map(r => {
                            const canRedeem = MY_POINTS >= r.points;
                            return (
                                <View key={r.id} style={[styles.rewardCard, !canRedeem && styles.rewardCardDim]}>
                                    <View style={styles.rewardIconBox}>
                                        <Text style={{ fontSize: 30 }}>{r.icon}</Text>
                                    </View>
                                    <Text style={styles.rewardTitle}>{r.title}</Text>
                                    <Text style={styles.rewardTitleHi}>{r.titleHi}</Text>
                                    <Text style={styles.rewardValue}>{r.value}</Text>
                                    <TouchableOpacity
                                        style={[styles.redeemBtn, canRedeem ? styles.redeemBtnActive : styles.redeemBtnDisabled]}
                                        onPress={() => handleRedeem(r)}>
                                        <Text style={[styles.redeemBtnText, !canRedeem && { color: '#94A3B8' }]}>
                                            {canRedeem ? `🎁 ${r.points} pts` : `🔒 ${r.points} pts`}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.rewardExpiry}>⏰ {r.expires}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Badges Tab */}
                {selectedTab === 'badges' && (
                    <View style={styles.badgesGrid}>
                        {BADGES.map(b => (
                            <View key={b.id} style={[styles.badgeCard, !b.earned && styles.badgeCardDim]}>
                                <Text style={[styles.badgeIcon, !b.earned && { opacity: 0.35 }]}>{b.icon}</Text>
                                <Text style={styles.badgeName}>{b.name}</Text>
                                <Text style={styles.badgeNameHi}>{b.nameHi}</Text>
                                <Text style={styles.badgeDesc}>{b.desc}</Text>
                                {b.earned && <Text style={styles.badgeEarned}>✅ Earned</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* History Tab */}
                {selectedTab === 'history' && (
                    <View style={{ paddingHorizontal: 16, paddingBottom: 30 }}>
                        {[
                            { date: 'Today', action: 'Order #ORD-2847', pts: '+50', color: '#22C55E' },
                            { date: 'Yesterday', action: 'Referral Bonus', pts: '+200', color: '#22C55E' },
                            { date: 'Mar 25', action: 'Redeemed Voucher', pts: '-100', color: '#EF4444' },
                            { date: 'Mar 24', action: 'Order #ORD-2801', pts: '+75', color: '#22C55E' },
                            { date: 'Mar 23', action: 'Signup Bonus', pts: '+100', color: '#22C55E' },
                            { date: 'Mar 22', action: 'Order #ORD-2788', pts: '+30', color: '#22C55E' },
                        ].map((h, i) => (
                            <View key={i} style={styles.historyRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.historyAction}>{h.action}</Text>
                                    <Text style={styles.historyDate}>{h.date}</Text>
                                </View>
                                <Text style={[styles.historyPts, { color: h.color }]}>{h.pts}</Text>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    heroCard: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 28 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
    tierName: { fontSize: 22, fontWeight: '900' },
    tierNameHi: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 },
    pointsContainer: { alignItems: 'center', marginBottom: 24 },
    pointsNumber: { fontSize: 56, fontWeight: '900', color: '#FFFFFF', letterSpacing: -2 },
    pointsLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600', marginTop: 4 },
    progressSection: { marginTop: 8 },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' },
    progressPoints: { color: '#FF6B35', fontSize: 11, fontWeight: '800' },
    progressBar: { height: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 6, overflow: 'hidden' },
    shimmer: { position: 'absolute', top: 0, bottom: 0, width: 80, backgroundColor: 'rgba(255,255,255,0.25)', transform: [{ skewX: '-20deg' }] },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 16 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
    statIcon: { fontSize: 22, marginBottom: 6 },
    statValue: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
    statLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '600', textAlign: 'center', marginTop: 2 },
    referralCard: { marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', elevation: 6, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
    referralTitle: { color: '#fff', fontSize: 17, fontWeight: '900' },
    referralSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 3 },
    referralDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 5 },
    shareBtn: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
    tabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 20, backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    tabActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
    tabText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    tabTextActive: { color: '#0F172A', fontWeight: '800' },
    rewardsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, paddingTop: 16, paddingBottom: 30 },
    rewardCard: { width: (width - 44) / 2, backgroundColor: '#fff', borderRadius: 20, padding: 16, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
    rewardCardDim: { opacity: 0.65 },
    rewardIconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    rewardTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
    rewardTitleHi: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    rewardValue: { fontSize: 13, fontWeight: '700', color: '#FF6B35', marginTop: 6 },
    redeemBtn: { marginTop: 12, width: '100%', paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
    redeemBtnActive: { backgroundColor: '#FF6B35' },
    redeemBtnDisabled: { backgroundColor: '#F1F5F9' },
    redeemBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
    rewardExpiry: { fontSize: 10, color: '#94A3B8', marginTop: 6 },
    badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, paddingTop: 16, paddingBottom: 30 },
    badgeCard: { width: (width - 44) / 2, backgroundColor: '#fff', borderRadius: 20, padding: 16, alignItems: 'center', elevation: 2 },
    badgeCardDim: { opacity: 0.5, backgroundColor: '#F8FAFC' },
    badgeIcon: { fontSize: 40, marginBottom: 8 },
    badgeName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
    badgeNameHi: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    badgeDesc: { fontSize: 11, color: '#64748B', marginTop: 5, textAlign: 'center' },
    badgeEarned: { fontSize: 11, color: '#22C55E', fontWeight: '700', marginTop: 8 },
    historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    historyAction: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
    historyDate: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
    historyPts: { fontSize: 18, fontWeight: '900' },
});

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    StatusBar, Alert, TextInput, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const STAR_ASPECTS = [
    { key: 'overall', label: 'Overall Experience', labelHi: 'कुल अनुभव' },
    { key: 'quality', label: 'Product Quality', labelHi: 'उत्पाद गुणवत्ता' },
    { key: 'delivery', label: 'Delivery Speed', labelHi: 'डिलीवरी स्पीड' },
    { key: 'packaging', label: 'Packaging', labelHi: 'पैकेजिंग' },
];

const QUICK_TAGS = [
    '✅ Fresh Products', '⚡ Fast Delivery', '📦 Great Packaging',
    '😊 Friendly Staff', '💰 Good Value', '🔄 Will Order Again',
    '📱 Easy to Use', '🍎 Premium Quality'
];

function StarRating({ value, onChange, size = 32 }) {
    return (
        <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => onChange(star)}>
                    <Text style={{ fontSize: size, color: star <= value ? '#F59E0B' : '#E5E7EB' }}>★</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

export default function ReviewScreen({ navigation, route }) {
    const order = route?.params?.order || { id: 'ORD-2847', shopName: 'Sharma Kirana Store', shopEmoji: '🏪', items: ['दूध 1L', 'ब्रेड', 'अंडे'] };
    const [ratings, setRatings] = useState({ overall: 0, quality: 0, delivery: 0, packaging: 0 });
    const [selectedTags, setSelectedTags] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [driverRating, setDriverRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const toggleTag = (tag) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleSubmit = () => {
        if (ratings.overall === 0) {
            Alert.alert('⚠️ Rating Required', 'Please give at least an overall rating.');
            return;
        }
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
                <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFillObject} />
                <Text style={{ fontSize: 80 }}>🎉</Text>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 20, textAlign: 'center' }}>Thank You!</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 12, fontSize: 15, textAlign: 'center', paddingHorizontal: 40 }}>
                    आपकी review submit हो गई!{'\n'}आपको 50 Loyalty Points मिले 🎁
                </Text>
                <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.doneBtn}>
                    <TouchableOpacity onPress={() => navigation?.goBack()}>
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>Back to Home →</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>⭐ Rate Your Order</Text>
            </LinearGradient>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Order Info */}
                <View style={styles.orderInfo}>
                    <Text style={{ fontSize: 40 }}>{order.shopEmoji}</Text>
                    <View style={{ marginLeft: 14 }}>
                        <Text style={styles.shopName}>{order.shopName}</Text>
                        <Text style={styles.orderId}>{order.id} • {order.items.slice(0, 2).join(', ')}{order.items.length > 2 ? '...' : ''}</Text>
                    </View>
                </View>

                {/* Per-Aspect Ratings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Rate Each Aspect</Text>
                    {STAR_ASPECTS.map(asp => (
                        <View key={asp.key} style={styles.aspectRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.aspectLabel}>{asp.label}</Text>
                                <Text style={styles.aspectLabelHi}>{asp.labelHi}</Text>
                            </View>
                            <StarRating
                                value={ratings[asp.key]}
                                onChange={val => setRatings(prev => ({ ...prev, [asp.key]: val }))}
                                size={28}
                            />
                        </View>
                    ))}
                </View>

                {/* Quick Tags */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🏷️ Quick Tags</Text>
                    <View style={styles.tagsWrap}>
                        {QUICK_TAGS.map(tag => (
                            <TouchableOpacity
                                key={tag}
                                style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                                onPress={() => toggleTag(tag)}>
                                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Written Review */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✍️ Write a Review</Text>
                    <TextInput
                        style={styles.reviewInput}
                        placeholder="अपना अनुभव बताएं... (optional)"
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={4}
                        value={reviewText}
                        onChangeText={setReviewText}
                        maxLength={300}
                    />
                    <Text style={styles.charCount}>{reviewText.length}/300</Text>
                </View>

                {/* Driver Rating */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🚴 Rate Delivery Partner</Text>
                    <View style={styles.driverRateCard}>
                        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.driverAvatar}>
                            <Text style={{ fontSize: 24 }}>👤</Text>
                        </LinearGradient>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={styles.driverName}>Rohit Kumar</Text>
                            <StarRating value={driverRating} onChange={setDriverRating} size={26} />
                        </View>
                    </View>
                </View>

                {/* Submit */}
                <TouchableOpacity style={styles.submitWrap} onPress={handleSubmit}>
                    <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.submitBtn}>
                        <Text style={styles.submitText}>Submit Review ✅</Text>
                        <Text style={styles.submitSub}>+50 Loyalty Points</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#fff', fontSize: 19, fontWeight: '900' },
    orderInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
    shopName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    orderId: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
    section: { paddingHorizontal: 16, paddingTop: 22 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 14 },
    aspectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    aspectLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
    aspectLabelHi: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: 'transparent' },
    tagActive: { backgroundColor: '#FFF7ED', borderColor: '#FF6B35' },
    tagText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    tagTextActive: { color: '#FF6B35', fontWeight: '800' },
    reviewInput: { backgroundColor: '#fff', borderRadius: 16, padding: 15, fontSize: 14, color: '#0F172A', borderWidth: 1.5, borderColor: '#E2E8F0', textAlignVertical: 'top', minHeight: 110 },
    charCount: { textAlign: 'right', marginTop: 6, fontSize: 11, color: '#94A3B8' },
    driverRateCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center' },
    driverAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    driverName: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
    submitWrap: { paddingHorizontal: 16, paddingTop: 24 },
    submitBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center', elevation: 8, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
    submitText: { color: '#fff', fontSize: 17, fontWeight: '900' },
    submitSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },
    doneBtn: { marginTop: 30, borderRadius: 20, paddingHorizontal: 32, paddingVertical: 16 },
});

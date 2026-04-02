import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity , ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FAMOUS_PLACES, EMERGENCY_CONTACTS, CITY_INFO } from '../constants/data';
import { COLORS } from '../constants/colors';

export default function CityInfoScreen({ navigation }) {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero */}
            <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.hero}>
                <Text style={styles.heroEmoji}>🏙️</Text>
                <Text style={styles.heroTitle}>बैतूल जिला</Text>
                <Text style={styles.heroSub}>Betul, Madhya Pradesh</Text>
                <View style={styles.statsRow}>
                    <View style={styles.stat}><Text style={styles.statVal}>{CITY_INFO.population}</Text><Text style={styles.statLabel}>जनसंख्या</Text></View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}><Text style={styles.statVal}>{CITY_INFO.area}</Text><Text style={styles.statLabel}>क्षेत्रफल</Text></View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}><Text style={styles.statVal}>{CITY_INFO.language}</Text><Text style={styles.statLabel}>भाषा</Text></View>
                </View>
            </LinearGradient>

            {/* About */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📖 बैतूल के बारे में</Text>
                <View style={styles.card}>
                    <Text style={styles.bodyText}>{CITY_INFO.about}</Text>
                </View>
            </View>

            {/* History */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏛️ इतिहास</Text>
                <View style={styles.card}>
                    <Text style={styles.bodyText}>{CITY_INFO.history}</Text>
                </View>
            </View>

            {/* Tehsils */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🗺️ तहसीलें</Text>
                <View style={styles.tehsilsGrid}>
                    {CITY_INFO.tehsils.map((t, i) => (
                        <View key={i} style={styles.tehsilChip}>
                            <Text style={styles.tehsilText}>{t}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Famous Places */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🗺️ प्रसिद्ध स्थान</Text>
                {FAMOUS_PLACES.map(place => (
                    <View key={place.id} style={styles.placeCard}>
                        <View style={[styles.placeIcon, { backgroundColor: place.color + '20' }]}>
                            <Text style={styles.placeEmoji}>{place.emoji}</Text>
                        </View>
                        <View style={styles.placeInfo}>
                            <Text style={styles.placeName}>{place.name}</Text>
                            <Text style={styles.placeDesc}>{place.description}</Text>
                            <View style={styles.placeMetaRow}>
                                <Text style={styles.placeMeta}>📍 {place.distance}</Text>
                                <Text style={styles.placeMeta}>⭐ {place.rating}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            <View style={{ height: 24 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    hero: { padding: 28, paddingTop: 50, alignItems: 'center' },
    heroEmoji: { fontSize: 60, marginBottom: 12 },
    heroTitle: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
    heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24 },
    statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, width: '100%', justifyContent: 'space-around' },
    stat: { alignItems: 'center' },
    statVal: { color: '#F7C948', fontSize: 14, fontWeight: '800' },
    statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
    section: { paddingHorizontal: 20, paddingTop: 20 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 2 },
    bodyText: { fontSize: 14, color: '#374151', lineHeight: 22 },
    tehsilsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tehsilChip: { backgroundColor: '#FF6B3518', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#FF6B3540' },
    tehsilText: { color: '#FF6B35', fontWeight: '700', fontSize: 13 },
    placeCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: 'row', gap: 14, elevation: 2 },
    placeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    placeEmoji: { fontSize: 28 },
    placeInfo: { flex: 1 },
    placeName: { fontSize: 15, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
    placeDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 6 },
    placeMetaRow: { flexDirection: 'row', gap: 16 },
    placeMeta: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' }});

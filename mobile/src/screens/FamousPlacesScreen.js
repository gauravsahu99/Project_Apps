import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity , ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FAMOUS_PLACES } from '../constants/data';
import { COLORS } from '../constants/colors';

export default function FamousPlacesScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.header}>
                <Text style={styles.headerTitle}>🗺️ Famous Places</Text>
                <Text style={styles.headerSub}>बैतूल के प्रसिद्ध स्थान</Text>
            </LinearGradient>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {FAMOUS_PLACES.map(place => (
                    <View key={place.id} style={styles.placeCard}>
                        <LinearGradient colors={[place.color, place.color + 'AA']} style={styles.placeHeader}>
                            <Text style={styles.placeEmoji}>{place.emoji}</Text>
                            <View style={styles.placeHeaderInfo}>
                                <Text style={styles.placeName}>{place.name}</Text>
                                <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                                    <Text style={styles.categoryText}>{place.category}</Text>
                                </View>
                            </View>
                            <Text style={styles.placeRating}>⭐ {place.rating}</Text>
                        </LinearGradient>
                        <View style={styles.placeBody}>
                            <Text style={styles.placeDesc}>{place.description}</Text>
                            <View style={styles.placeMeta}>
                                <Text style={styles.placeDistance}>📍 {place.distance} from Betul city</Text>
                                <TouchableOpacity style={[styles.directionsBtn, { backgroundColor: place.color }]}>
                                    <Text style={styles.directionsBtnText}>Directions →</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
                <View style={{ height: 24 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
    scroll: { flex: 1, padding: 16 },
    placeCard: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 14, overflow: 'hidden', elevation: 4 },
    placeHeader: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
    placeEmoji: { fontSize: 40 },
    placeHeaderInfo: { flex: 1 },
    placeName: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', marginBottom: 4 },
    categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    categoryText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    placeRating: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
    placeBody: { padding: 16 },
    placeDesc: { color: '#374151', fontSize: 14, lineHeight: 22, marginBottom: 12 },
    placeMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    placeDistance: { color: '#9CA3AF', fontSize: 13 },
    directionsBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    directionsBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 }});

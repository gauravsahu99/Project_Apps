import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Alert, StatusBar, ScrollView, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { saveListing } from '../constants/dataStore';

const CATEGORIES = [
    { id: 'bikes', label: '🏍️ Bikes', emoji: '🏍️' },
    { id: 'cars', label: '🚗 Cars', emoji: '🚗' },
    { id: 'electronics', label: '📱 Electronics', emoji: '📱' },
    { id: 'furniture', label: '🪑 Furniture', emoji: '🪑' },
    { id: 'realestate', label: '🏠 Real Estate', emoji: '🏠' },
    { id: 'clothing', label: '👗 Clothing', emoji: '👗' },
    { id: 'jobs', label: '💼 Jobs', emoji: '💼' },
    { id: 'other', label: '📦 Other', emoji: '📦' },
];

export default function PostItemScreen({ navigation }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePost = async () => {
        if (!title.trim()) return Alert.alert('⚠️', 'Please enter a title');
        if (!price.trim() || isNaN(Number(price))) return Alert.alert('⚠️', 'Please enter a valid price');
        if (!category) return Alert.alert('⚠️', 'Please select a category');
        if (!description.trim()) return Alert.alert('⚠️', 'Please add a description');

        setLoading(true);
        await new Promise(r => setTimeout(r, 800));

        const cat = CATEGORIES.find(c => c.id === category);
        saveListing({
            title: title.trim(),
            price: Number(price),
            category,
            emoji: cat?.emoji || '📦',
            description: description.trim(),
            location: location.trim() || 'Betul',
            postedBy: user?.name || 'Anonymous',
            phone: user?.phone || '',
            isVerified: false,
        });

        setLoading(false);
        Alert.alert(
            '✅ Listing Submitted!',
            'Your item has been submitted for review. It will appear on the marketplace after admin approval.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#7C3AED', '#6D28D9']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>➕ Post Item</Text>
                    <Text style={styles.headerSub}>Sell anything locally in Betul</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 120 }}>
                <View style={styles.section}>
                    <Text style={styles.label}>📝 Item Title *</Text>
                    <TextInput
                        style={styles.input} placeholder="e.g. Honda Activa 2021"
                        placeholderTextColor="#9CA3AF" value={title} onChangeText={setTitle}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>💰 Price (₹) *</Text>
                    <TextInput
                        style={styles.input} placeholder="e.g. 65000"
                        placeholderTextColor="#9CA3AF" value={price}
                        onChangeText={setPrice} keyboardType="numeric"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>🏷️ Category *</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.catChip, category === cat.id && styles.catChipActive]}
                                onPress={() => setCategory(cat.id)}
                            >
                                <Text style={styles.catChipText}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>📋 Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your item in detail..."
                        placeholderTextColor="#9CA3AF" value={description}
                        onChangeText={setDescription} multiline numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>📍 Location</Text>
                    <TextInput
                        style={styles.input} placeholder="e.g. Betul Bazar, Civil Lines"
                        placeholderTextColor="#9CA3AF" value={location} onChangeText={setLocation}
                    />
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>ℹ️ Submission Note</Text>
                    <Text style={styles.infoDesc}>Your listing will be reviewed by the admin before appearing publicly. This usually takes 1-2 hours.</Text>
                </View>

                <TouchableOpacity onPress={handlePost} activeOpacity={0.9} disabled={loading}>
                    <LinearGradient colors={['#7C3AED', '#6D28D9']} style={styles.submitBtn}>
                        <Text style={styles.submitText}>{loading ? '⏳ Submitting...' : '🛍️ Submit Listing'}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
    backText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
    scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    section: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
    input: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#1E293B', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0' },
    catChipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
    catChipText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
    infoCard: { backgroundColor: '#EEF2FF', borderRadius: 16, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#7C3AED' },
    infoTitle: { fontWeight: '800', fontSize: 13, color: '#4C1D95', marginBottom: 6 },
    infoDesc: { fontSize: 13, color: '#5B21B6', lineHeight: 20 },
    submitBtn: { paddingVertical: 17, borderRadius: 16, alignItems: 'center', marginBottom: 12, elevation: 6, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
    submitText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.3 },
});

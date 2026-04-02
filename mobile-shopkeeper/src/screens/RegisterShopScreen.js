import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { saveShop } from '../constants/dataStore';

const CATEGORIES = [
  { id: 'grocery', emoji: '🛒', label: 'Grocery' },
  { id: 'fashion', emoji: '👗', label: 'Fashion' },
  { id: 'electronics', emoji: '💻', label: 'Electronics' },
  { id: 'medical', emoji: '💊', label: 'Medical' },
  { id: 'restaurant', emoji: '🍽️', label: 'Restaurant' },
  { id: 'bakery', emoji: '🍞', label: 'Bakery' },
  { id: 'fruits', emoji: '🍎', label: 'Fruits & Veg' },
  { id: 'other', emoji: '🏪', label: 'Other' },
];

export default function RegisterShopScreen({ navigation }) {
  const { shopkeeper, refreshShop } = useAuth();
  const [form, setForm] = useState({ name: '', nameEn: '', tagline: '', address: '', category: '', city: 'Betul' });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.category) {
      Alert.alert('Required', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    saveShop({
      ownerId: shopkeeper.id,
      ownerPhone: shopkeeper.phone,
      name: form.name,
      nameEn: form.nameEn || form.name,
      tagline: form.tagline,
      address: form.address,
      city: form.city,
      category: form.category,
      emoji: CATEGORIES.find(c => c.id === form.category)?.emoji || '🏪',
      commissionRate: 10,
    });
    refreshShop();
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🏪</Text>
          <Text style={styles.title}>Register Your Shop</Text>
          <Text style={styles.subtitle}>Tell us about your business</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shop Details</Text>

          <Text style={styles.label}>Shop Name (Hindi) *</Text>
          <TextInput style={styles.input} placeholder="जैसे: श्री राम किराना" placeholderTextColor="#bbb" value={form.name} onChangeText={v => update('name', v)} />

          <Text style={styles.label}>Shop Name (English)</Text>
          <TextInput style={styles.input} placeholder="e.g. Shree Ram Kirana" placeholderTextColor="#bbb" value={form.nameEn} onChangeText={v => update('nameEn', v)} />

          <Text style={styles.label}>Tagline / Description</Text>
          <TextInput style={styles.input} placeholder="e.g. Fresh groceries daily" placeholderTextColor="#bbb" value={form.tagline} onChangeText={v => update('tagline', v)} />

          <Text style={styles.label}>Shop Address *</Text>
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Full address with area" placeholderTextColor="#bbb" multiline value={form.address} onChangeText={v => update('address', v)} />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categories}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catBtn, form.category === cat.id && styles.catBtnActive]}
                onPress={() => update('category', cat.id)}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, form.category === cat.id && styles.catLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>⏳ After submission, your shop will be reviewed by admin within 24 hours.</Text>
            <Text style={styles.infoText}>💰 Platform commission: <Text style={{ fontWeight: '800', color: '#FF6B35' }}>10% per order</Text></Text>
          </View>

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit for Approval →</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ORANGE = '#FF6B35';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  header: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A2E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 6 },
  card: { backgroundColor: '#FFF', borderRadius: 24, margin: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8, marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A2E', backgroundColor: '#FAFAFA' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  catBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA', gap: 6 },
  catBtnActive: { backgroundColor: '#FFF0EB', borderColor: ORANGE },
  catEmoji: { fontSize: 16 },
  catLabel: { fontSize: 12, fontWeight: '600', color: '#555' },
  catLabelActive: { color: ORANGE },
  infoBox: { backgroundColor: '#F0FFF4', borderRadius: 12, padding: 14, marginTop: 20, marginBottom: 8, gap: 6 },
  infoText: { fontSize: 13, color: '#2D6A4F' },
  btn: { backgroundColor: ORANGE, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 16 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});

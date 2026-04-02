import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { saveProduct } from '../constants/dataStore';

const EMOJIS = ['🥚', '🥛', '🍞', '🥔', '🍅', '🧅', '🍎', '🥦', '🍌', '🫒', '💊', '🍭', '👕', '👗', '👖', '📱', '💻', '🏪', '🛒', '🍳', '☕', '🧃', '🍕', '🎂'];

export default function AddProductScreen({ route, navigation }) {
  const { shop } = useAuth();
  const existing = route?.params?.product;
  const [form, setForm] = useState({
    name: existing?.name || '',
    price: existing?.price?.toString() || '',
    unit: existing?.unit || 'per piece',
    stock: existing?.stock?.toString() || '',
    emoji: existing?.emoji || '🛒',
    category: existing?.category || shop?.category || 'grocery',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      Alert.alert('Required', 'Name, price, and stock are required');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    saveProduct({
      ...(existing || {}),
      shopId: shop.id,
      name: form.name,
      price: Number(form.price),
      unit: form.unit,
      stock: Number(form.stock),
      emoji: form.emoji,
      category: form.category,
    });
    setLoading(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Text style={styles.sectionTitle}>{existing ? 'Edit Product' : 'Add New Product'}</Text>

          {/* Emoji Picker */}
          <Text style={styles.label}>Choose Emoji</Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map(e => (
              <TouchableOpacity key={e} style={[styles.emojiBtn, form.emoji === e && styles.emojiBtnActive]} onPress={() => update('emoji', e)}>
                <Text style={styles.emojiOption}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Product Name *</Text>
          <TextInput style={styles.input} placeholder="e.g. दूध (Milk)" placeholderTextColor="#bbb" value={form.name} onChangeText={v => update('name', v)} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput style={styles.input} placeholder="0" placeholderTextColor="#bbb" keyboardType="numeric" value={form.price} onChangeText={v => update('price', v)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput style={styles.input} placeholder="0" placeholderTextColor="#bbb" keyboardType="numeric" value={form.stock} onChangeText={v => update('stock', v)} />
            </View>
          </View>

          <Text style={styles.label}>Unit</Text>
          <View style={styles.unitRow}>
            {['per piece', 'per kg', 'per litre', 'per loaf', 'pcs', 'strip', 'bottle'].map(u => (
              <TouchableOpacity key={u} style={[styles.unitBtn, form.unit === u && styles.unitBtnActive]} onPress={() => update('unit', u)}>
                <Text style={[styles.unitText, form.unit === u && styles.unitTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewEmoji}>{form.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewName}>{form.name || 'Product Name'}</Text>
                <Text style={styles.previewPrice}>₹{form.price || '0'} / {form.unit}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.saveBtn, loading && styles.saveBtnDisabled]} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{existing ? '✓ Update Product' : '+ Add Product'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BLUE = '#1976D2';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FC' },
  inner: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A2E', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A2E', backgroundColor: '#FFF' },
  row: { flexDirection: 'row', gap: 12 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  emojiBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  emojiBtnActive: { borderColor: BLUE, backgroundColor: '#E8F4FD' },
  emojiOption: { fontSize: 22 },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  unitBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9F9FC' },
  unitBtnActive: { backgroundColor: '#E8F4FD', borderColor: BLUE },
  unitText: { fontSize: 12, fontWeight: '600', color: '#555' },
  unitTextActive: { color: BLUE },
  preview: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginTop: 24, marginBottom: 8 },
  previewTitle: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 10, textTransform: 'uppercase' },
  previewCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewEmoji: { fontSize: 36 },
  previewName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  previewPrice: { fontSize: 14, color: '#666', marginTop: 4 },
  saveBtn: { backgroundColor: BLUE, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});

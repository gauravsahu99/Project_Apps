import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getProducts, deleteProduct, toggleProductActive } from '../constants/dataStore';

export default function ProductsScreen({ navigation }) {
  const { shop } = useAuth();
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    if (!shop) return;
    setProducts(getProducts(shop.id));
  }, [shop]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); setTimeout(() => setRefreshing(false), 400); }, [load]);

  const handleDelete = (id, name) => {
    Alert.alert('Delete Product', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteProduct(id); load(); } },
    ]);
  };

  const handleToggle = (id) => {
    toggleProductActive(id);
    load();
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productLeft}>
        <Text style={styles.productEmoji}>{item.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productMeta}>₹{item.price} / {item.unit}</Text>
          <Text style={[styles.stock, item.stock <= 10 && styles.stockLow]}>
            {item.stock <= 0 ? '❌ Out of stock' : item.stock <= 10 ? `⚠️ Low stock: ${item.stock}` : `✅ Stock: ${item.stock}`}
          </Text>
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity style={[styles.toggleBtn, item.isActive ? styles.toggleActive : styles.toggleOff]} onPress={() => handleToggle(item.id)}>
          <Text style={styles.toggleText}>{item.isActive ? 'Active' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddProduct', { product: item })}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛒 Products</Text>
          <Text style={styles.headerSub}>{products.length} products · {products.filter(p => p.isActive).length} active</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddProduct', {})}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1976D2" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>Add your first product to start selling</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddProduct', {})}>
              <Text style={styles.emptyBtnText}>+ Add First Product</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1976D2', padding: 20, paddingTop: 52 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  productCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  productLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  productEmoji: { fontSize: 36, width: 44, textAlign: 'center' },
  productName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  productMeta: { fontSize: 13, color: '#666' },
  stock: { fontSize: 11, fontWeight: '600', color: '#22C55E', marginTop: 3 },
  stockLow: { color: '#F59E0B' },
  productActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleBtn: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  toggleActive: { backgroundColor: '#DCFCE7' },
  toggleOff: { backgroundColor: '#FEE2E2' },
  toggleText: { fontSize: 11, fontWeight: '700', color: '#1A1A2E' },
  editIcon: { fontSize: 18 },
  deleteIcon: { fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#888', marginBottom: 24, textAlign: 'center' },
  emptyBtn: { backgroundColor: '#1976D2', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

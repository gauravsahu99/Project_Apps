import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Alert, StatusBar, ScrollView, TextInput, RefreshControl, Modal, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications, timeAgo } from '../constants/dataStore';
import BackButton from '../constants/BackButton';

const STATS_ICONS = ['📦', '🎉', '⭐', '💰'];

export default function ProfileScreen({ navigation }) {
    const { user, logout, updateProfile, savedAddresses, saveAddress, removeAddress, getUserOrders } = useAuth();
    const [activeTab, setActiveTab] = useState('orders');
    const [refreshing, setRefreshing] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [addrModal, setAddrModal] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');
    const [newAddr, setNewAddr] = useState('');
    const [orders, setOrders] = useState(() => getUserOrders());

    const reload = useCallback(() => setOrders(getUserOrders()), [getUserOrders]);
    const onRefresh = async () => { setRefreshing(true); reload(); setRefreshing(false); };

    const handleSaveProfile = async () => {
        if (!editName.trim()) return Alert.alert('Error', 'Name cannot be empty');
        await updateProfile({ name: editName, email: editEmail });
        setEditModal(false);
    };

    const handleAddAddress = async () => {
        if (!newAddr.trim()) return Alert.alert('Error', 'Address cannot be empty');
        await saveAddress({ id: Date.now().toString(), text: newAddr.trim(), label: 'Home' });
        setNewAddr('');
        setAddrModal(false);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const stats = [
        { label: 'Orders', value: orders.length, icon: '📦' },
        { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: '✅' },
        { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: '⏳' },
        { label: 'Saved', value: savedAddresses.length, icon: '📍' },
    ];

    const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
    const notifications = getNotifications(false, user?.id).slice(0, 5);

    const STATUS_COLOR = { pending: '#F59E0B', dispatched: '#3B82F6', delivered: '#16A34A', cancelled: '#EF4444' };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F3460']} style={styles.header}>
                {/* Nav Row */}
                <View style={styles.headerNav}>
                    <View style={{ zIndex: 1 }}>
                        <BackButton navigation={navigation} fallback="Main" />
                    </View>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerNavTitle}>My Profile</Text>
                    </View>
                    <View style={{ width: 40 }} /> {/* Spacer */}
                </View>

                {/* Avatar & Info */}
                <View style={styles.avatarWrap}>
                    <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
                    </LinearGradient>
                    <TouchableOpacity style={styles.editAvatarBtn} onPress={() => { setEditName(user?.name || ''); setEditEmail(user?.email || ''); setEditModal(true); }}>
                        <Text style={{ fontSize: 14 }}>✏️</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>{user?.name || 'Betul User'}</Text>
                <Text style={styles.userPhone}>📞 {user?.phone}</Text>
                {user?.email ? <Text style={styles.userEmail}>✉️ {user.email}</Text> : null}
                <View style={styles.memberBadge}>
                    <Text style={styles.memberText}>🏙️ Betul Member</Text>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    {stats.map((s, i) => (
                        <View key={i} style={styles.statBox}>
                            <Text style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</Text>
                            <Text style={styles.statVal}>{s.value}</Text>
                            <Text style={styles.statLbl}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.totalSpentBox}>
                    <Text style={styles.totalSpentLabel}>💰 Total Spent</Text>
                    <Text style={styles.totalSpentVal}>₹{totalSpent.toLocaleString()}</Text>
                </View>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabBar}>
                {['orders', 'addresses', 'activity'].map(t => (
                    <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
                        <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                            {t === 'orders' ? '📦 Orders' : t === 'addresses' ? '📍 Addresses' : '🔔 Activity'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}
            >
                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <>
                        <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('Orders')}>
                            <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.viewAllGrad}>
                                <Text style={styles.viewAllText}>📦 View All Orders →</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        {orders.slice(0, 5).map(o => (
                            <View key={o.id} style={styles.orderCard}>
                                <View style={styles.orderCardHeader}>
                                    <Text style={styles.orderCardId}>#{o.id.slice(-6).toUpperCase()}</Text>
                                    <View style={[styles.orderStatusBadge, { backgroundColor: (STATUS_COLOR[o.status] || '#64748B') + '20' }]}>
                                        <Text style={[styles.orderStatusText, { color: STATUS_COLOR[o.status] || '#64748B' }]}>{o.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.orderItems} numberOfLines={1}>
                                    {o.items.map(i => `${i.emoji} ${i.name}`).join(', ')}
                                </Text>
                                <View style={styles.orderFooter}>
                                    <Text style={styles.orderTime}>{timeAgo(o.createdAt)}</Text>
                                    <Text style={styles.orderTotal}>₹{o.total}</Text>
                                </View>
                            </View>
                        ))}
                        {orders.length === 0 && (
                            <View style={styles.empty}>
                                <Text style={{ fontSize: 48 }}>📦</Text>
                                <Text style={styles.emptyText}>No orders yet</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Essentials')}>
                                    <Text style={styles.shopNow}>Shop Now →</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                {/* ADDRESSES TAB */}
                {activeTab === 'addresses' && (
                    <>
                        <TouchableOpacity style={styles.addAddrBtn} onPress={() => setAddrModal(true)}>
                            <Text style={styles.addAddrText}>+ Add New Address</Text>
                        </TouchableOpacity>
                        {savedAddresses.map(addr => (
                            <View key={addr.id} style={styles.addrCard}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.addrLabel}>{addr.label}</Text>
                                    <Text style={styles.addrText}>{addr.text}</Text>
                                </View>
                                <TouchableOpacity onPress={() => Alert.alert('Remove?', 'Remove this address?', [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Remove', style: 'destructive', onPress: () => removeAddress(addr.id) }
                                ])}>
                                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        {savedAddresses.length === 0 && (
                            <View style={styles.empty}>
                                <Text style={{ fontSize: 48 }}>📍</Text>
                                <Text style={styles.emptyText}>No saved addresses</Text>
                            </View>
                        )}
                    </>
                )}

                {/* ACTIVITY TAB */}
                {activeTab === 'activity' && (
                    <>
                        {notifications.map(n => (
                            <View key={n.id} style={styles.actCard}>
                                <View style={styles.actIcon}><Text style={{ fontSize: 20 }}>{n.icon}</Text></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.actTitle}>{n.title}</Text>
                                    <Text style={styles.actTime}>{timeAgo(n.time)}</Text>
                                </View>
                            </View>
                        ))}
                        {notifications.length === 0 && (
                            <View style={styles.empty}>
                                <Text style={{ fontSize: 48 }}>🔔</Text>
                                <Text style={styles.emptyText}>No activity yet</Text>
                            </View>
                        )}
                    </>
                )}

                {/* Support & Complaints */}
                <View style={styles.supportCard}>
                    <Text style={styles.supportTitle}>💬 Help & Support</Text>
                    <TouchableOpacity style={styles.supportRow} onPress={() => navigation.navigate('Complaint')}>
                        <Text style={styles.supportRowIcon}>🆘</Text>
                        <Text style={styles.supportRowLabel}>File a Complaint</Text>
                        <Text style={styles.supportRowArrow}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.supportRow} onPress={() => navigation.navigate('Notifications')}>
                        <Text style={styles.supportRowIcon}>🔔</Text>
                        <Text style={styles.supportRowLabel}>Notifications</Text>
                        <Text style={styles.supportRowArrow}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.supportRow} onPress={() => navigation.navigate('Chat')}>
                        <Text style={styles.supportRowIcon}>💬</Text>
                        <Text style={styles.supportRowLabel}>Live Chat Support</Text>
                        <Text style={styles.supportRowArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>🚪 Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal visible={editModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>✏️ Edit Profile</Text>
                        <Text style={styles.fieldLabel}>Full Name</Text>
                        <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Your name" />
                        <Text style={styles.fieldLabel}>Email (optional)</Text>
                        <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} placeholder="your@email.com" keyboardType="email-address" />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity onPress={handleSaveProfile}>
                                <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.saveBtn}>
                                    <Text style={styles.saveText}>Save</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Address Modal */}
            <Modal visible={addrModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>📍 Add Address</Text>
                        <TextInput
                            style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                            value={newAddr} onChangeText={setNewAddr}
                            placeholder="Enter full address in Betul..." multiline
                        />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddrModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity onPress={handleAddAddress}>
                                <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.saveBtn}>
                                    <Text style={styles.saveText}>Add</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    header: { paddingBottom: 20 },
    headerNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 24) + 16, paddingBottom: 16 },
    headerTitleContainer: { position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center', justifyContent: 'center', zIndex: 0 },
    headerNavTitle: { textAlign: 'center', color: '#FFF', fontSize: 16, fontWeight: '800' },
    avatarWrap: { position: 'relative', marginBottom: 12, alignSelf: 'center' },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
    avatarText: { fontSize: 34, fontWeight: '900', color: '#FFFFFF' },
    editAvatarBtn: { position: 'absolute', bottom: 0, right: -4, backgroundColor: '#FFFFFF', borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    userName: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 4, textAlign: 'center' },
    userPhone: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 2, textAlign: 'center' },
    userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 10, textAlign: 'center' },
    memberBadge: { backgroundColor: 'rgba(255,107,53,0.3)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,107,53,0.5)', alignSelf: 'center' },
    memberText: { color: '#FF9A6C', fontSize: 12, fontWeight: '700' },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14, paddingHorizontal: 20 },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
    statVal: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
    statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginTop: 2 },
    totalSpentBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,107,53,0.25)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,107,53,0.4)', alignSelf: 'center' },
    totalSpentLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
    totalSpentVal: { fontSize: 18, fontWeight: '900', color: '#FF9A6C' },
    tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: '#FF6B35' },
    tabText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
    tabTextActive: { color: '#FF6B35' },
    scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    viewAllBtn: { marginBottom: 14 },
    viewAllGrad: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    viewAllText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
    orderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
    orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    orderCardId: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
    orderStatusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
    orderStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    orderItems: { fontSize: 13, color: '#64748B', marginBottom: 8 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    orderTime: { fontSize: 11, color: '#94A3B8' },
    orderTotal: { fontSize: 15, fontWeight: '900', color: '#FF6B35' },
    addAddrBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginBottom: 14 },
    addAddrText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
    addrCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
    addrLabel: { fontSize: 12, fontWeight: '700', color: '#FF6B35', marginBottom: 4 },
    addrText: { fontSize: 14, color: '#1E293B' },
    actCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
    actIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' },
    actTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 3 },
    actTime: { fontSize: 11, color: '#94A3B8' },
    empty: { alignItems: 'center', paddingTop: 40 },
    emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '600', marginTop: 12 },
    shopNow: { color: '#FF6B35', fontWeight: '700', fontSize: 14, marginTop: 8 },
    logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 14, marginBottom: 20 },
    logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 20 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 6 },
    input: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1E293B', marginBottom: 14 },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 6 },
    cancelBtn: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    cancelText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
    saveBtn: { flex: 0, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center' },
    saveText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
    supportCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginTop: 14, marginBottom: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    supportTitle: { fontSize: 13, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    supportRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    supportRowIcon: { fontSize: 18, marginRight: 12, width: 28, textAlign: 'center' },
    supportRowLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
    supportRowArrow: { fontSize: 20, color: '#D1D5DB' },
});

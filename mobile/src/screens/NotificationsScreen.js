import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    StatusBar, ScrollView, Alert, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications, markNotifRead, markAllNotifsRead, timeAgo } from '../constants/dataStore';

const TYPE_COLORS = {
    order: ['#FF6B35', '#E85D2E'],
    delivery: ['#16A34A', '#15803D'],
    listing: ['#7C3AED', '#6D28D9'],
    ad: ['#F59E0B', '#D97706'],
    user: ['#1976D2', '#1565C0'],
    info: ['#64748B', '#475569'],
};

export default function NotificationsScreen({ navigation }) {
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [notifs, setNotifs] = useState(() =>
        getNotifications(false, user?.id).sort((a, b) => new Date(b.time) - new Date(a.time))
    );

    const reload = useCallback(() => {
        setNotifs(getNotifications(false, user?.id).sort((a, b) => new Date(b.time) - new Date(a.time)));
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        reload();
        setRefreshing(false);
    };

    const handleRead = (id) => {
        markNotifRead(id);
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAll = () => {
        markAllNotifsRead(false, user?.id);
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifs.filter(n => !n.read).length;

    const typeGrad = (type) => TYPE_COLORS[type] || TYPE_COLORS.info;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>🔔 Notifications</Text>
                    <Text style={styles.headerSub}>{unreadCount} unread</Text>
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={handleMarkAll} style={styles.markAllBtn}>
                        <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: 30, paddingTop: 12 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}
            >
                {notifs.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={{ fontSize: 64, marginBottom: 16 }}>🔔</Text>
                        <Text style={styles.emptyTitle}>No notifications yet</Text>
                        <Text style={styles.emptyDesc}>We'll notify you about your orders and offers</Text>
                    </View>
                ) : (
                    notifs.map(n => (
                        <TouchableOpacity
                            key={n.id}
                            style={[styles.card, !n.read && styles.cardUnread]}
                            onPress={() => handleRead(n.id)}
                            activeOpacity={0.85}
                        >
                            <LinearGradient colors={typeGrad(n.type)} style={styles.iconBg}>
                                <Text style={{ fontSize: 20 }}>{n.icon}</Text>
                            </LinearGradient>
                            <View style={styles.content}>
                                <Text style={styles.title} numberOfLines={2}>{n.title}</Text>
                                {n.body ? <Text style={styles.body} numberOfLines={1}>{n.body}</Text> : null}
                                <Text style={styles.time}>{timeAgo(n.time)}</Text>
                            </View>
                            {!n.read && <View style={styles.unreadDot} />}
                        </TouchableOpacity>
                    ))
                )}
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
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
    markAllBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
    markAllText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    scroll: { flex: 1, paddingHorizontal: 16 },
    card: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14,
        marginBottom: 10, elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6,
    },
    cardUnread: { borderLeftWidth: 3, borderLeftColor: '#FF6B35' },
    iconBg: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    content: { flex: 1 },
    title: { fontSize: 14, fontWeight: '800', color: '#1E293B', lineHeight: 19, marginBottom: 3 },
    body: { fontSize: 12, color: '#64748B', marginBottom: 5 },
    time: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6B35', flexShrink: 0 },
    empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B', marginBottom: 8 },
    emptyDesc: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
});

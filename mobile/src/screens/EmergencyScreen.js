import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, ScrollView } from 'react-native';
import { EMERGENCY_CONTACTS } from '../constants/data';
import { COLORS } from '../constants/colors';

export default function EmergencyScreen({ navigation }) {
    const callNumber = (number) => {
        Alert.alert(
            '📞 Call करें?',
            `${number} पर call करें?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call करें', onPress: () => Linking.openURL(`tel:${number}`) },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerEmoji}>🆘</Text>
                <Text style={styles.headerTitle}>आपातकालीन संपर्क</Text>
                <Text style={styles.headerSub}>Emergency Contacts - Betul</Text>
            </View>

            <View style={styles.alertBox}>
                <Text style={styles.alertText}>⚠️ आपातकाल में तुरंत नीचे दिए नंबरों पर कॉल करें</Text>
            </View>

            <View style={styles.section}>
                {EMERGENCY_CONTACTS.map(c => (
                    <TouchableOpacity key={c.id} style={styles.contactCard} onPress={() => callNumber(c.number)} activeOpacity={0.8}>
                        <View style={[styles.iconBg, { backgroundColor: c.color + '18' }]}>
                            <Text style={styles.emoji}>{c.emoji}</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{c.name}</Text>
                            <Text style={[styles.number, { color: c.color }]}>{c.number}</Text>
                        </View>
                        <View style={[styles.callBtn, { backgroundColor: c.color }]}>
                            <Text style={styles.callText}>📞 Call</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{ height: 24 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: '#D32F2F', paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, alignItems: 'center' },
    headerEmoji: { fontSize: 52, marginBottom: 8 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
    backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    backIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    alertBox: { margin: 20, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: '#EF4444' },
    alertText: { color: '#991B1B', fontWeight: '600', fontSize: 14, lineHeight: 20 },
    section: { paddingHorizontal: 20 },
    contactCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14, elevation: 2 },
    iconBg: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    emoji: { fontSize: 26 },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: '800', color: '#1F2937' },
    number: { fontSize: 16, fontWeight: '700', marginTop: 2 },
    callBtn: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
    callText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' }
});

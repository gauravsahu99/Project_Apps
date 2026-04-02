import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, KeyboardAvoidingView, Platform, StatusBar, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const QUICK_REPLIES = [
    'कहाँ हैं आप? 📍',
    'कितनी देर लगेगी? ⏱️',
    'Order ready है क्या?',
    'Please hurry 🙏',
    'Gate पर आ जाना 🚪',
];

const MOCK_MESSAGES = [
    { id: 1, from: 'shop', text: 'नमस्ते! आपका order receive हो गया है।', time: '10:32 AM' },
    { id: 2, from: 'me', text: 'कितनी देर में ready होगा?', time: '10:33 AM' },
    { id: 3, from: 'shop', text: '10-15 minutes में तैयार हो जाएगा 😊', time: '10:33 AM' },
    { id: 4, from: 'shop', text: 'Delivery partner को भेज दिया है', time: '10:44 AM' },
    { id: 5, from: 'me', text: 'ठीक है, धन्यवाद!', time: '10:44 AM' },
];

export default function ChatScreen({ navigation, route }) {
    const shopName = route?.params?.shopName || 'Sharma Kirana Store';
    const shopEmoji = route?.params?.shopEmoji || '🏪';
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const typingAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    useEffect(() => {
        // Simulate shop typing after 3 seconds
        const t = setTimeout(() => {
            setIsTyping(true);
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(typingAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(typingAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                ])
            );
            loop.start();
            setTimeout(() => {
                setIsTyping(false);
                loop.stop();
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    from: 'shop',
                    text: 'क्या आप घर पर हैं? Delivery partner 5 min में पहुँचेगा 🚴',
                    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                }]);
            }, 3000);
        }, 4000);
        return () => clearTimeout(t);
    }, []);

    const sendMessage = (msgText) => {
        const t = msgText || text.trim();
        if (!t) return;
        setMessages(prev => [...prev, {
            id: Date.now(),
            from: 'me',
            text: t,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        }]);
        setText('');
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.root}
            keyboardVerticalOffset={0}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Header */}
            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
                    <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
                </TouchableOpacity>
                <View style={styles.shopInfo}>
                    <View style={styles.shopAvatar}>
                        <Text style={{ fontSize: 22 }}>{shopEmoji}</Text>
                    </View>
                    <View>
                        <Text style={styles.shopName}>{shopName}</Text>
                        <View style={styles.onlineRow}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineText}>Online • अभी उपलब्ध</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.callHeaderBtn}>
                    <Text style={{ fontSize: 20 }}>📞</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Messages */}
            <ScrollView
                ref={scrollRef}
                style={styles.messageList}
                contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 16 }}
                showsVerticalScrollIndicator={false}>

                {/* Date separator */}
                <View style={styles.dateSep}>
                    <View style={styles.dateLine} />
                    <Text style={styles.dateText}>Today</Text>
                    <View style={styles.dateLine} />
                </View>

                {messages.map(msg => (
                    <View key={msg.id} style={[styles.msgRow, msg.from === 'me' && styles.msgRowRight]}>
                        {msg.from !== 'me' && (
                            <View style={styles.msgAvatar}>
                                <Text style={{ fontSize: 16 }}>{shopEmoji}</Text>
                            </View>
                        )}
                        <View style={[styles.bubble, msg.from === 'me' ? styles.bubbleMe : styles.bubbleShop]}>
                            <Text style={[styles.bubbleText, msg.from === 'me' && { color: '#fff' }]}>{msg.text}</Text>
                            <Text style={[styles.bubbleTime, msg.from === 'me' && { color: 'rgba(255,255,255,0.6)' }]}>{msg.time}</Text>
                        </View>
                    </View>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <View style={[styles.msgRow]}>
                        <View style={styles.msgAvatar}>
                            <Text style={{ fontSize: 16 }}>{shopEmoji}</Text>
                        </View>
                        <View style={styles.typingBubble}>
                            <View style={styles.typingDots}>
                                {[0, 1, 2].map(i => (
                                    <Animated.View
                                        key={i}
                                        style={[styles.typingDot, {
                                            opacity: typingAnim,
                                            transform: [{ translateY: typingAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
                                        }]}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Quick Replies */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quickReplies}
                contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                {QUICK_REPLIES.map((qr, i) => (
                    <TouchableOpacity key={i} style={styles.quickReply} onPress={() => sendMessage(qr)}>
                        <Text style={styles.quickReplyText}>{qr}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputRow}>
                <TouchableOpacity style={styles.attachBtn}>
                    <Text style={{ fontSize: 22 }}>📎</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Message लिखें..."
                    placeholderTextColor="#94A3B8"
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]}
                    onPress={() => sendMessage()}
                    disabled={!text.trim()}>
                    <LinearGradient colors={['#FF6B35', '#E85D2E']} style={styles.sendBtnGrad}>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>➤</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    shopInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    shopAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    shopName: { color: '#fff', fontSize: 15, fontWeight: '800' },
    onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
    onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#22C55E' },
    onlineText: { color: '#22C55E', fontSize: 11, fontWeight: '600' },
    callHeaderBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
    messageList: { flex: 1 },
    dateSep: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    dateLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    dateText: { paddingHorizontal: 12, fontSize: 12, color: '#94A3B8', fontWeight: '600' },
    msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
    msgRowRight: { justifyContent: 'flex-end' },
    msgAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
    bubble: { maxWidth: '72%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleMe: { backgroundColor: '#FF6B35', borderBottomRightRadius: 4 },
    bubbleShop: { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
    bubbleText: { fontSize: 14, color: '#0F172A', lineHeight: 20 },
    bubbleTime: { fontSize: 10, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },
    typingBubble: { backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 14, elevation: 1 },
    typingDots: { flexDirection: 'row', gap: 5 },
    typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#94A3B8' },
    quickReplies: { maxHeight: 56, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    quickReply: { backgroundColor: '#FFF7ED', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: '#FF6B35' + '40' },
    quickReplyText: { fontSize: 12, color: '#FF6B35', fontWeight: '700' },
    inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 8 },
    attachBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    input: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0', maxHeight: 100 },
    sendBtn: {},
    sendBtnGrad: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 3 },
});

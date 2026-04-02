import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, Dimensions, TouchableOpacity,
    FlatList, SafeAreaView, StatusBar, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        emoji: '🏙️',
        title: 'अपना बैतूल में\nआपका स्वागत है!',
        subtitle: 'Welcome to Apna Betul',
        desc: 'बैतूल शहर की पूरी जानकारी, दुकानें,\nसरकारी दफ्तर और बहुत कुछ — एक ही app में!',
        gradient: ['#FF6B35', '#D94F1E']},
    {
        id: '2',
        emoji: '🛍️',
        title: 'खरीदो और बेचो',
        subtitle: 'Local Marketplace',
        desc: 'बैतूल का अपना OLX! पुरानी चीजें बेचो,\nनई चीजें खरीदो — बिल्कुल local, बिल्कुल safe!',
        gradient: ['#7B1FA2', '#4A0080']},
    {
        id: '3',
        emoji: '🌅',
        title: 'सुबह की डिलीवरी',
        subtitle: 'Morning Essentials',
        desc: 'अंडा, रोटी, दूध, समोसे — रोज सुबह\nआपके दरवाजे पर! सुबह 8 बजे ऑर्डर करें।',
        gradient: ['#1565C0', '#003c8f']},
];

export default function OnboardingScreen({ navigation }) {
    const [current, setCurrent] = useState(0);
    const flatListRef = useRef(null);

    const goNext = () => {
        if (current < slides.length - 1) {
            const next = current + 1;
            flatListRef.current?.scrollToIndex({ index: next, animated: true });
            setCurrent(next);
        } else {
            navigation.replace('Login');
        }
    };

    const skip = () => navigation.replace('Login');

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrent(viewableItems[0].index);
        }
    }).current;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={slides[current].gradient[0]} />

            {/* ── SLIDE AREA ── */}
            <FlatList
                ref={flatListRef}
                data={slides}
                keyExtractor={i => i.id}
                horizontal
                pagingEnabled
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                style={{ flex: 1 }}
                renderItem={({ item }) => (
                    <LinearGradient colors={item.gradient} style={styles.slide}>
                        {/* Skip top-right */}
                        <TouchableOpacity style={styles.skipTopBtn} onPress={skip}>
                            <Text style={styles.skipTopText}>Skip →</Text>
                        </TouchableOpacity>

                        <View style={styles.slideContent}>
                            <View style={styles.emojiCircle}>
                                <Text style={styles.emoji}>{item.emoji}</Text>
                            </View>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                            <Text style={styles.desc}>{item.desc}</Text>
                        </View>
                    </LinearGradient>
                )}
            />

            {/* ── FIXED BOTTOM CONTROLS ── */}
            <View style={styles.bottomBar}>
                {/* Dots */}
                <View style={styles.dotsRow}>
                    {slides.map((_, i) => (
                        <TouchableOpacity key={i} onPress={() => {
                            flatListRef.current?.scrollToIndex({ index: i, animated: true });
                            setCurrent(i);
                        }}>
                            <View style={[styles.dot, i === current && styles.dotActive]} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Next / Start Button */}
                <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={goNext}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={slides[current].gradient}
                        style={styles.nextBtnInner}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.nextText}>
                            {current === slides.length - 1 ? '🚀 शुरू करें' : 'आगे बढ़ें →'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Skip Bottom */}
                <TouchableOpacity
                    style={styles.skipBottomBtn}
                    onPress={skip}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipBottomText}>
                        {current === slides.length - 1 ? '' : 'Skip करें'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#1A1A2E' },

    // Slide
    slide: {
        width,
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 20},
    skipTopBtn: {
        alignSelf: 'flex-end',
        marginRight: 24,
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20},
    skipTopText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14},
    slideContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32},
    emojiCircle: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.35)'},
    emoji: { fontSize: 64 },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 32},
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 14,
        fontWeight: '600'},
    desc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 22},

    // Bottom Controls — ALWAYS on screen
    bottomBar: {
        backgroundColor: '#1A1A2E',
        paddingHorizontal: 28,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 36 : 28,
        alignItems: 'center'},
    dotsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24},
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.25)'},
    dotActive: {
        width: 28,
        backgroundColor: '#FF6B35'},
    nextBtn: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 14,
        elevation: 4,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8},
    nextBtnInner: {
        paddingVertical: 17,
        alignItems: 'center'},
    nextText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800'},
    skipBottomBtn: {
        paddingVertical: 6,
        minHeight: 30},
    skipBottomText: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 14,
        fontWeight: '600'}});

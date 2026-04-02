import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        ).start();

        const timer = setTimeout(() => navigation.replace('Onboarding'), 2800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <LinearGradient colors={['#FF6B35', '#E85D2E', '#1A1A2E']} style={styles.container} locations={[0, 0.5, 1]}>
            <View style={styles.content}>
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulseAnim }] }]}>
                        <Text style={styles.logoEmoji}>🏙️</Text>
                    </Animated.View>
                </Animated.View>

                <Animated.View style={[styles.textContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.appName}>अपना बैतूल</Text>
                    <Text style={styles.appNameEn}>Apna Betul</Text>
                    <View style={styles.divider} />
                    <Text style={styles.tagline}>बैतूल का अपना डिजिटल शहर</Text>
                    <Text style={styles.taglineEn}>Your Complete City App</Text>
                </Animated.View>

                <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
                    <View style={styles.dotsContainer}>
                        {[0, 1, 2].map(i => (
                            <Animated.View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
                        ))}
                    </View>
                    <Text style={styles.poweredBy}>Made with ❤️ for Betul</Text>
                </Animated.View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    logoContainer: { marginBottom: 32, alignItems: 'center' },
    logoCircle: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)'},
    logoEmoji: { fontSize: 70 },
    textContainer: { alignItems: 'center' },
    appName: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2 },
    appNameEn: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    divider: { width: 60, height: 3, backgroundColor: '#F7C948', borderRadius: 2, marginVertical: 16 },
    tagline: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
    taglineEn: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    bottomSection: { position: 'absolute', bottom: 60, alignItems: 'center' },
    dotsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
    dotActive: { backgroundColor: '#FFFFFF', width: 24 },
    poweredBy: { fontSize: 13, color: 'rgba(255,255,255,0.6)' }});

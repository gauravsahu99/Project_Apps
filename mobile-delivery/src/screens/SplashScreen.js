import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, { transform: [{ scale }], opacity }]}>
        <Text style={styles.emoji}>🚴</Text>
        <Text style={styles.title}>Apna Betul</Text>
        <Text style={styles.subtitle}>Delivery Partner App</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  inner: { alignItems: 'center' },
  emoji: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 36, fontWeight: '800', color: '#FFF', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 6 },
});

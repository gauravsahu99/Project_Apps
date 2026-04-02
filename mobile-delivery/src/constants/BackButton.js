/**
 * BackButton — Delivery App (mobile-delivery)
 * Advanced diamond/shield shaped back button with green accent glow.
 * Smart navigation: goes back if possible, otherwise navigates to Home.
 */
import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

export default function BackButton({ navigation, fallback = 'Home', style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start();

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(fallback);
    }
  };

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
      <TouchableOpacity
        style={styles.btn}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={styles.arrow}>←</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4CAF50',
    opacity: 0,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ rotate: '0deg' }],
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
});

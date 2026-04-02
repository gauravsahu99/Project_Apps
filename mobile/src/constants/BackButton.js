/**
 * BackButton — Customer App (mobile)
 * Advanced, unique back button with dark navy glassmorphism style.
 * Smart navigation: goes back if possible, otherwise navigates to fallback.
 */
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';

export default function BackButton({ navigation, fallback = 'Main', color = '#FF6B35', style }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(fallback);
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity style={styles.btn} onPress={handlePress} activeOpacity={0.8}>
        <View style={[styles.iconRing, { borderColor: color + '55' }]}>
          <Text style={styles.arrow}>‹</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  iconRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
    marginLeft: -2,
  },
});

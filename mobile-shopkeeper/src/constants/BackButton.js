/**
 * BackButton — Shopkeeper App (mobile-shopkeeper)
 * Advanced pill-shaped back button with orange flame accent.
 * Smart navigation: goes back if possible, otherwise navigates to MainTabs.
 */
import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';

export default function BackButton({ navigation, fallback = 'Dashboard', label = 'Back', style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.6, duration: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]),
    ]).start();

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Tab screen — navigate to the fallback tab
      navigation.navigate(fallback);
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity }, style]}>
      <TouchableOpacity style={styles.btn} onPress={handlePress} activeOpacity={0.85}>
        <View style={styles.arrowBox}>
          <Text style={styles.arrow}>‹</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 22,
    paddingLeft: 4,
    paddingRight: 14,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    gap: 4,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  arrowBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
    marginLeft: -1,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },
});

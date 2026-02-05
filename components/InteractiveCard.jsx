import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const InteractiveCard = ({ 
  children, 
  onPress, 
  style, 
  disabled = false,
  hapticType = 'light', // 'light', 'medium', 'heavy', 'none'
  pressScale = 0.98,
  shadowIntensity = 1,
}) => {
  const pressed = useSharedValue(0);
  const hovered = useSharedValue(0);

  const triggerHaptic = () => {
    if (hapticType === 'none' || disabled) return;
    
    switch (hapticType) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, pressScale]);
    const translateY = interpolate(pressed.value, [0, 1], [0, 2]);
    const shadowOpacity = interpolate(pressed.value, [0, 1], [0.15 * shadowIntensity, 0.05 * shadowIntensity]);
    const shadowRadius = interpolate(pressed.value, [0, 1], [12 * shadowIntensity, 4 * shadowIntensity]);
    const elevation = interpolate(pressed.value, [0, 1], [8 * shadowIntensity, 2 * shadowIntensity]);

    return {
      transform: [{ scale }, { translateY }],
      shadowOpacity,
      shadowRadius,
      elevation,
    };
  });

  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 15, stiffness: 400 });
    triggerHaptic();
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.card, animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default InteractiveCard;

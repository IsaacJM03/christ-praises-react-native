import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../constants/theme';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const AnimatedIcon = ({
  name,
  activeName,
  isActive = false,
  size = 24,
  color = theme.colors.textMuted,
  activeColor = theme.colors.primary,
  onPress,
  animationType = 'bounce', // 'bounce', 'rotate', 'pulse', 'shake'
  style,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const triggerAnimation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (animationType) {
      case 'bounce':
        scale.value = withSequence(
          withSpring(1.3, { damping: 10, stiffness: 400 }),
          withSpring(0.9, { damping: 10, stiffness: 400 }),
          withSpring(1, { damping: 15, stiffness: 300 })
        );
        break;
      case 'rotate':
        rotation.value = withSequence(
          withTiming(15, { duration: 100 }),
          withTiming(-15, { duration: 100 }),
          withTiming(0, { duration: 100 })
        );
        break;
      case 'pulse':
        scale.value = withSequence(
          withTiming(1.2, { duration: 150 }),
          withTiming(1, { duration: 150 })
        );
        break;
      case 'shake':
        rotation.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
        break;
    }
  };

  const handlePress = () => {
    triggerAnimation();
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={style}>
      <AnimatedIonicons
        name={isActive ? (activeName || name) : name}
        size={size}
        color={isActive ? activeColor : color}
        style={animatedStyle}
      />
    </Pressable>
  );
};

export default AnimatedIcon;

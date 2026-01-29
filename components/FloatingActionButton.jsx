import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import Icon from '../assets/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Floating Action Button Component
 * 
 * A premium floating button with spring animations.
 * 
 * Props:
 * - onPress: callback
 * - icon: icon name (default: 'plus')
 * - size: number (default: 56)
 * - style: additional styles
 */
const FloatingActionButton = ({
  onPress,
  icon = 'plus',
  size = 56,
  style,
}) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 150 });
  };

  const handlePress = () => {
    // Quick rotate animation on press
    rotate.value = withSequence(
      withTiming(90, { duration: 100 }),
      withSpring(0, { damping: 8, stiffness: 100 })
    );
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle, style]}
    >
      <LinearGradient
        colors={theme.colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Icon name={icon} size={size * 0.45} color="white" strokeWidth={2.5} />
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    ...theme.shadow.lg,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingActionButton;

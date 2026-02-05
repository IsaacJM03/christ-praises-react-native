import React, { useEffect } from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GlowButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'outline'
  size = 'large', // 'small', 'medium', 'large'
  icon,
  style,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const glowScale = useSharedValue(1);

  // Subtle pulse animation for glow
  useEffect(() => {
    if (!disabled && !loading) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
    return () => {
      cancelAnimation(glowOpacity);
      cancelAnimation(glowScale);
    };
  }, [disabled, loading]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const getGradientColors = () => {
    if (disabled) return [theme.colors.grayMedium, theme.colors.grayDark];
    switch (variant) {
      case 'secondary':
        return [theme.colors.secondary, '#E55A5A'];
      case 'outline':
        return ['transparent', 'transparent'];
      default:
        return [theme.colors.primary, theme.colors.primaryDark];
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'small': return hp(5);
      case 'medium': return hp(6);
      default: return hp(7);
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[styles.container, buttonStyle, style]}
    >
      {/* Glow effect */}
      {!disabled && variant !== 'outline' && (
        <Animated.View style={[styles.glow, glowStyle, { backgroundColor: getGradientColors()[0] }]} />
      )}
      
      <AnimatedLinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          { height: getHeight() },
          variant === 'outline' && styles.outlineButton,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : 'white'} />
        ) : (
          <>
            {icon}
            <Text style={[
              styles.text,
              variant === 'outline' && styles.outlineText,
              size === 'small' && styles.smallText,
            ]}>
              {title}
            </Text>
          </>
        )}
      </AnimatedLinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    bottom: -4,
    borderRadius: theme.radius.xl,
    opacity: 0.5,
    filter: 'blur(10px)',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xl,
    paddingHorizontal: wp(6),
    gap: theme.spacing.sm,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  text: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.bold,
    color: 'white',
    letterSpacing: 0.5,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  smallText: {
    fontSize: hp(1.6),
  },
});

export default GlowButton;

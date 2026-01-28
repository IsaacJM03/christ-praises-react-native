import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Image, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

/**
 * Interactive Logo Component
 * 
 * Uses the existing welcome2.png logo (three colorful leaves).
 * Supports multiple animation modes for different screens.
 * 
 * Props:
 * - mode: 'splash' | 'onboarding' | 'home' | 'static'
 * - motionIntensity: 0-1 (default 1)
 * - size: number (default 200)
 * - onAnimationComplete: callback when splash animation completes
 * - isFocused: boolean to calm motion when inputs are focused
 */
const InteractiveLogo = ({
  mode = 'static',
  motionIntensity = 1,
  size = 200,
  onAnimationComplete,
  isFocused = false,
  style,
}) => {
  // Animation shared values
  const opacity = useSharedValue(mode === 'splash' ? 0 : 1);
  const scale = useSharedValue(mode === 'splash' ? 0.8 : 1);
  const rotation = useSharedValue(0);
  
  // Breathing animation for home screen
  const breathingScale = useSharedValue(1);
  
  // Reduced motion preference
  const [reducedMotion, setReducedMotion] = React.useState(false);
  
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion
    );
    return () => subscription?.remove?.();
  }, []);

  const notifyComplete = useCallback(() => {
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  // Splash screen animation
  useEffect(() => {
    if (mode === 'splash' && !reducedMotion) {
      opacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      scale.value = withDelay(
        200,
        withSpring(1, {
          damping: 12,
          stiffness: 100,
          mass: 1,
        }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(notifyComplete)();
          }
        })
      );
    } else if (mode === 'splash' && reducedMotion) {
      opacity.value = 1;
      scale.value = 1;
      if (onAnimationComplete) {
        setTimeout(notifyComplete, 500);
      }
    }
  }, [mode, reducedMotion]);

  // Onboarding subtle motion
  useEffect(() => {
    if (mode === 'onboarding' && !reducedMotion) {
      const intensity = isFocused ? 0.3 : motionIntensity;
      
      rotation.value = withRepeat(
        withSequence(
          withTiming(-3 * intensity, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(3 * intensity, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
    
    return () => {
      if (mode === 'onboarding') {
        cancelAnimation(rotation);
      }
    };
  }, [mode, isFocused, motionIntensity, reducedMotion]);

  // Home screen calm breathing animation
  useEffect(() => {
    if (mode === 'home' && !reducedMotion) {
      const intensity = motionIntensity * 0.5;
      
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1 + 0.02 * intensity, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1 - 0.01 * intensity, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
    
    return () => {
      if (mode === 'home') {
        cancelAnimation(breathingScale);
      }
    };
  }, [mode, motionIntensity, reducedMotion]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value * breathingScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle, style]}>
      <Image
        source={require('../assets/images/welcome2.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Christ Praises Logo - Three colorful leaves"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InteractiveLogo;

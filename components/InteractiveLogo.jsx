import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { theme } from '../constants/theme';

const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * Interactive SVG Logo Component
 * 
 * Based on the existing welcome2.png logo (three colorful leaves).
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
  
  // Individual leaf animations
  const yellowLeafRotation = useSharedValue(0);
  const greenLeafRotation = useSharedValue(0);
  const redLeafRotation = useSharedValue(0);
  
  const yellowLeafScale = useSharedValue(1);
  const greenLeafScale = useSharedValue(1);
  const redLeafScale = useSharedValue(1);
  
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
      // Soft scale-in + fade-in + spring settle
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
      
      // Staggered leaf entrance
      yellowLeafScale.value = withDelay(300, withSpring(1.05, { damping: 8 }));
      greenLeafScale.value = withDelay(400, withSpring(1.05, { damping: 8 }));
      redLeafScale.value = withDelay(500, withSpring(1.05, { damping: 8 }));
      
      // Settle back
      setTimeout(() => {
        yellowLeafScale.value = withSpring(1, { damping: 10 });
        greenLeafScale.value = withSpring(1, { damping: 10 });
        redLeafScale.value = withSpring(1, { damping: 10 });
      }, 800);
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
      
      // Subtle floating motion
      yellowLeafRotation.value = withRepeat(
        withSequence(
          withTiming(-3 * intensity, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(3 * intensity, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      
      greenLeafRotation.value = withDelay(
        300,
        withRepeat(
          withSequence(
            withTiming(2 * intensity, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
            withTiming(-2 * intensity, { duration: 2200, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        )
      );
      
      redLeafRotation.value = withDelay(
        600,
        withRepeat(
          withSequence(
            withTiming(-2.5 * intensity, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
            withTiming(2.5 * intensity, { duration: 1800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        )
      );
    }
    
    return () => {
      if (mode === 'onboarding') {
        cancelAnimation(yellowLeafRotation);
        cancelAnimation(greenLeafRotation);
        cancelAnimation(redLeafRotation);
      }
    };
  }, [mode, isFocused, motionIntensity, reducedMotion]);

  // Home screen calm breathing animation
  useEffect(() => {
    if (mode === 'home' && !reducedMotion) {
      const intensity = motionIntensity * 0.5; // Calmer than onboarding
      
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1 + 0.02 * intensity, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1 - 0.01 * intensity, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      
      // Very subtle leaf movement
      yellowLeafRotation.value = withRepeat(
        withSequence(
          withTiming(-1.5 * intensity, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.5 * intensity, { duration: 4000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
    
    return () => {
      if (mode === 'home') {
        cancelAnimation(breathingScale);
        cancelAnimation(yellowLeafRotation);
      }
    };
  }, [mode, motionIntensity, reducedMotion]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value * breathingScale.value },
    ],
  }));

  const yellowLeafStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${yellowLeafRotation.value}deg` },
      { scale: yellowLeafScale.value },
    ],
  }));

  const greenLeafStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${greenLeafRotation.value}deg` },
      { scale: greenLeafScale.value },
    ],
  }));

  const redLeafStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${redLeafRotation.value}deg` },
      { scale: redLeafScale.value },
    ],
  }));

  const viewBox = "0 0 200 200";
  const scaleFactor = size / 200;

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, containerAnimatedStyle, style]}>
      <Svg
        width={size}
        height={size}
        viewBox={viewBox}
        accessibilityRole="image"
        accessibilityLabel="Christ Praises Logo - Three colorful leaves"
      >
        <Defs>
          {/* Yellow leaf gradient */}
          <LinearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFE066" />
            <Stop offset="50%" stopColor="#FFD93D" />
            <Stop offset="100%" stopColor="#F4B942" />
          </LinearGradient>
          
          {/* Green leaf gradient */}
          <LinearGradient id="greenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#6B8E23" />
            <Stop offset="50%" stopColor="#8FBC3C" />
            <Stop offset="100%" stopColor="#9ACD32" />
          </LinearGradient>
          
          {/* Red leaf gradient */}
          <LinearGradient id="redGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#CD5C5C" />
            <Stop offset="50%" stopColor="#B22222" />
            <Stop offset="100%" stopColor="#8B0000" />
          </LinearGradient>
          
          {/* Vein colors */}
          <LinearGradient id="yellowVein" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E8A838" />
            <Stop offset="100%" stopColor="#D4942B" />
          </LinearGradient>
          
          <LinearGradient id="greenVein" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#5A7D1C" />
            <Stop offset="100%" stopColor="#4A6A16" />
          </LinearGradient>
          
          <LinearGradient id="redVein" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B2323" />
            <Stop offset="100%" stopColor="#6B1515" />
          </LinearGradient>
        </Defs>

        {/* Green Leaf (bottom left) */}
        <AnimatedG style={greenLeafStyle} origin={`${65 * scaleFactor}, ${140 * scaleFactor}`}>
          <Path
            d="M30 170 Q20 130 50 100 Q70 80 80 60 Q100 90 100 120 Q95 160 60 180 Q40 185 30 170"
            fill="url(#greenGrad)"
          />
          {/* Green leaf vein */}
          <Path
            d="M65 165 Q60 140 65 115 M65 130 Q55 120 45 125 M65 145 Q75 140 82 148"
            stroke="url(#greenVein)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity={0.6}
          />
        </AnimatedG>

        {/* Red Leaf (bottom right) */}
        <AnimatedG style={redLeafStyle} origin={`${135 * scaleFactor}, ${140 * scaleFactor}`}>
          <Path
            d="M170 170 Q180 130 150 100 Q130 80 120 60 Q100 90 100 120 Q105 160 140 180 Q160 185 170 170"
            fill="url(#redGrad)"
          />
          {/* Red leaf vein */}
          <Path
            d="M135 165 Q140 140 135 115 M135 130 Q145 120 155 125 M135 145 Q125 140 118 148"
            stroke="url(#redVein)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity={0.6}
          />
        </AnimatedG>

        {/* Yellow Leaf (top center) - drawn last to be on top */}
        <AnimatedG style={yellowLeafStyle} origin={`${100 * scaleFactor}, ${80 * scaleFactor}`}>
          <Path
            d="M100 20 Q70 50 65 80 Q60 110 80 140 Q100 160 120 140 Q140 110 135 80 Q130 50 100 20"
            fill="url(#yellowGrad)"
          />
          {/* Yellow leaf vein */}
          <Path
            d="M100 45 Q100 80 100 120 M100 65 Q85 70 78 62 M100 85 Q115 90 122 82 M100 105 Q88 108 82 102"
            stroke="url(#yellowVein)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity={0.6}
          />
        </AnimatedG>
      </Svg>
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

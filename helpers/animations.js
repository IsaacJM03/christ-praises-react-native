import {
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';

export const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

export const timingConfig = {
  duration: theme.animation.normal,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export const fadeIn = (value, duration = theme.animation.normal) => {
  'worklet';
  return withTiming(1, { duration, easing: Easing.ease });
};

export const fadeOut = (value, duration = theme.animation.normal) => {
  'worklet';
  return withTiming(0, { duration, easing: Easing.ease });
};

export const slideUp = (value, toValue = 0, duration = theme.animation.normal) => {
  'worklet';
  return withTiming(toValue, { duration, easing: Easing.out(Easing.cubic) });
};

export const slideDown = (value, toValue = 100, duration = theme.animation.normal) => {
  'worklet';
  return withTiming(toValue, { duration, easing: Easing.out(Easing.cubic) });
};

export const scalePress = (isPressed) => {
  'worklet';
  return withSpring(isPressed ? 0.95 : 1, springConfig);
};

export const pulse = (value) => {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(1.05, { duration: 500 }),
      withTiming(1, { duration: 500 })
    ),
    -1,
    true
  );
};

export const shimmer = (value, duration = 1500) => {
  'worklet';
  return withRepeat(
    withTiming(1, { duration, easing: Easing.linear }),
    -1,
    false
  );
};

export const staggeredEntrance = (index, baseDelay = 50) => {
  return withDelay(index * baseDelay, withTiming(1, timingConfig));
};

export const useFadeInAnimation = (delay = 0, duration = theme.animation.normal) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const startAnimation = () => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
    translateY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
  };

  return { animatedStyle, startAnimation, opacity, translateY };
};

export const useScaleAnimation = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, springConfig);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  return { animatedStyle, onPressIn, onPressOut };
};

export const usePulseAnimation = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const startPulse = () => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  };

  const stopPulse = () => {
    scale.value = withTiming(1, { duration: 200 });
  };

  return { animatedStyle, startPulse, stopPulse };
};

export const useShimmerAnimation = (duration = 1500) => {
  const shimmerValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerValue.value, [0, 1], [-100, 100]);
    return {
      transform: [{ translateX }],
    };
  });

  const startShimmer = () => {
    shimmerValue.value = 0;
    shimmerValue.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false
    );
  };

  return { animatedStyle, startShimmer };
};

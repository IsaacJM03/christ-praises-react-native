import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';

const RippleButton = ({
  onPress,
  icon,
  iconSize = 22,
  label,
  color = theme.colors.primary,
  backgroundColor,
  size = 44,
  style,
}) => {
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const triggerRipple = () => {
    rippleScale.value = 0;
    rippleOpacity.value = 0.3;
    rippleScale.value = withTiming(2, { duration: 400 });
    rippleOpacity.value = withTiming(0, { duration: 400 });
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    triggerRipple();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View 
        style={[
          styles.container, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            backgroundColor: backgroundColor || color + '15',
          },
          buttonStyle, 
          style
        ]}
      >
        {/* Ripple effect */}
        <Animated.View 
          style={[
            styles.ripple, 
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              backgroundColor: color,
            },
            rippleStyle
          ]} 
        />
        
        {icon && <Ionicons name={icon} size={iconSize} color={color} />}
        {label && <Text style={[styles.label, { color }]}>{label}</Text>}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
  },
  label: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.medium,
    marginTop: 2,
  },
});

export default RippleButton;

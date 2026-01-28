import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const FloatingInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  error,
  style,
  inputRef,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = useSharedValue(value ? 1 : 0);

  const labelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(animatedValue.value, [0, 1], [0, -22]);
    const scale = interpolate(animatedValue.value, [0, 1], [1, 0.85]);

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    const borderColor = error
      ? theme.colors.error
      : interpolateColor(
          animatedValue.value,
          [0, 1],
          [theme.colors.grayMedium, theme.colors.primary]
        );

    return {
      borderColor,
      borderWidth: isFocused || value ? 1.5 : 1,
    };
  });

  const handleFocus = () => {
    setIsFocused(true);
    animatedValue.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      animatedValue.value = withTiming(0, { duration: 200 });
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View style={[styles.container, containerStyle]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.inputWrapper}>
          {label && (
            <Animated.Text
              style={[
                styles.label,
                labelStyle,
                isFocused && { color: error ? theme.colors.error : theme.colors.primary },
              ]}
            >
              {label}
            </Animated.Text>
          )}
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={!label || isFocused || value ? placeholder : ''}
            placeholderTextColor={theme.colors.grayMedium}
            secureTextEntry={secureTextEntry && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            {...props}
          />
        </View>
        {secureTextEntry && (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
            <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.radius.lg,
    height: hp(7.5),
    paddingHorizontal: theme.spacing.md,
    borderColor: theme.colors.grayMedium,
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
  },
  label: {
    position: 'absolute',
    left: 0,
    color: theme.colors.grayDark,
    fontSize: hp(1.8),
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
  },
  input: {
    flex: 1,
    fontSize: hp(1.9),
    color: theme.colors.textDark,
    paddingTop: hp(1.2),
  },
  eyeButton: {
    padding: theme.spacing.xs,
  },
  eyeText: {
    color: theme.colors.primary,
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: hp(1.4),
    marginTop: 4,
    marginLeft: theme.spacing.md,
  },
});

export default FloatingInput;

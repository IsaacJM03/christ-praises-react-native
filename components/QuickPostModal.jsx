import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons';
import AnimatedButton from './AnimatedButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Quick Post Composer Modal
 * 
 * A lightweight bottom sheet for creating quick posts.
 * Features smooth animated entrance/exit.
 * 
 * Props:
 * - visible: boolean
 * - onClose: callback
 * - onSubmit: (content: string) => void
 */
const QuickPostModal = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { bottom } = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  
  // Animation values
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const sheetScale = useSharedValue(0.95);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });
      sheetScale.value = withSpring(1, { damping: 18, stiffness: 250 });
      
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetScale.value = withTiming(0.95, { duration: 200 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: sheetScale.value },
    ],
  }));

  const handleClose = () => {
    setContent('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit?.(content.trim());
      setContent('');
      handleClose();
    } catch (error) {
      // Silent fail for demo - in production, show error toast
      if (__DEV__) {
        console.error('Failed to submit post:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = content.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;
  const remainingCharacters = maxCharacters - characterCount;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: bottom + 16 }]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Icon name="arrowLeft" size={22} color={theme.colors.textMuted} />
            </Pressable>
            <Text style={styles.headerTitle}>Quick Post</Text>
            <View style={styles.headerRight}>
              <Text style={[
                styles.characterCount,
                isOverLimit && styles.characterCountOver,
                remainingCharacters <= 20 && !isOverLimit && styles.characterCountWarning,
              ]}>
                {remainingCharacters}
              </Text>
            </View>
          </View>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Share what's on your heart..."
              placeholderTextColor={theme.colors.grayMedium}
              multiline
              maxLength={maxCharacters + 10} // Small buffer for smoother UX
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <View style={styles.actionButtons}>
              <Pressable style={styles.actionButton}>
                <Icon name="image" size={22} color={theme.colors.primary} />
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Icon name="camera" size={22} color={theme.colors.primary} />
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Icon name="heart" size={22} color={theme.colors.primary} />
              </Pressable>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <AnimatedButton
              title="Share"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!content.trim() || isOverLimit}
              icon={<Icon name="send" size={18} color="white" />}
            />
          </View>

          {/* Inspirational hint */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              "Let your light shine before others" - Matthew 5:16
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingHorizontal: theme.spacing.md,
    minHeight: hp(45),
    ...theme.shadow.lg,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.grayMedium,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  characterCount: {
    fontSize: hp(1.5),
    color: theme.colors.textMuted,
    fontWeight: theme.fonts.medium,
  },
  characterCountWarning: {
    color: theme.colors.warning,
  },
  characterCountOver: {
    color: theme.colors.error,
  },
  inputContainer: {
    paddingVertical: theme.spacing.md,
    minHeight: hp(15),
  },
  input: {
    fontSize: hp(1.9),
    color: theme.colors.text,
    lineHeight: hp(2.8),
    minHeight: hp(12),
    maxHeight: hp(25),
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContainer: {
    paddingVertical: theme.spacing.md,
  },
  hintContainer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
  },
  hintText: {
    fontSize: hp(1.3),
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default QuickPostModal;

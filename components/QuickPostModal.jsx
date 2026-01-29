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
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import Icon from '../assets/icons';
import AnimatedButton from './AnimatedButton';
import { postService } from '../lib/postService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const QuickPostModal = ({
  visible,
  onClose,
  onPostCreated, // Add callback prop instead
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
      const result = await postService.createPost(content.trim());
      
      if (result.success) {
        setContent('');
        onPostCreated?.(result.data); // Notify parent of new post
        handleClose();
      } else {
        Alert.alert('Error', result.message || 'Failed to create post');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
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
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: Math.max(bottom, 16) }]}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Icon name="arrowLeft" size={20} color={theme.colors.textMuted} />
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

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Share what's on your heart..."
              placeholderTextColor={theme.colors.grayMedium}
              multiline
              maxLength={maxCharacters + 10}
              value={content}
              onChangeText={setContent}
            />
          </View>

          <View style={styles.quickActions}>
            <View style={styles.actionButtons}>
              <Pressable style={styles.actionButton}>
                <Icon name="image" size={20} color={theme.colors.primary} />
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Icon name="camera" size={20} color={theme.colors.primary} />
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Icon name="heart" size={20} color={theme.colors.primary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.submitContainer}>
            <AnimatedButton
              title="Share"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!content.trim() || isOverLimit}
            />
          </View>

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
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: wp(5),
    maxHeight: hp(60),
    ...theme.shadow.lg,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.grayMedium,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
  headerRight: {
    width: 36,
    alignItems: 'center',
  },
  characterCount: {
    fontSize: hp(1.4),
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    minHeight: hp(18),
  },
  input: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    lineHeight: hp(2.6),
    minHeight: hp(15),
    textAlignVertical: 'top',
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.grayLight,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContainer: {
    paddingVertical: theme.spacing.sm,
  },
  hintContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  hintText: {
    fontSize: hp(1.2),
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default QuickPostModal;

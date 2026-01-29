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
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import AnimatedButton from './AnimatedButton';
import { usePosts } from '../contexts/PostContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const QuickPostModal = ({
  visible,
  onClose,
}) => {
  const { bottom } = useSafeAreaInsets();
  const { createPost } = usePosts();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  
  // Animation values
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 300,
        mass: 0.8,
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
      backdropOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = () => {
    setContent('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const result = await createPost(content.trim());
      
      if (result.success) {
        setContent('');
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
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </Pressable>
            <Text style={styles.headerTitle}>Create Post</Text>
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
              placeholder="What's on your mind?"
              placeholderTextColor={theme.colors.grayMedium}
              multiline
              maxLength={maxCharacters + 10}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomSection}>
            {/* Media Actions */}
            <View style={styles.mediaActions}>
              <Pressable style={styles.mediaButton}>
                <Ionicons name="image-outline" size={22} color={theme.colors.primary} />
              </Pressable>
              <Pressable style={styles.mediaButton}>
                <Ionicons name="camera-outline" size={22} color={theme.colors.primary} />
              </Pressable>
              <Pressable style={styles.mediaButton}>
                <Ionicons name="location-outline" size={22} color={theme.colors.primary} />
              </Pressable>
            </View>

            {/* Submit Button */}
            <Pressable 
              style={[
                styles.submitButton,
                (!content.trim() || isOverLimit) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!content.trim() || isOverLimit || isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Posting...</Text>
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Post</Text>
                  <Ionicons name="send" size={16} color="white" style={{ marginLeft: 6 }} />
                </>
              )}
            </Pressable>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: wp(4),
    ...theme.shadow.lg,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.grayMedium,
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  headerTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
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
    minHeight: hp(20),
    maxHeight: hp(35),
    paddingVertical: 16,
  },
  input: {
    fontSize: hp(1.9),
    color: theme.colors.text,
    lineHeight: hp(2.8),
    minHeight: hp(18),
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.grayLight,
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.grayMedium,
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semibold,
  },
});

export default QuickPostModal;

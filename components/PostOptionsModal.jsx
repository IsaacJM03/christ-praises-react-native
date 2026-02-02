import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal, Alert } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const PostOptionsModal = ({
  visible,
  onClose,
  post,
  isOwnPost,
  onEdit,
  onDelete,
  onReport,
  onShare,
  onBookmark,
  isBookmarked,
}) => {
  const insets = useSafeAreaInsets();

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(`https://christpraises.app/post/${post?.id}`);
      Alert.alert('Copied!', 'Post link copied to clipboard');
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDelete?.(post?.id);
            onClose();
          }
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Report Post',
      'Why are you reporting this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Inappropriate', onPress: () => submitReport('inappropriate') },
        { text: 'Harassment', onPress: () => submitReport('harassment') },
      ]
    );
  };

  const submitReport = (reason) => {
    onReport?.(post?.id, reason);
    Alert.alert('Report Submitted', 'Thank you for helping keep our community safe.');
    onClose();
  };

  const handleBookmark = () => {
    onBookmark?.(post?.id);
    onClose();
  };

  const handleShare = () => {
    onShare?.(post?.id);
    onClose();
  };

  if (!visible) return null;

  const options = [
    {
      icon: isBookmarked ? 'bookmark' : 'bookmark-outline',
      label: isBookmarked ? 'Remove from Saved' : 'Save Post',
      onPress: handleBookmark,
      color: isBookmarked ? theme.colors.primary : theme.colors.textDark,
    },
    {
      icon: 'share-social-outline',
      label: 'Share',
      onPress: handleShare,
      color: theme.colors.textDark,
    },
    {
      icon: 'copy-outline',
      label: 'Copy Link',
      onPress: handleCopyLink,
      color: theme.colors.textDark,
    },
    ...(isOwnPost ? [
      {
        icon: 'create-outline',
        label: 'Edit Post',
        onPress: () => {
          onEdit?.(post);
          onClose();
        },
        color: theme.colors.textDark,
      },
      {
        icon: 'trash-outline',
        label: 'Delete Post',
        onPress: handleDelete,
        color: theme.colors.rose,
      },
    ] : [
      {
        icon: 'flag-outline',
        label: 'Report Post',
        onPress: handleReport,
        color: theme.colors.rose,
      },
    ]),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View 
          entering={SlideInDown.duration(300)}
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Post Preview */}
            {post && (
              <View style={styles.postPreview}>
                <View style={styles.previewAvatar}>
                  <Text style={styles.previewAvatarText}>
                    {post.user_name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={styles.previewContent}>
                  <Text style={styles.previewName}>{post.user_name}</Text>
                  <Text style={styles.previewText} numberOfLines={1}>
                    {post.content}
                  </Text>
                </View>
              </View>
            )}

            {/* Options */}
            <View style={styles.options}>
              {options.map((option, index) => (
                <Animated.View 
                  key={option.label}
                  entering={FadeIn.delay(index * 50)}
                >
                  <Pressable 
                    style={styles.optionItem}
                    onPress={option.onPress}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
                      <Ionicons name={option.icon} size={22} color={option.color} />
                    </View>
                    <Text style={[styles.optionLabel, { color: option.color }]}>
                      {option.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.grayMedium} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            {/* Cancel Button */}
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.grayMedium,
    opacity: 0.3,
  },
  postPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
    marginBottom: theme.spacing.sm,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  previewAvatarText: {
    color: 'white',
    fontWeight: theme.fonts.bold,
    fontSize: 16,
  },
  previewContent: {
    flex: 1,
  },
  previewName: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
  previewText: {
    fontSize: hp(1.4),
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  options: {
    paddingHorizontal: theme.spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  optionLabel: {
    flex: 1,
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
  },
  cancelButton: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
});

export default PostOptionsModal;

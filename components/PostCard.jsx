import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Animated Action Button
const ActionButton = ({ icon, iconFilled, isActive, count, activeColor, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // Bounce animation
    scale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    onPress?.();
  };

  return (
    <AnimatedPressable style={[styles.actionButton, animatedStyle]} onPress={handlePress}>
      <Ionicons
        name={isActive ? iconFilled : icon}
        size={22}
        color={isActive ? activeColor : theme.colors.textMuted}
      />
      {count > 0 && (
        <Text style={[styles.actionText, isActive && { color: activeColor }]}>
          {count}
        </Text>
      )}
    </AnimatedPressable>
  );
};

const PostCard = ({
  post,
  onLike,
  onComment,
  onBookmark,
  onShare,
  onUserPress,
  onOptionsPress,
}) => {
  const {
    id,
    content,
    image_url,
    user_name,
    user_image,
    likes_count = 0,
    comments_count = 0,
    is_liked = false,
    is_bookmarked = false,
    created_at,
  } = post;

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Animated.View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.userInfo} onPress={onUserPress}>
          <View style={styles.avatarContainer}>
            {user_image ? (
              <Image source={{ uri: user_image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user_name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            {/* Online indicator */}
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>{user_name || 'Unknown'}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(created_at)}</Text>
          </View>
        </Pressable>
        <Pressable style={styles.optionsButton} onPress={onOptionsPress}>
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{content}</Text>
      </View>

      {/* Post Image (if any) */}
      {image_url && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image_url }} style={styles.postImage} resizeMode="cover" />
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <ActionButton
          icon="heart-outline"
          iconFilled="heart"
          isActive={is_liked}
          count={likes_count}
          activeColor={theme.colors.rose}
          onPress={() => onLike?.(id)}
        />

        <ActionButton
          icon="chatbubble-outline"
          iconFilled="chatbubble"
          isActive={false}
          count={comments_count}
          activeColor={theme.colors.primary}
          onPress={() => onComment?.(id)}
        />

        <ActionButton
          icon="share-social-outline"
          iconFilled="share-social"
          isActive={false}
          count={0}
          activeColor={theme.colors.primary}
          onPress={() => onShare?.(id)}
        />

        <View style={styles.actionSpacer} />

        <ActionButton
          icon="bookmark-outline"
          iconFilled="bookmark"
          isActive={is_bookmarked}
          count={0}
          activeColor={theme.colors.primary}
          onPress={() => onBookmark?.(id)}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    marginHorizontal: wp(4),
    marginVertical: hp(0.8),
    padding: theme.spacing.md,
    ...theme.shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: theme.spacing.sm,
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
  },
  avatarText: {
    color: 'white',
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
  timeAgo: {
    fontSize: hp(1.35),
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  optionsButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  contentContainer: {
    marginBottom: theme.spacing.sm,
  },
  content: {
    fontSize: hp(1.75),
    color: theme.colors.text,
    lineHeight: hp(2.5),
  },
  imageContainer: {
    marginHorizontal: -theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: hp(25),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.grayLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  actionText: {
    fontSize: hp(1.4),
    color: theme.colors.textMuted,
    marginLeft: 4,
    fontWeight: theme.fonts.medium,
  },
  actionSpacer: {
    flex: 1,
  },
});

export default PostCard;

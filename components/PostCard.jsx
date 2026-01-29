import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Double tap to like
const DoubleTapLike = ({ children, onDoubleTap }) => {
  const lastTap = React.useRef(0);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap detected
      heartScale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 300 })
      );
      heartOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 300 })
      );
      onDoubleTap?.();
    }
    lastTap.current = now;
  };

  return (
    <Pressable onPress={handlePress} style={styles.doubleTapContainer}>
      {children}
      <Animated.View style={[styles.doubleTapHeart, heartStyle]}>
        <Ionicons name="heart" size={80} color={theme.colors.rose} />
      </Animated.View>
    </Pressable>
  );
};

// Animated Action Button with ripple effect
const ActionButton = ({ icon, iconFilled, isActive, count, activeColor, onPress, label }) => {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.8, { damping: 10, stiffness: 400 }),
      withSpring(1.2, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    bgOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
    onPress?.();
  };

  return (
    <AnimatedPressable style={[styles.actionButton, animatedStyle]} onPress={handlePress}>
      <Animated.View style={[styles.actionButtonBg, bgStyle, { backgroundColor: activeColor + '20' }]} />
      <Ionicons
        name={isActive ? iconFilled : icon}
        size={20}
        color={isActive ? activeColor : theme.colors.textMuted}
      />
      {count > 0 && (
        <Text style={[styles.actionText, isActive && { color: activeColor }]}>
          {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
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

  const cardScale = useSharedValue(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handlePressIn = () => {
    cardScale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleDoubleTap = () => {
    if (!is_liked) {
      onLike?.(id);
    }
  };

  const shouldTruncate = content?.length > 150;
  const displayContent = shouldTruncate && !isExpanded 
    ? content.substring(0, 150) + '...' 
    : content;

  return (
    <Animated.View style={[styles.container, cardAnimatedStyle]}>
      {/* Card inner shadow/glow effect */}
      <View style={styles.cardInner}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.userInfo} 
            onPress={onUserPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <View style={styles.avatarWrapper}>
              {user_image ? (
                <Image source={{ uri: user_image }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {user_name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </LinearGradient>
              )}
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userTextContainer}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user_name || 'Unknown'}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.colors.primary} />
                </View>
              </View>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
                <Text style={styles.timeAgo}>{formatTimeAgo(created_at)}</Text>
              </View>
            </View>
          </Pressable>
          
          <Pressable style={styles.optionsButton} onPress={onOptionsPress}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textMuted} />
          </Pressable>
        </View>

        {/* Content */}
        <DoubleTapLike onDoubleTap={handleDoubleTap}>
          <View style={styles.contentContainer}>
            <Text style={styles.content}>
              {displayContent}
            </Text>
            {shouldTruncate && (
              <Pressable onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={styles.readMore}>
                  {isExpanded ? 'Show less' : 'Read more'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Post Image */}
          {image_url && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: image_url }} 
                style={styles.postImage} 
                resizeMode="cover" 
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.1)']}
                style={styles.imageOverlay}
              />
            </View>
          )}
        </DoubleTapLike>

        {/* Engagement Stats */}
        {(likes_count > 0 || comments_count > 0) && (
          <View style={styles.statsRow}>
            {likes_count > 0 && (
              <View style={styles.statItem}>
                <View style={styles.statIconGroup}>
                  <View style={[styles.miniIcon, { backgroundColor: theme.colors.rose }]}>
                    <Ionicons name="heart" size={10} color="white" />
                  </View>
                </View>
                <Text style={styles.statText}>
                  {likes_count} {likes_count === 1 ? 'like' : 'likes'}
                </Text>
              </View>
            )}
            {comments_count > 0 && (
              <Text style={styles.statText}>
                {comments_count} {comments_count === 1 ? 'comment' : 'comments'}
              </Text>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <ActionButton
            icon="heart-outline"
            iconFilled="heart"
            isActive={is_liked}
            count={0}
            activeColor={theme.colors.rose}
            onPress={() => onLike?.(id)}
          />

          <ActionButton
            icon="chatbubble-outline"
            iconFilled="chatbubble"
            isActive={false}
            count={0}
            activeColor={theme.colors.primary}
            onPress={() => onComment?.(id)}
          />

          <ActionButton
            icon="paper-plane-outline"
            iconFilled="paper-plane"
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
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp(4),
    marginVertical: hp(0.6),
  },
  cardInner: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: theme.fonts.bold,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: theme.colors.card,
  },
  userTextContainer: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textDark,
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    marginLeft: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  optionsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  doubleTapContainer: {
    position: 'relative',
  },
  doubleTapHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    zIndex: 10,
  },
  contentContainer: {
    marginBottom: 12,
  },
  content: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  readMore: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
    fontSize: 14,
  },
  imageContainer: {
    marginHorizontal: -16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: hp(28),
    backgroundColor: theme.colors.backgroundSecondary,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundSecondary,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIconGroup: {
    flexDirection: 'row',
  },
  miniIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 4,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  actionButtonBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginLeft: 6,
    fontWeight: '600',
  },
  actionSpacer: {
    flex: 1,
  },
});

export default PostCard;

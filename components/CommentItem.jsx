import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CommentItem = ({
  comment,
  postId,
  onLike,
  onReply,
  onLoadReplies,
  onLikeReply,
  replies = [],
  repliesLoading = false,
  isReply = false,
  depth = 0,
  allReplies = {}, // Pass all replies data for nested access
  allRepliesLoading = {},
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  
  const likeScale = useSharedValue(1);

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

  const handleLike = () => {
    likeScale.value = withSequence(
      withSpring(1.3, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
    // Use onLikeReply for nested comments, onLike for top-level
    if (isReply && onLikeReply) {
      onLikeReply(postId, comment.id);
    } else {
      onLike?.(postId, comment.id);
    }
  };

  const handleToggleReplies = async () => {
    if (!showReplies && comment.replies_count > 0) {
      await onLoadReplies?.(postId, comment.id);
    }
    setShowReplies(!showReplies);
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply?.(postId, comment.id, replyText.trim());
    setReplyText('');
    setShowReplyInput(false);
    setShowReplies(true);
  };

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  // Calculate visual indentation (max visual indent at depth 4, but unlimited actual depth)
  const visualDepth = Math.min(depth, 4);
  const indentWidth = isReply ? Math.min(16, 20 - visualDepth * 2) : 0;

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      style={[
        styles.container,
        isReply && styles.replyContainer,
        { marginLeft: isReply ? indentWidth : 0 }
      ]}
    >
      {/* Thread line for nested comments */}
      {isReply && depth > 0 && (
        <View style={[styles.threadLine, { left: -8 }]} />
      )}

      {/* Comment Content */}
      <View style={styles.commentRow}>
        <View style={[styles.avatar, depth > 2 && styles.smallerAvatar]}>
          <Text style={[styles.avatarText, depth > 2 && styles.smallerAvatarText]}>
            {comment.user_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        
        <View style={styles.contentWrapper}>
          <View style={styles.bubble}>
            <View style={styles.headerRow}>
              <Text style={styles.userName}>{comment.user_name || 'User'}</Text>
              <Text style={styles.time}>{formatTimeAgo(comment.created_at)}</Text>
            </View>
            <Text style={styles.content}>{comment.content}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <AnimatedPressable 
              style={[styles.actionButton, likeAnimatedStyle]} 
              onPress={handleLike}
            >
              <Ionicons 
                name={comment.is_liked ? "heart" : "heart-outline"} 
                size={14} 
                color={comment.is_liked ? theme.colors.rose : theme.colors.textMuted} 
              />
              {comment.likes_count > 0 && (
                <Text style={[
                  styles.actionText,
                  comment.is_liked && { color: theme.colors.rose }
                ]}>
                  {comment.likes_count}
                </Text>
              )}
            </AnimatedPressable>

            {/* Always allow replying - unlimited depth */}
            <Pressable 
              style={styles.actionButton} 
              onPress={() => setShowReplyInput(!showReplyInput)}
            >
              <Ionicons name="chatbubble-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.actionText}>Reply</Text>
            </Pressable>

            {comment.replies_count > 0 && (
              <Pressable style={styles.actionButton} onPress={handleToggleReplies}>
                <Ionicons 
                  name={showReplies ? "chevron-up" : "chevron-down"} 
                  size={14} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                  {showReplies ? 'Hide' : `${comment.replies_count}`} {comment.replies_count === 1 ? 'reply' : 'replies'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Reply Input */}
          {showReplyInput && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.replyInputContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder={`Reply to ${comment.user_name}...`}
                placeholderTextColor={theme.colors.grayMedium}
                value={replyText}
                onChangeText={setReplyText}
                multiline
              />
              <View style={styles.replyActions}>
                <Pressable 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowReplyInput(false);
                    setReplyText('');
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[
                    styles.sendButton,
                    !replyText.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={handleSubmitReply}
                  disabled={!replyText.trim()}
                >
                  <Ionicons 
                    name="send" 
                    size={16} 
                    color={replyText.trim() ? 'white' : theme.colors.grayMedium} 
                  />
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Nested Replies - recursive unlimited depth */}
          {showReplies && (
            <View style={styles.repliesContainer}>
              {(allRepliesLoading?.[comment.id] || repliesLoading) ? (
                <View style={styles.repliesLoading}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              ) : (
                (allReplies?.[comment.id] || replies).map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    onLike={onLike}
                    onReply={onReply}
                    onLoadReplies={onLoadReplies}
                    onLikeReply={onLikeReply || onLike}
                    replies={allReplies?.[reply.id] || []}
                    repliesLoading={allRepliesLoading?.[reply.id] || false}
                    isReply={true}
                    depth={depth + 1}
                    allReplies={allReplies}
                    allRepliesLoading={allRepliesLoading}
                  />
                ))
              )}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  replyContainer: {
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.grayLight,
  },
  threadLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.colors.grayLight,
  },
  commentRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  smallerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontWeight: theme.fonts.bold,
    fontSize: 13,
  },
  smallerAvatarText: {
    fontSize: 11,
  },
  contentWrapper: {
    flex: 1,
  },
  bubble: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textDark,
  },
  time: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  content: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 16,
    paddingLeft: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  replyInputContainer: {
    marginTop: 10,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
  },
  replyInput: {
    fontSize: 14,
    color: theme.colors.text,
    minHeight: 36,
    maxHeight: 80,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  repliesContainer: {
    marginTop: 8,
  },
  repliesLoading: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default CommentItem;

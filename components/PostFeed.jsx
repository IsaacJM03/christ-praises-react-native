import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  Share,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { usePosts } from '../contexts/PostContext';
import PostCard from './PostCard';
import { PostSkeletonList } from './PostSkeleton';
import { Ionicons } from '@expo/vector-icons';
import CommentItem from './CommentItem';

const PostFeed = ({ 
  onUserPress, 
  onOptionsPress, 
  ListHeaderComponent 
}) => {
  const {
    posts,
    loading,
    refreshing,
    error,
    pagination,
    fetchFeed,
    refresh,
    loadMore,
    toggleLike,
    toggleBookmark,
    commentsByPost,
    commentsLoading,
    fetchComments,
    addComment,
    toggleCommentLike,
    repliesByComment,
    repliesLoading,
    fetchReplies,
    addReply,
    toggleReplyLike,
  } = usePosts();

  const isFirstLoad = useRef(true);
  const [activePostId, setActivePostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  // Fetch posts on mount
  useEffect(() => {
    if (isFirstLoad.current) {
      fetchFeed(true);
      isFirstLoad.current = false;
    }
  }, []);

  // Handle end reached for infinite scroll
  const handleEndReached = useCallback(() => {
    if (!loading && pagination.hasMore) {
      loadMore();
    }
  }, [loading, pagination.hasMore, loadMore]);

  // Handle share
  const handleShare = useCallback(async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      await Share.share({
        message: `${post.content}\n\n— ${post.user_name || 'Christ Praises'}`,
      });
    } catch (err) {
      // silent fail
    }
  }, [posts]);

  // Open comments modal
  const openComments = useCallback(async (postId) => {
    setActivePostId(postId);
    setShowComments(true);
    await fetchComments(postId);
  }, [fetchComments]);

  // Close comments modal
  const closeComments = () => {
    setShowComments(false);
    setCommentText('');
    setActivePostId(null);
  };

  // Submit comment
  const submitComment = async () => {
    if (!activePostId || !commentText.trim()) return;
    const result = await addComment(activePostId, commentText.trim());
    if (result.success) {
      setCommentText('');
    }
  };

  // Render post item
  const renderPost = useCallback(({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
      <PostCard
        post={item}
        onLike={toggleLike}
        onComment={() => openComments(item.id)}
        onBookmark={toggleBookmark}
        onShare={handleShare}
        onUserPress={() => onUserPress?.(item.user_id)}
        onOptionsPress={() => onOptionsPress?.(item)}
      />
    </Animated.View>
  ), [toggleLike, toggleBookmark, handleShare, onUserPress, onOptionsPress, openComments]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (loading) return null;
    
    return (
      <Animated.View entering={FadeIn.duration(500)} style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🙏</Text>
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptySubtitle}>
          Be the first to share something inspiring with the community!
        </Text>
      </Animated.View>
    );
  }, [loading]);

  // Render footer
  const renderFooter = useCallback(() => {
    if (!pagination.hasMore && posts.length > 0) {
      return (
        <View style={styles.endOfFeed}>
          <Text style={styles.endOfFeedText}>✨ You're all caught up! ✨</Text>
          <Text style={styles.endOfFeedSubtext}>Check back later for more posts</Text>
        </View>
      );
    }

    if (loading && posts.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      );
    }

    return null;
  }, [loading, pagination.hasMore, posts.length]);

  // Render header
  const renderHeader = useCallback(() => {
    return (
      <>
        {ListHeaderComponent && <ListHeaderComponent />}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}
      </>
    );
  }, [ListHeaderComponent, error]);

  // Initial loading state with skeletons
  if (loading && posts.length === 0) {
    return (
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={() => (
          <>
            {ListHeaderComponent && <ListHeaderComponent />}
            <PostSkeletonList count={5} />
          </>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    );
  }

  return (
    <>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => `post-${item.id}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.card}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        transparent
        animationType="slide"
        onRequestClose={closeComments}
      >
        <Pressable style={styles.modalOverlay} onPress={closeComments}>
          <Pressable style={styles.commentsSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.commentsHandle}>
              <View style={styles.handle} />
            </View>
            
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
              <Pressable onPress={closeComments} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.commentsBody}>
              {commentsLoading[activePostId] ? (
                <View style={styles.commentsLoading}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Loading comments...</Text>
                </View>
              ) : (
                <FlatList
                  data={commentsByPost[activePostId] || []}
                  keyExtractor={(c) => `comment-${c.id}`}
                  renderItem={({ item }) => (
                    <CommentItem
                      comment={item}
                      postId={activePostId}
                      onLike={toggleCommentLike}
                      onReply={addReply}
                      onLoadReplies={fetchReplies}
                      onLikeReply={toggleReplyLike}
                      replies={repliesByComment[item.id] || []}
                      repliesLoading={repliesLoading[item.id]}
                      allReplies={repliesByComment}
                      allRepliesLoading={repliesLoading}
                    />
                  )}
                  ListEmptyComponent={
                    <View style={styles.noCommentsContainer}>
                      <Ionicons name="chatbubble-outline" size={48} color={theme.colors.grayMedium} />
                      <Text style={styles.noComments}>No comments yet</Text>
                      <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
                    </View>
                  }
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </View>

            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor={theme.colors.grayMedium}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <Pressable 
                style={[
                  styles.commentSend,
                  !commentText.trim() && styles.commentSendDisabled
                ]} 
                onPress={submitComment}
                disabled={!commentText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={commentText.trim() ? 'white' : theme.colors.grayMedium} 
                />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: hp(10),
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
    paddingHorizontal: wp(10),
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: hp(1.6),
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: hp(2.4),
  },
  errorContainer: {
    padding: theme.spacing.md,
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    backgroundColor: theme.colors.roseLight,
    borderRadius: theme.radius.lg,
  },
  errorText: {
    color: theme.colors.rose,
    fontSize: hp(1.5),
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  loadingMoreText: {
    fontSize: hp(1.5),
    color: theme.colors.textMuted,
  },
  endOfFeed: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: wp(10),
  },
  endOfFeedText: {
    fontSize: hp(1.6),
    color: theme.colors.textMuted,
    fontWeight: theme.fonts.medium,
  },
  endOfFeedSubtext: {
    fontSize: hp(1.4),
    color: theme.colors.grayMedium,
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentsSheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: hp(75),
    minHeight: hp(50),
  },
  commentsHandle: {
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
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
  },
  commentsTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  commentsBody: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  commentsLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: hp(1.5),
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    color: 'white',
    fontWeight: theme.fonts.bold,
    fontSize: 14,
  },
  commentContent: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm,
  },
  commentAuthor: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
    marginBottom: 2,
  },
  commentText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    lineHeight: hp(2.2),
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(5),
  },
  noComments: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
  },
  noCommentsSubtext: {
    color: theme.colors.grayMedium,
    fontSize: hp(1.4),
    marginTop: 4,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.grayLight,
  },
  commentInput: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: hp(1.6),
    color: theme.colors.text,
    maxHeight: 100,
  },
  commentSend: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSendDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
});

export default PostFeed;

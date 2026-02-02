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
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  PanResponder,
  Alert,
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { usePosts } from '../contexts/PostContext';
import PostCard from './PostCard';
import { PostSkeletonList } from './PostSkeleton';
import CommentItem from './CommentItem';
import PostOptionsModal from './PostOptionsModal';
import { authService } from '../lib/authService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;
const MID_SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;
const MIN_SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;

const PostFeed = ({ 
  onUserPress, 
  ListHeaderComponent 
}) => {
  const insets = useSafeAreaInsets();
  
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
    deletePost,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Sheet animation
  const sheetHeight = useSharedValue(MID_SHEET_HEIGHT);
  const sheetTranslateY = useSharedValue(SCREEN_HEIGHT);

  // Get current user ID
  useEffect(() => {
    const loadUser = async () => {
      const user = await authService.getUser();
      setCurrentUserId(user?.id);
    };
    loadUser();
  }, []);

  // Fetch posts on mount
  useEffect(() => {
    if (isFirstLoad.current) {
      fetchFeed(true);
      isFirstLoad.current = false;
    }
  }, []);

  const handleEndReached = useCallback(() => {
    if (!loading && pagination.hasMore) {
      loadMore();
    }
  }, [loading, pagination.hasMore, loadMore]);

  const handleShare = useCallback(async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      await Share.share({
        message: `${post.content}\n\n— ${post.user_name || 'Christ Praises'}`,
      });
    } catch (err) {}
  }, [posts]);

  const openComments = useCallback(async (postId) => {
    setActivePostId(postId);
    setShowComments(true);
    setIsExpanded(false);
    sheetTranslateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    sheetHeight.value = MID_SHEET_HEIGHT;
    await fetchComments(postId);
  }, [fetchComments]);

  const closeComments = useCallback(() => {
    sheetTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
      runOnJS(setShowComments)(false);
      runOnJS(setCommentText)('');
      runOnJS(setActivePostId)(null);
      runOnJS(setIsExpanded)(false);
    });
  }, []);

  const toggleExpand = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    sheetHeight.value = withSpring(
      newExpanded ? MAX_SHEET_HEIGHT : MID_SHEET_HEIGHT,
      { damping: 20 }
    );
  }, [isExpanded]);

  const submitComment = async () => {
    if (!activePostId || !commentText.trim()) return;
    const result = await addComment(activePostId, commentText.trim());
    if (result.success) {
      setCommentText('');
    }
  };

  // Handle options press - DEFINE BEFORE renderPost
  const handleOptionsPress = useCallback((post) => {
    setSelectedPost(post);
    setShowOptions(true);
  }, []);

  // Handle delete post
  const handleDeletePost = useCallback(async (postId) => {
    const result = await deletePost(postId);
    if (!result.success) {
      Alert.alert('Error', result.message || 'Failed to delete post');
    }
  }, [deletePost]);

  // Handle report post
  const handleReportPost = useCallback(async (postId, reason) => {
    console.log('Report post:', postId, 'reason:', reason);
  }, []);

  // Handle edit post
  const handleEditPost = useCallback((post) => {
    console.log('Edit post:', post.id);
    Alert.alert('Coming Soon', 'Post editing will be available soon!');
  }, []);

  const onSheetDrag = useCallback((translationY) => {
    if (translationY > 150) {
      closeComments();
    } else if (translationY < -100) {
      setIsExpanded(true);
      sheetHeight.value = withSpring(MAX_SHEET_HEIGHT, { damping: 20 });
    } else if (translationY > 50) {
      setIsExpanded(false);
      sheetHeight.value = withSpring(MIN_SHEET_HEIGHT, { damping: 20 });
    } else {
      setIsExpanded(false);
      sheetHeight.value = withSpring(MID_SHEET_HEIGHT, { damping: 20 });
    }
  }, [closeComments]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderRelease: (_, gestureState) => {
        onSheetDrag(gestureState.dy);
      },
    })
  ).current;

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  // Render post item - NOW handleOptionsPress is defined above
  const renderPost = useCallback(({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
      <PostCard
        post={item}
        onLike={toggleLike}
        onComment={() => openComments(item.id)}
        onBookmark={toggleBookmark}
        onShare={handleShare}
        onUserPress={() => onUserPress?.(item.user_id)}
        onOptionsPress={() => handleOptionsPress(item)}
      />
    </Animated.View>
  ), [toggleLike, toggleBookmark, handleShare, onUserPress, openComments, handleOptionsPress]);

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

  const renderHeader = useCallback(() => (
    <>
      {ListHeaderComponent && <ListHeaderComponent />}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}
    </>
  ), [ListHeaderComponent, error]);

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
      <Modal visible={showComments} transparent animationType="none" onRequestClose={closeComments}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeComments} />
          <Animated.View style={[styles.commentsSheet, sheetAnimatedStyle, { paddingBottom: insets.bottom }]}>
            <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
              <View style={styles.headerActions}>
                <Pressable onPress={toggleExpand} style={styles.expandButton}>
                  <Ionicons name={isExpanded ? "chevron-down" : "chevron-up"} size={24} color={theme.colors.textMuted} />
                </Pressable>
                <Pressable onPress={closeComments} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                </Pressable>
              </View>
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.commentsContainer}>
              {commentsLoading[activePostId] ? (
                <View style={styles.commentsLoading}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
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
                  contentContainerStyle={styles.commentsList}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                />
              )}
              <View style={styles.commentInputContainer}>
                <View style={styles.commentInputWrapper}>
                  <View style={styles.inputAvatar}>
                    <Ionicons name="person" size={16} color="white" />
                  </View>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor={theme.colors.grayMedium}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    maxLength={500}
                  />
                  <Pressable 
                    style={[styles.commentSend, !commentText.trim() && styles.commentSendDisabled]} 
                    onPress={submitComment}
                    disabled={!commentText.trim()}
                  >
                    <Ionicons name="send" size={18} color={commentText.trim() ? theme.colors.primary : theme.colors.grayMedium} />
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>

      {/* Post Options Modal */}
      <PostOptionsModal
        visible={showOptions}
        onClose={() => {
          setShowOptions(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
        isOwnPost={selectedPost?.user_id === currentUserId}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        onReport={handleReportPost}
        onShare={handleShare}
        onBookmark={toggleBookmark}
        isBookmarked={selectedPost?.is_bookmarked}
      />
    </>
  );
};

const styles = StyleSheet.create({
  listContent: { paddingBottom: hp(10), flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: hp(10), paddingHorizontal: wp(10) },
  emptyEmoji: { fontSize: 60, marginBottom: theme.spacing.md },
  emptyTitle: { fontSize: hp(2.4), fontWeight: theme.fonts.bold, color: theme.colors.textDark, marginBottom: theme.spacing.sm },
  emptySubtitle: { fontSize: hp(1.6), color: theme.colors.textMuted, textAlign: 'center', lineHeight: hp(2.4) },
  errorContainer: { padding: theme.spacing.md, marginHorizontal: wp(4), marginVertical: hp(1), backgroundColor: theme.colors.roseLight, borderRadius: theme.radius.lg },
  errorText: { color: theme.colors.rose, fontSize: hp(1.5), textAlign: 'center' },
  footerLoader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xl, gap: theme.spacing.sm },
  loadingMoreText: { fontSize: hp(1.5), color: theme.colors.textMuted },
  endOfFeed: { alignItems: 'center', paddingVertical: theme.spacing.xl, paddingHorizontal: wp(10) },
  endOfFeedText: { fontSize: hp(1.6), color: theme.colors.textMuted, fontWeight: theme.fonts.medium },
  endOfFeedSubtext: { fontSize: hp(1.4), color: theme.colors.grayMedium, marginTop: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  commentsSheet: { backgroundColor: theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  dragHandleContainer: { alignItems: 'center', paddingVertical: 12 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.grayMedium, opacity: 0.4 },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.grayLight },
  commentsTitle: { fontSize: hp(2), fontWeight: theme.fonts.bold, color: theme.colors.textDark },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expandButton: { padding: 8, borderRadius: 20 },
  closeButton: { padding: 8, borderRadius: 20 },
  commentsContainer: { flex: 1 },
  commentsLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md },
  loadingText: { color: theme.colors.textMuted, fontSize: hp(1.6) },
  commentsList: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md, flexGrow: 1 },
  noCommentsContainer: { alignItems: 'center', paddingVertical: hp(8) },
  noComments: { color: theme.colors.textDark, marginTop: theme.spacing.md, fontSize: hp(1.8), fontWeight: theme.fonts.semibold },
  noCommentsSubtext: { color: theme.colors.textMuted, fontSize: hp(1.4), marginTop: 4 },
  commentInputContainer: { backgroundColor: theme.colors.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.grayLight, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  commentInputWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm },
  inputAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  commentInput: { flex: 1, backgroundColor: theme.colors.backgroundSecondary, borderRadius: 20, paddingHorizontal: theme.spacing.md, paddingTop: 10, paddingBottom: 10, fontSize: hp(1.5), color: theme.colors.text, maxHeight: 100, minHeight: 40 },
  commentSend: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  commentSendDisabled: { opacity: 0.5 },
});

export default PostFeed;

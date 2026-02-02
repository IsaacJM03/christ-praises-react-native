import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  Share,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  PanResponder,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { postService } from '../../lib/postService';
import PostCard from '../../components/PostCard';
import { PostSkeletonList } from '../../components/PostSkeleton';
import CommentItem from '../../components/CommentItem';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;
const MID_SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

const LikedScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [repliesByComment, setRepliesByComment] = useState({});
  const [repliesLoading, setRepliesLoading] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Sheet animation
  const sheetHeight = useSharedValue(MID_SHEET_HEIGHT);
  const sheetTranslateY = useSharedValue(SCREEN_HEIGHT);

  const fetchLikedPosts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const result = await postService.getLikedPosts(1, 50);
      if (result.success) {
        setPosts(result.data || []);
      } else {
        setError(result.message || 'Failed to load liked posts');
      }
    } catch (err) {
      setError('Failed to load liked posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLikedPosts();
  }, []);

  const handleRefresh = () => fetchLikedPosts(true);

  const handleToggleLike = useCallback(async (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    await postService.toggleLike(postId);
  }, []);

  const handleToggleBookmark = useCallback(async (postId) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, is_bookmarked: !post.is_bookmarked };
      }
      return post;
    }));
    await postService.toggleBookmark(postId);
  }, []);

  const handleShare = useCallback(async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      await Share.share({
        message: `${post.content}\n\n— ${post.user_name || 'Christ Praises'}`,
      });
    } catch (err) {}
  }, [posts]);

  // Comments functionality
  const fetchComments = useCallback(async (postId) => {
    try {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }));
      const result = await postService.getComments(postId, 1, 20);
      if (result.success) {
        const normalized = (result.data || []).map(c => ({
          ...c,
          is_liked: Boolean(c.is_liked),
          likes_count: parseInt(c.likes_count) || 0,
          replies_count: parseInt(c.replies_count) || 0,
        }));
        setCommentsByPost(prev => ({ ...prev, [postId]: normalized }));
      }
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  }, []);

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
    sheetHeight.value = withSpring(newExpanded ? MAX_SHEET_HEIGHT : MID_SHEET_HEIGHT, { damping: 20 });
  }, [isExpanded]);

  const submitComment = async () => {
    if (!activePostId || !commentText.trim()) return;
    const result = await postService.addComment(activePostId, commentText.trim());
    if (result.success && result.data) {
      setCommentsByPost(prev => ({
        ...prev,
        [activePostId]: [result.data, ...(prev[activePostId] || [])],
      }));
      setPosts(prev => prev.map(p => 
        p.id === activePostId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
      ));
      setCommentText('');
    }
  };

  const toggleCommentLike = useCallback(async (postId, commentId) => {
    const isTopLevel = (commentsByPost[postId] || []).some(c => c.id === commentId);
    if (isTopLevel) {
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).map(c => {
          if (c.id === commentId) {
            const newIsLiked = !c.is_liked;
            return { ...c, is_liked: newIsLiked, likes_count: newIsLiked ? (c.likes_count || 0) + 1 : Math.max(0, (c.likes_count || 0) - 1) };
          }
          return c;
        })
      }));
    } else {
      setRepliesByComment(prev => {
        const updated = { ...prev };
        for (const pId in updated) {
          updated[pId] = (updated[pId] || []).map(r => {
            if (r.id === commentId) {
              const newIsLiked = !r.is_liked;
              return { ...r, is_liked: newIsLiked, likes_count: newIsLiked ? (r.likes_count || 0) + 1 : Math.max(0, (r.likes_count || 0) - 1) };
            }
            return r;
          });
        }
        return updated;
      });
    }
    await postService.toggleCommentLike(postId, commentId);
  }, [commentsByPost]);

  const fetchReplies = useCallback(async (postId, commentId) => {
    try {
      setRepliesLoading(prev => ({ ...prev, [commentId]: true }));
      const result = await postService.getCommentReplies(postId, commentId);
      if (result.success) {
        const normalized = (result.data || []).map(r => ({
          ...r,
          is_liked: Boolean(r.is_liked),
          likes_count: parseInt(r.likes_count) || 0,
          replies_count: parseInt(r.replies_count) || 0,
        }));
        setRepliesByComment(prev => ({ ...prev, [commentId]: normalized }));
      }
    } finally {
      setRepliesLoading(prev => ({ ...prev, [commentId]: false }));
    }
  }, []);

  const addReply = useCallback(async (postId, parentCommentId, content) => {
    const result = await postService.addComment(postId, content, parentCommentId);
    if (result.success && result.data) {
      const normalized = { ...result.data, is_liked: false, likes_count: 0, replies_count: 0 };
      setRepliesByComment(prev => ({
        ...prev,
        [parentCommentId]: [...(prev[parentCommentId] || []), normalized],
      }));
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).map(c => 
          c.id === parentCommentId ? { ...c, replies_count: (c.replies_count || 0) + 1 } : c
        )
      }));
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
      ));
    }
    return result;
  }, []);

  const onSheetDrag = useCallback((translationY) => {
    if (translationY > 150) closeComments();
    else if (translationY < -100) { setIsExpanded(true); sheetHeight.value = withSpring(MAX_SHEET_HEIGHT, { damping: 20 }); }
    else { setIsExpanded(false); sheetHeight.value = withSpring(MID_SHEET_HEIGHT, { damping: 20 }); }
  }, [closeComments]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 10,
      onPanResponderRelease: (_, gs) => onSheetDrag(gs.dy),
    })
  ).current;

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const renderPost = useCallback(({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
      <PostCard
        post={item}
        onLike={handleToggleLike}
        onComment={() => openComments(item.id)}
        onBookmark={handleToggleBookmark}
        onShare={handleShare}
        onUserPress={() => {}}
        onOptionsPress={() => {}}
      />
    </Animated.View>
  ), [handleToggleLike, handleToggleBookmark, handleShare, openComments]);

  const renderEmpty = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={80} color={theme.colors.grayMedium} />
      </View>
      <Text style={styles.emptyTitle}>No liked posts yet</Text>
      <Text style={styles.emptySubtitle}>Posts you like will appear here.</Text>
      <Pressable style={styles.exploreButton} onPress={() => router.push('/(tabs)')}>
        <Ionicons name="compass-outline" size={20} color="white" />
        <Text style={styles.exploreButtonText}>Explore Posts</Text>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Animated.View entering={FadeIn.duration(500)} style={[styles.header, { paddingTop: insets.top + hp(0.5) }]}>
        <Pressable style={styles.backButton} onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Liked Posts</Text>
        <Pressable style={styles.headerButton} onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={24} color={theme.colors.textDark} />
        </Pressable>
      </Animated.View>

      {loading && posts.length === 0 ? (
        <PostSkeletonList count={3} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={theme.colors.grayMedium} />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => fetchLikedPosts()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => `liked-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
          ListEmptyComponent={renderEmpty}
          ListHeaderComponent={posts.length > 0 ? <View style={styles.listHeader}><Text style={styles.likedCount}>{posts.length} posts liked</Text></View> : null}
        />
      )}

      {/* Comments Modal */}
      <Modal visible={showComments} transparent animationType="none" onRequestClose={closeComments}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeComments} />
          <Animated.View style={[styles.commentsSheet, sheetAnimatedStyle, { paddingBottom: insets.bottom }]}>
            <View {...panResponder.panHandlers} style={styles.dragHandleContainer}><View style={styles.dragHandle} /></View>
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
                <View style={styles.commentsLoading}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
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
                  ListEmptyComponent={<View style={styles.noCommentsContainer}><Ionicons name="chatbubble-outline" size={48} color={theme.colors.grayMedium} /><Text style={styles.noComments}>No comments yet</Text></View>}
                  contentContainerStyle={styles.commentsList}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                />
              )}
              <View style={styles.commentInputContainer}>
                <View style={styles.commentInputWrapper}>
                  <View style={styles.inputAvatar}><Ionicons name="person" size={16} color="white" /></View>
                  <TextInput style={styles.commentInput} placeholder="Add a comment..." placeholderTextColor={theme.colors.grayMedium} value={commentText} onChangeText={setCommentText} multiline maxLength={500} />
                  <Pressable style={[styles.commentSend, !commentText.trim() && styles.commentSendDisabled]} onPress={submitComment} disabled={!commentText.trim()}>
                    <Ionicons name="send" size={18} color={commentText.trim() ? theme.colors.primary : theme.colors.grayMedium} />
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default LikedScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(4), paddingBottom: hp(1), backgroundColor: theme.colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.grayLight },
  backButton: { padding: theme.spacing.xs, borderRadius: theme.radius.full, width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: hp(2), fontWeight: theme.fonts.bold, color: theme.colors.textDark },
  headerButton: { padding: theme.spacing.xs, borderRadius: theme.radius.full, backgroundColor: theme.colors.backgroundSecondary, width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: hp(10), flexGrow: 1 },
  listHeader: { paddingHorizontal: wp(4), paddingVertical: theme.spacing.md },
  likedCount: { fontSize: hp(1.6), color: theme.colors.textMuted, fontWeight: theme.fonts.medium },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(10), paddingBottom: hp(10) },
  emptyIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.lg },
  emptyTitle: { fontSize: hp(2.4), fontWeight: theme.fonts.bold, color: theme.colors.textDark, marginBottom: theme.spacing.sm },
  emptySubtitle: { fontSize: hp(1.6), color: theme.colors.textMuted, textAlign: 'center', marginBottom: theme.spacing.xl },
  exploreButton: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderRadius: theme.radius.full },
  exploreButtonText: { color: 'white', fontSize: hp(1.7), fontWeight: theme.fonts.semibold },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(10) },
  errorTitle: { fontSize: hp(2.2), fontWeight: theme.fonts.bold, color: theme.colors.textDark, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
  errorText: { fontSize: hp(1.6), color: theme.colors.textMuted, textAlign: 'center', marginBottom: theme.spacing.lg },
  retryButton: { backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderRadius: theme.radius.lg },
  retryButtonText: { color: 'white', fontSize: hp(1.6), fontWeight: theme.fonts.semibold },
  // Comments modal styles
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
  commentsLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  commentsList: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md, flexGrow: 1 },
  noCommentsContainer: { alignItems: 'center', paddingVertical: hp(8) },
  noComments: { color: theme.colors.textMuted, marginTop: theme.spacing.md, fontSize: hp(1.6) },
  commentInputContainer: { backgroundColor: theme.colors.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.grayLight, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  commentInputWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm },
  inputAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  commentInput: { flex: 1, backgroundColor: theme.colors.backgroundSecondary, borderRadius: 20, paddingHorizontal: theme.spacing.md, paddingTop: 10, paddingBottom: 10, fontSize: hp(1.5), color: theme.colors.text, maxHeight: 100, minHeight: 40 },
  commentSend: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  commentSendDisabled: { opacity: 0.5 },
});

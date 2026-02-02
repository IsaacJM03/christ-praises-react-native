import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { postService } from '../../lib/postService';
import PostCard from '../../components/PostCard';
import { PostSkeletonList } from '../../components/PostSkeleton';

const SavedScreen = () => {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSavedPosts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await postService.getBookmarkedPosts(1, 50);
      
      if (result.success) {
        setPosts(result.data || []);
      } else {
        setError(result.message || 'Failed to load saved posts');
      }
    } catch (err) {
      console.error('Fetch saved posts error:', err);
      setError('Failed to load saved posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handleRefresh = () => fetchSavedPosts(true);

  const handleToggleLike = useCallback(async (postId) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newIsLiked = !post.is_liked;
        return {
          ...post,
          is_liked: newIsLiked,
          likes_count: newIsLiked ? (post.likes_count || 0) + 1 : Math.max(0, (post.likes_count || 0) - 1)
        };
      }
      return post;
    }));
    await postService.toggleLike(postId);
  }, []);

  const handleToggleBookmark = useCallback(async (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
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

  const renderPost = useCallback(({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
      <PostCard
        post={item}
        onLike={handleToggleLike}
        onComment={() => {}}
        onBookmark={handleToggleBookmark}
        onShare={handleShare}
        onUserPress={() => {}}
        onOptionsPress={() => {}}
      />
    </Animated.View>
  ), [handleToggleLike, handleToggleBookmark, handleShare]);

  const renderEmpty = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="bookmark-outline" size={80} color={theme.colors.grayMedium} />
      </View>
      <Text style={styles.emptyTitle}>No saved posts yet</Text>
      <Text style={styles.emptySubtitle}>
        Posts you save will appear here. Tap the bookmark icon on any post to save it.
      </Text>
      <Pressable style={styles.exploreButton} onPress={() => router.push('/(tabs)')}>
        <Ionicons name="compass-outline" size={20} color="white" />
        <Text style={styles.exploreButtonText}>Explore Posts</Text>
      </Pressable>
    </Animated.View>
  );

  const renderHeader = () => posts.length > 0 ? (
    <View style={styles.listHeader}>
      <Text style={styles.savedCount}>{posts.length} {posts.length === 1 ? 'post' : 'posts'} saved</Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Animated.View entering={FadeIn.duration(500)} style={[styles.header, { paddingTop: top + hp(0.5) }]}>
        <Text style={styles.headerTitle}>Saved Posts</Text>
        <Pressable style={styles.headerButton} onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={24} color={theme.colors.textDark} />
        </Pressable>
      </Animated.View>

      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <PostSkeletonList count={3} />
        </View>
      ) : error ? (
        <Animated.View entering={FadeIn.duration(500)} style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={theme.colors.grayMedium} />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => fetchSavedPosts()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => `saved-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
          }
          ListEmptyComponent={renderEmpty}
          ListHeaderComponent={renderHeader}
        />
      )}
    </View>
  );
};

export default SavedScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(4), paddingBottom: hp(1), backgroundColor: theme.colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.grayLight },
  headerTitle: { fontSize: hp(2.4), fontWeight: theme.fonts.bold, color: theme.colors.textDark },
  headerButton: { padding: theme.spacing.xs, borderRadius: theme.radius.full, backgroundColor: theme.colors.backgroundSecondary, width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  loadingContainer: { flex: 1, paddingTop: theme.spacing.md },
  listContent: { paddingBottom: hp(10), flexGrow: 1 },
  listHeader: { paddingHorizontal: wp(4), paddingVertical: theme.spacing.md },
  savedCount: { fontSize: hp(1.6), color: theme.colors.textMuted, fontWeight: theme.fonts.medium },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(10), paddingBottom: hp(10) },
  emptyIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.lg },
  emptyTitle: { fontSize: hp(2.4), fontWeight: theme.fonts.bold, color: theme.colors.textDark, marginBottom: theme.spacing.sm },
  emptySubtitle: { fontSize: hp(1.6), color: theme.colors.textMuted, textAlign: 'center', lineHeight: hp(2.4), marginBottom: theme.spacing.xl },
  exploreButton: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderRadius: theme.radius.full },
  exploreButtonText: { color: 'white', fontSize: hp(1.7), fontWeight: theme.fonts.semibold },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(10) },
  errorTitle: { fontSize: hp(2.2), fontWeight: theme.fonts.bold, color: theme.colors.textDark, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
  errorText: { fontSize: hp(1.6), color: theme.colors.textMuted, textAlign: 'center', marginBottom: theme.spacing.lg },
  retryButton: { backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md, borderRadius: theme.radius.lg },
  retryButtonText: { color: 'white', fontSize: hp(1.6), fontWeight: theme.fonts.semibold },
});

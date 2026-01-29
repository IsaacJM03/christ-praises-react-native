import React, { useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { usePosts } from '../contexts/PostContext';
import PostCard from './PostCard';
import { PostSkeletonList } from './PostSkeleton';

const PostFeed = ({ 
  onCommentPress, 
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
  } = usePosts();

  const isFirstLoad = useRef(true);

  // Fetch posts on mount
  useEffect(() => {
    if (isFirstLoad.current) {
      fetchFeed(true);
      isFirstLoad.current = false;
    }
  }, []);

  const handleShare = useCallback((postId) => {
    console.log('Share post:', postId);
  }, []);

  const handleEndReached = useCallback(() => {
    if (!loading && pagination.hasMore) {
      loadMore();
    }
  }, [loading, pagination.hasMore, loadMore]);

  const renderPost = useCallback(({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
      <PostCard
        post={item}
        onLike={toggleLike}
        onComment={onCommentPress}
        onBookmark={toggleBookmark}
        onShare={handleShare}
        onUserPress={() => onUserPress?.(item.user_id)}
        onOptionsPress={() => onOptionsPress?.(item)}
      />
    </Animated.View>
  ), [toggleLike, toggleBookmark, handleShare, onCommentPress, onUserPress, onOptionsPress]);

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
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      getItemLayout={null} // Can add if all items are same height
    />
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
});

export default PostFeed;

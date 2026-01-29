import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { usePosts } from '../contexts/PostContext';
import PostCard from './PostCard';

const PostFeed = ({ onCommentPress, onUserPress, onOptionsPress, ListHeaderComponent }) => {
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

  // Fetch posts on mount
  useEffect(() => {
    fetchFeed(true);
  }, []);

  const handleShare = (postId) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId);
  };

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onLike={toggleLike}
      onComment={onCommentPress}
      onBookmark={toggleBookmark}
      onShare={handleShare}
      onUserPress={() => onUserPress?.(item.user_id)}
      onOptionsPress={() => onOptionsPress?.(item)}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptySubtitle}>
          Be the first to share something inspiring!
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || posts.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderHeader = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    return null;
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id.toString()}
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
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: hp(1),
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: hp(1.6),
    color: theme.colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
    paddingHorizontal: wp(10),
  },
  emptyTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: hp(1.6),
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  errorContainer: {
    padding: theme.spacing.md,
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    backgroundColor: theme.colors.roseLight,
    borderRadius: theme.radius.md,
  },
  errorText: {
    color: theme.colors.rose,
    fontSize: hp(1.5),
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: theme.spacing.lg,
  },
});

export default PostFeed;

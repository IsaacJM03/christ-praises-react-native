import React, { createContext, useContext, useState, useCallback } from 'react';
import { postService } from '../lib/postService';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    hasMore: true
  });

  // Fetch feed posts
  const fetchFeed = useCallback(async (refresh = false) => {
    if (loading && !refresh) return;

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const page = refresh ? 1 : pagination.page;
      const result = await postService.getFeed(page);

      if (result.success) {
        if (refresh || page === 1) {
          setPosts(result.data);
        } else {
          setPosts(prev => [...prev, ...result.data]);
        }
        setPagination({
          page: result.pagination.page + 1,
          hasMore: result.pagination.hasMore
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, pagination.page]);

  // Load more posts
  const loadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchFeed(false);
    }
  }, [loading, pagination.hasMore, fetchFeed]);

  // Refresh feed
  const refresh = useCallback(() => {
    setPagination({ page: 1, hasMore: true });
    fetchFeed(true);
  }, [fetchFeed]);

  // Create post
  const createPost = useCallback(async (content, imageUrl) => {
    try {
      const result = await postService.createPost(content, imageUrl);
      if (result.success) {
        // Add new post to top of feed
        setPosts(prev => [result.data, ...prev]);
      }
      return result;
    } catch (err) {
      return { success: false, message: 'Failed to create post' };
    }
  }, []);

  // Delete post
  const deletePost = useCallback(async (postId) => {
    try {
      const result = await postService.deletePost(postId);
      if (result.success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
      return result;
    } catch (err) {
      return { success: false, message: 'Failed to delete post' };
    }
  }, []);

  // Toggle like
  const toggleLike = useCallback(async (postId) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: !post.is_liked,
            likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
          };
        }
        return post;
      }));

      const result = await postService.toggleLike(postId);
      
      if (!result.success) {
        // Revert on failure
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              is_liked: !post.is_liked,
              likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
            };
          }
          return post;
        }));
      }
      
      return result;
    } catch (err) {
      return { success: false, message: 'Failed to toggle like' };
    }
  }, []);

  // Toggle bookmark
  const toggleBookmark = useCallback(async (postId) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, is_bookmarked: !post.is_bookmarked };
        }
        return post;
      }));

      const result = await postService.toggleBookmark(postId);
      
      if (!result.success) {
        // Revert on failure
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return { ...post, is_bookmarked: !post.is_bookmarked };
          }
          return post;
        }));
      }
      
      return result;
    } catch (err) {
      return { success: false, message: 'Failed to toggle bookmark' };
    }
  }, []);

  const value = {
    posts,
    loading,
    refreshing,
    error,
    pagination,
    fetchFeed,
    loadMore,
    refresh,
    createPost,
    deletePost,
    toggleLike,
    toggleBookmark
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

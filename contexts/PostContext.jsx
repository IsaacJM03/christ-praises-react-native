import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
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
  
  // Prevent duplicate fetches
  const isFetching = useRef(false);

  // Fetch feed posts
  const fetchFeed = useCallback(async (refresh = false) => {
    // Prevent duplicate requests
    if (isFetching.current && !refresh) return;
    
    isFetching.current = true;

    try {
      if (refresh) {
        setRefreshing(true);
        setError(null);
      } else {
        setLoading(true);
      }

      const page = refresh ? 1 : pagination.page;
      const result = await postService.getFeed(page);

      if (result.success) {
        const newPosts = result.data || [];
        
        if (refresh || page === 1) {
          setPosts(newPosts);
        } else {
          // Filter out duplicates
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNewPosts];
          });
        }
        
        setPagination({
          page: (result.pagination?.page || page) + 1,
          hasMore: result.pagination?.hasMore ?? newPosts.length >= 20
        });
      } else {
        setError(result.message || 'Failed to load posts');
      }
    } catch (err) {
      console.error('Fetch feed error:', err);
      setError('Failed to fetch posts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetching.current = false;
    }
  }, [pagination.page]);

  // Load more posts (for infinite scroll)
  const loadMore = useCallback(() => {
    if (!loading && !isFetching.current && pagination.hasMore) {
      fetchFeed(false);
    }
  }, [loading, pagination.hasMore, fetchFeed]);

  // Refresh feed (pull to refresh)
  const refresh = useCallback(() => {
    setPagination({ page: 1, hasMore: true });
    fetchFeed(true);
  }, []);

  // Create post
  const createPost = useCallback(async (content, imageUrl) => {
    try {
      const result = await postService.createPost(content, imageUrl);
      if (result.success && result.data) {
        // Add new post to top of feed
        setPosts(prev => [result.data, ...prev]);
      }
      return result;
    } catch (err) {
      console.error('Create post error:', err);
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

  // Toggle like with optimistic update
  const toggleLike = useCallback(async (postId) => {
    // Optimistic update
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

    try {
      const result = await postService.toggleLike(postId);
      
      if (!result.success) {
        // Revert on failure
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const revertIsLiked = !post.is_liked;
            return {
              ...post,
              is_liked: revertIsLiked,
              likes_count: revertIsLiked ? (post.likes_count || 0) + 1 : Math.max(0, (post.likes_count || 0) - 1)
            };
          }
          return post;
        }));
      }
      
      return result;
    } catch (err) {
      // Revert on error
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const revertIsLiked = !post.is_liked;
          return {
            ...post,
            is_liked: revertIsLiked,
            likes_count: revertIsLiked ? (post.likes_count || 0) + 1 : Math.max(0, (post.likes_count || 0) - 1)
          };
        }
        return post;
      }));
      return { success: false, message: 'Failed to toggle like' };
    }
  }, []);

  // Toggle bookmark with optimistic update
  const toggleBookmark = useCallback(async (postId) => {
    // Optimistic update
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, is_bookmarked: !post.is_bookmarked };
      }
      return post;
    }));

    try {
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
      // Revert on error
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, is_bookmarked: !post.is_bookmarked };
        }
        return post;
      }));
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

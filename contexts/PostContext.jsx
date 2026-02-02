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
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [repliesByComment, setRepliesByComment] = useState({});
  const [repliesLoading, setRepliesLoading] = useState({});

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

  // Fetch comments for a post
  const fetchComments = useCallback(async (postId, page = 1) => {
    try {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }));
      console.log('Fetching comments for post:', postId);
      
      const result = await postService.getComments(postId, page, 20);
      
      console.log('Comments result:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        // Normalize the data - MySQL returns 0/1 for booleans
        const normalizedComments = (result.data || []).map(comment => ({
          ...comment,
          is_liked: Boolean(comment.is_liked),
          likes_count: parseInt(comment.likes_count) || 0,
          replies_count: parseInt(comment.replies_count) || 0,
        }));
        
        console.log('Normalized comments:', normalizedComments.length);
        
        setCommentsByPost(prev => ({
          ...prev,
          [postId]: normalizedComments,
        }));
      } else {
        console.log('Failed to fetch comments:', result.message);
      }
      return result;
    } catch (err) {
      console.error('Fetch comments error:', err);
      return { success: false, message: 'Failed to fetch comments' };
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  }, []);

  // Add a comment to a post
  const addComment = useCallback(async (postId, content) => {
    try {
      const result = await postService.addComment(postId, content);
      if (result.success && result.data) {
        setCommentsByPost(prev => ({
          ...prev,
          [postId]: [result.data, ...(prev[postId] || [])],
        }));
        // increment comment count locally
        setPosts(prev => prev.map(p => (
          p.id === postId
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        )));
      }
      return result;
    } catch (err) {
      return { success: false, message: 'Failed to add comment' };
    }
  }, []);

  // Toggle like on a comment (works for both top-level and nested)
  const toggleCommentLike = useCallback(async (postId, commentId) => {
    // Check if it's a top-level comment
    const isTopLevel = (commentsByPost[postId] || []).some(c => c.id === commentId);
    
    if (isTopLevel) {
      // Optimistic update for top-level comment
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).map(comment => {
          if (comment.id === commentId) {
            const newIsLiked = !comment.is_liked;
            return {
              ...comment,
              is_liked: newIsLiked,
              likes_count: newIsLiked ? (comment.likes_count || 0) + 1 : Math.max(0, (comment.likes_count || 0) - 1)
            };
          }
          return comment;
        })
      }));
    } else {
      // It's a nested reply - update in repliesByComment
      setRepliesByComment(prev => {
        const updated = { ...prev };
        for (const parentId in updated) {
          updated[parentId] = (updated[parentId] || []).map(reply => {
            if (reply.id === commentId) {
              const newIsLiked = !reply.is_liked;
              return {
                ...reply,
                is_liked: newIsLiked,
                likes_count: newIsLiked ? (reply.likes_count || 0) + 1 : Math.max(0, (reply.likes_count || 0) - 1)
              };
            }
            return reply;
          });
        }
        return updated;
      });
    }

    try {
      const result = await postService.toggleCommentLike(postId, commentId);
      if (!result.success) {
        // Revert on failure
        if (isTopLevel) {
          setCommentsByPost(prev => ({
            ...prev,
            [postId]: (prev[postId] || []).map(comment => {
              if (comment.id === commentId) {
                const revertIsLiked = !comment.is_liked;
                return {
                  ...comment,
                  is_liked: revertIsLiked,
                  likes_count: revertIsLiked ? (comment.likes_count || 0) + 1 : Math.max(0, (comment.likes_count || 0) - 1)
                };
              }
              return comment;
            })
          }));
        } else {
          setRepliesByComment(prev => {
            const updated = { ...prev };
            for (const parentId in updated) {
              updated[parentId] = (updated[parentId] || []).map(reply => {
                if (reply.id === commentId) {
                  const revertIsLiked = !reply.is_liked;
                  return {
                    ...reply,
                    is_liked: revertIsLiked,
                    likes_count: revertIsLiked ? (reply.likes_count || 0) + 1 : Math.max(0, (reply.likes_count || 0) - 1)
                  };
                }
                return reply;
              });
            }
            return updated;
          });
        }
      }
      return result;
    } catch (err) {
      return { success: false, message: 'Failed to toggle comment like' };
    }
  }, [commentsByPost]);

  // Fetch replies for a comment (works for any depth)
  const fetchReplies = useCallback(async (postId, commentId) => {
    try {
      setRepliesLoading(prev => ({ ...prev, [commentId]: true }));
      console.log('Fetching replies for comment:', commentId);
      
      const result = await postService.getCommentReplies(postId, commentId);
      console.log('Replies result:', result);
      
      if (result.success) {
        const normalizedReplies = (result.data || []).map(reply => ({
          ...reply,
          is_liked: Boolean(reply.is_liked),
          likes_count: parseInt(reply.likes_count) || 0,
          replies_count: parseInt(reply.replies_count) || 0,
        }));
        
        // Store replies keyed by parent comment ID
        setRepliesByComment(prev => ({
          ...prev,
          [commentId]: normalizedReplies,
        }));
        
        // Update the parent's replies_count in commentsByPost (if top-level)
        setCommentsByPost(prev => {
          const updated = { ...prev };
          for (const pId in updated) {
            updated[pId] = (updated[pId] || []).map(comment => 
              comment.id === commentId 
                ? { ...comment, replies_count: normalizedReplies.length }
                : comment
            );
          }
          return updated;
        });
        
        // Also update in repliesByComment (if it's a nested reply)
        setRepliesByComment(prev => {
          const updated = { ...prev };
          for (const pId in updated) {
            if (pId !== String(commentId)) { // Don't modify the one we just added to
              updated[pId] = (updated[pId] || []).map(reply => 
                reply.id === commentId
                  ? { ...reply, replies_count: (reply.replies_count || 0) + 1 }
                  : reply
              );
            }
          }
          return updated;
        });
        
        // Increment total comment count on the post
        setPosts(prev => prev.map(p => (
          p.id === postId
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        )));
      }
      return result;
    } catch (err) {
      console.error('Fetch replies error:', err);
      return { success: false, message: 'Failed to fetch replies' };
    } finally {
      setRepliesLoading(prev => ({ ...prev, [commentId]: false }));
    }
  }, []);

  // Add reply to a comment (works for any depth)
  const addReply = useCallback(async (postId, parentCommentId, content) => {
    try {
      console.log('Adding reply to comment:', parentCommentId, 'content:', content);
      const result = await postService.addComment(postId, content, parentCommentId);
      console.log('Add reply result:', result);
      
      if (result.success && result.data) {
        const normalizedReply = {
          ...result.data,
          is_liked: false,
          likes_count: 0,
          replies_count: 0,
        };
        
        // Add to replies for this parent
        setRepliesByComment(prev => ({
          ...prev,
          [parentCommentId]: [...(prev[parentCommentId] || []), normalizedReply],
        }));
        
        // Update reply count on parent in commentsByPost (if top-level)
        setCommentsByPost(prev => {
          const updated = { ...prev };
          for (const pId in updated) {
            updated[pId] = (updated[pId] || []).map(comment => 
              comment.id === parentCommentId 
                ? { ...comment, replies_count: (comment.replies_count || 0) + 1 }
                : comment
            );
          }
          return updated;
        });
        
        // Update reply count on parent in repliesByComment (if nested)
        setRepliesByComment(prev => {
          const updated = { ...prev };
          for (const pId in updated) {
            if (pId !== String(parentCommentId)) { // Don't modify the one we just added to
              updated[pId] = (updated[pId] || []).map(reply => 
                reply.id === parentCommentId
                  ? { ...reply, replies_count: (reply.replies_count || 0) + 1 }
                  : reply
              );
            }
          }
          return updated;
        });
        
        // Increment total comment count on the post
        setPosts(prev => prev.map(p => (
          p.id === postId
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        )));
      }
      return result;
    } catch (err) {
      console.error('Add reply error:', err);
      return { success: false, message: 'Failed to add reply' };
    }
  }, []);

  // Alias for backwards compatibility
  const toggleReplyLike = toggleCommentLike;

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

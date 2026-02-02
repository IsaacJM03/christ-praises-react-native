import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const postService = {
  // Create a new post
  async createPost(content, imageUrl = null, visibility = 'public') {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content, image_url: imageUrl, visibility })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Create post error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Get feed posts
  async getFeed(page = 1, limit = 20) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/posts/feed?page=${page}&limit=${limit}`,
        { headers }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get feed error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Get single post
  async getPost(postId) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, { headers });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get post error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Get user's posts
  async getUserPosts(userId, page = 1, limit = 20) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/posts/user/${userId}?page=${page}&limit=${limit}`,
        { headers }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get user posts error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Delete post
  async deletePost(postId) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete post error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Toggle like
  async toggleLike(postId) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Toggle like error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Toggle bookmark
  async toggleBookmark(postId) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/bookmark`, {
        method: 'POST',
        headers
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Get comments
  async getComments(postId, page = 1, limit = 20) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/posts/${postId}/comments?page=${page}&limit=${limit}`,
        { headers }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get comments error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Add comment
  async addComment(postId, content, parentId = null) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content, parent_id: parentId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Add comment error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Delete comment
  async deleteComment(postId, commentId) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
        { method: 'DELETE', headers }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete comment error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Like/unlike a comment
  async toggleCommentLike(postId, commentId) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/like`, {
        method: 'POST',
        headers
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Toggle comment like error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Get replies to a comment
  async getCommentReplies(postId, commentId, page = 1, limit = 10) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(
        `${API_BASE_URL}/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`,
        { headers }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get comment replies error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Report a post
  async reportPost(postId, reason) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/report`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Report post error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Update a post
  async updatePost(postId, content) {
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Update post error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Get bookmarked posts
  async getBookmarkedPosts(page = 1, limit = 20) {
    try {
      const headers = await getAuthHeader();
      const url = `${API_BASE_URL}/posts/bookmarked?page=${page}&limit=${limit}`;
      console.log('Fetching bookmarked posts from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      const data = await response.json();
      console.log('Bookmarked posts response:', data);
      return data;
    } catch (error) {
      console.error('Get bookmarked posts error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Get liked posts
  async getLikedPosts(page = 1, limit = 20) {
    try {
      const headers = await getAuthHeader();
      const url = `${API_BASE_URL}/posts/liked?page=${page}&limit=${limit}`;
      console.log('Fetching liked posts from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      const data = await response.json();
      console.log('Liked posts response:', data);
      return data;
    } catch (error) {
      console.error('Get liked posts error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },
};

const db = require('../config/database');

// Helper to validate and sanitize integer IDs
const sanitizeId = (id) => {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed) || parsed <= 0) return null;
  return parsed;
};

// Helper to sanitize pagination params
const sanitizePagination = (page, limit) => ({
  page: Math.max(1, parseInt(page, 10) || 1),
  limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)) // Cap at 100
});

// Allowed visibility values
const ALLOWED_VISIBILITY = ['public', 'followers', 'private'];

const postController = {
  // Create a new post
  async createPost(req, res) {
    try {
      const { content, image_url, visibility = 'public' } = req.body;
      const user_id = sanitizeId(req.user.id);

      if (!user_id) {
        return res.status(401).json({ success: false, message: 'Invalid user' });
      }

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Post content is required' });
      }

      const trimmedContent = content.trim();
      if (trimmedContent.length > 280) {
        return res.status(400).json({ success: false, message: 'Post content exceeds 280 characters' });
      }

      // Validate visibility
      const safeVisibility = ALLOWED_VISIBILITY.includes(visibility) ? visibility : 'public';

      // Validate image_url if provided (basic URL validation)
      let safeImageUrl = null;
      if (image_url && typeof image_url === 'string') {
        try {
          new URL(image_url);
          safeImageUrl = image_url.substring(0, 500); // Limit length
        } catch {
          // Invalid URL, ignore
        }
      }

      const [result] = await db.execute(
        'INSERT INTO posts (user_id, content, image_url, visibility) VALUES (?, ?, ?, ?)',
        [user_id, trimmedContent, safeImageUrl, safeVisibility]
      );

      const [posts] = await db.execute(
        `SELECT p.*, u.name as user_name, u.image as user_image,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id AND deleted_at IS NULL) as comments_count,
                (SELECT COUNT(*) > 0 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
                (SELECT COUNT(*) > 0 FROM post_bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: posts[0]
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ success: false, message: 'Failed to create post' });
    }
  },

  // Get feed posts (paginated)
  async getFeed(req, res) {
    try {
      const user_id = sanitizeId(req.user.id);
      if (!user_id) {
        return res.status(401).json({ success: false, message: 'Invalid user' });
      }

      const { page, limit } = sanitizePagination(req.query.page, req.query.limit);
      const offset = (page - 1) * limit;

      const [posts] = await db.execute(
        `SELECT p.*, u.name as user_name, u.image as user_image,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id AND deleted_at IS NULL) as comments_count,
                (SELECT COUNT(*) > 0 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
                (SELECT COUNT(*) > 0 FROM post_bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.deleted_at IS NULL AND p.visibility = 'public'
         ORDER BY p.is_pinned DESC, p.created_at DESC
         LIMIT ? OFFSET ?`,
        [user_id, user_id, limit, offset]
      );

      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM posts WHERE deleted_at IS NULL AND visibility = "public"'
      );

      const total = countResult[0].total;
      const hasMore = offset + posts.length < total;

      res.json({
        success: true,
        data: posts,
        pagination: {
          page,
          limit,
          total,
          hasMore
        }
      });
    } catch (error) {
      console.error('Get feed error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch feed' });
    }
  },

  // Get single post
  async getPost(req, res) {
    try {
      const id = sanitizeId(req.params.id);
      const user_id = sanitizeId(req.user.id);

      if (!id || !user_id) {
        return res.status(400).json({ success: false, message: 'Invalid parameters' });
      }

      const [posts] = await db.execute(
        `SELECT p.*, u.name as user_name, u.image as user_image,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id AND deleted_at IS NULL) as comments_count,
                (SELECT COUNT(*) > 0 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
                (SELECT COUNT(*) > 0 FROM post_bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ? AND p.deleted_at IS NULL`,
        [user_id, user_id, id]
      );

      if (posts.length === 0) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      res.json({ success: true, data: posts[0] });
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch post' });
    }
  },

  // Get user's posts
  async getUserPosts(req, res) {
    try {
      const userId = sanitizeId(req.params.userId);
      const currentUserId = sanitizeId(req.user.id);
      
      if (!userId || !currentUserId) {
        return res.status(400).json({ success: false, message: 'Invalid parameters' });
      }

      const { page, limit } = sanitizePagination(req.query.page, req.query.limit);
      const offset = (page - 1) * limit;

      const [posts] = await db.execute(
        `SELECT p.*, u.name as user_name, u.image as user_image,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id AND deleted_at IS NULL) as comments_count,
                (SELECT COUNT(*) > 0 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
                (SELECT COUNT(*) > 0 FROM post_bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = ? AND p.deleted_at IS NULL
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        [currentUserId, currentUserId, userId, limit, offset]
      );

      res.json({ success: true, data: posts });
    } catch (error) {
      console.error('Get user posts error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user posts' });
    }
  },

  // Delete post
  async deletePost(req, res) {
    try {
      const id = sanitizeId(req.params.id);
      const user_id = sanitizeId(req.user.id);

      if (!id || !user_id) {
        return res.status(400).json({ success: false, message: 'Invalid parameters' });
      }

      const [posts] = await db.execute(
        'SELECT * FROM posts WHERE id = ? AND user_id = ?',
        [id, user_id]
      );

      if (posts.length === 0) {
        return res.status(404).json({ success: false, message: 'Post not found or unauthorized' });
      }

      await db.execute(
        'UPDATE posts SET deleted_at = NOW() WHERE id = ?',
        [id]
      );

      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
  },

  // Like/Unlike post
  async toggleLike(req, res) {
    try {
      const id = sanitizeId(req.params.id);
      const user_id = sanitizeId(req.user.id);

      if (!id || !user_id) {
        return res.status(400).json({ success: false, message: 'Invalid parameters' });
      }

      const [existing] = await db.execute(
        'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?',
        [id, user_id]
      );

      let isLiked;
      if (existing.length > 0) {
        await db.execute(
          'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
          [id, user_id]
        );
        isLiked = false;
      } else {
        await db.execute(
          'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
          [id, user_id]
        );
        isLiked = true;
      }

      const [countResult] = await db.execute(
        'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
        [id]
      );

      res.json({
        success: true,
        data: {
          isLiked,
          likesCount: countResult[0].count
        }
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({ success: false, message: 'Failed to toggle like' });
    }
  },

  // Bookmark/Unbookmark post
  async toggleBookmark(req, res) {
    try {
      const id = sanitizeId(req.params.id);
      const user_id = sanitizeId(req.user.id);

      if (!id || !user_id) {
        return res.status(400).json({ success: false, message: 'Invalid parameters' });
      }

      const [existing] = await db.execute(
        'SELECT * FROM post_bookmarks WHERE post_id = ? AND user_id = ?',
        [id, user_id]
      );

      let isBookmarked;
      if (existing.length > 0) {
        await db.execute(
          'DELETE FROM post_bookmarks WHERE post_id = ? AND user_id = ?',
          [id, user_id]
        );
        isBookmarked = false;
      } else {
        await db.execute(
          'INSERT INTO post_bookmarks (post_id, user_id) VALUES (?, ?)',
          [id, user_id]
        );
        isBookmarked = true;
      }

      res.json({ success: true, data: { isBookmarked } });
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      res.status(500).json({ success: false, message: 'Failed to toggle bookmark' });
    }
  },

  // Get comments for a post
  async getComments(req, res) {
    try {
      const id = sanitizeId(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Invalid post ID' });
      }

      const { page, limit } = sanitizePagination(req.query.page, req.query.limit);
      const offset = (page - 1) * limit;

      const [comments] = await db.execute(
        `SELECT c.*, u.name as user_name, u.image as user_image
         FROM post_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ? AND c.deleted_at IS NULL AND c.parent_id IS NULL
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?`,
        [id, limit, offset]
      );

      res.json({ success: true, data: comments });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
  },

  // Add comment to post
  async addComment(req, res) {
    try {
      const id = sanitizeId(req.params.id);
      const user_id = sanitizeId(req.user.id);
      const parent_id = req.body.parent_id ? sanitizeId(req.body.parent_id) : null;
      const { content } = req.body;

      if (!id || !user_id) {
        return res.status(400).json({ success: false, message: 'Invalid parameters' });
      }

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Comment content is required' });
      }

      const trimmedContent = content.trim().substring(0, 1000); // Limit comment length

      const [result] = await db.execute(
        'INSERT INTO post_comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)',
        [id, user_id, parent_id || null, trimmedContent]
      );

      const [comments] = await db.execute(
        `SELECT c.*, u.name as user_name, u.image as user_image
         FROM post_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comments[0]
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
  },

  // Delete comment
  async deleteComment(req, res) {
    try {
      const id = sanitizeId(req.params.id);
      const commentId = sanitizeId(req.params.commentId);
      const user_id = sanitizeId(req.user.id);

      if (!id || !commentId || !user_id) {
        return res.status(400).json({ success: false, message: 'Invalid parameters' });
      }

      const [comments] = await db.execute(
        'SELECT * FROM post_comments WHERE id = ? AND user_id = ?',
        [commentId, user_id]
      );

      if (comments.length === 0) {
        return res.status(404).json({ success: false, message: 'Comment not found or unauthorized' });
      }

      await db.execute(
        'UPDATE post_comments SET deleted_at = NOW() WHERE id = ?',
        [commentId]
      );

      res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
  }
};

module.exports = postController;

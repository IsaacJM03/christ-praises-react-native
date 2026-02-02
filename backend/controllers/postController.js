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
      const user_id = req.user.id;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Post content is required' });
      }

      const trimmedContent = content.trim();
      if (trimmedContent.length > 280) {
        return res.status(400).json({ success: false, message: 'Post content exceeds 280 characters' });
      }

      const [result] = await db.execute(
        'INSERT INTO posts (user_id, content, image_url, visibility) VALUES (?, ?, ?, ?)',
        [user_id, trimmedContent, image_url || null, visibility]
      );

      const postId = result.insertId;

      const [posts] = await db.execute(
        `SELECT 
          p.id, p.user_id, p.content, p.image_url, p.visibility, p.created_at, p.updated_at,
          u.name as user_name, u.image as user_image,
          0 as likes_count, 0 as comments_count, 0 as is_liked, 0 as is_bookmarked
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`,
        [postId]
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

  // Get feed posts
  async getFeed(req, res) {
    try {
      const user_id = req.user.id;
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;

      const [posts] = await db.query(
        `SELECT 
          p.id, p.user_id, p.content, p.image_url, p.visibility, p.is_pinned, p.created_at, p.updated_at,
          u.name as user_name, u.image as user_image
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.deleted_at IS NULL AND p.visibility = 'public'
         ORDER BY p.is_pinned DESC, p.created_at DESC
         LIMIT ${limit} OFFSET ${offset}`,
        []
      );

      const postsWithCounts = await Promise.all(posts.map(async (post) => {
        const [[likesResult]] = await db.execute(
          'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
          [post.id]
        );
        const [[commentsResult]] = await db.execute(
          'SELECT COUNT(*) as count FROM post_comments WHERE post_id = ? AND deleted_at IS NULL',
          [post.id]
        );
        const [[isLikedResult]] = await db.execute(
          'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ? AND user_id = ?',
          [post.id, user_id]
        );
        const [[isBookmarkedResult]] = await db.execute(
          'SELECT COUNT(*) as count FROM post_bookmarks WHERE post_id = ? AND user_id = ?',
          [post.id, user_id]
        );

        return {
          ...post,
          likes_count: likesResult.count,
          comments_count: commentsResult.count,
          is_liked: isLikedResult.count > 0,
          is_bookmarked: isBookmarkedResult.count > 0
        };
      }));

      const [[countResult]] = await db.execute(
        'SELECT COUNT(*) as total FROM posts WHERE deleted_at IS NULL AND visibility = "public"'
      );

      res.json({
        success: true,
        data: postsWithCounts,
        pagination: {
          page,
          limit,
          total: countResult.total,
          hasMore: offset + posts.length < countResult.total
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
      const { id } = req.params;
      const user_id = req.user.id;

      const [posts] = await db.execute(
        `SELECT p.*, u.name as user_name, u.image as user_image
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ? AND p.deleted_at IS NULL`,
        [id]
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
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const [posts] = await db.execute(
        `SELECT p.*, u.name as user_name, u.image as user_image
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = ? AND p.deleted_at IS NULL
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
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
      const { id } = req.params;
      const user_id = req.user.id;

      const [posts] = await db.execute(
        'SELECT * FROM posts WHERE id = ? AND user_id = ?',
        [id, user_id]
      );

      if (posts.length === 0) {
        return res.status(404).json({ success: false, message: 'Post not found or unauthorized' });
      }

      await db.execute('UPDATE posts SET deleted_at = NOW() WHERE id = ?', [id]);

      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
  },

  // Toggle like
  async toggleLike(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const [existing] = await db.execute(
        'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?',
        [id, user_id]
      );

      let isLiked;
      if (existing.length > 0) {
        await db.execute('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [id, user_id]);
        isLiked = false;
      } else {
        await db.execute('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [id, user_id]);
        isLiked = true;
      }

      const [[countResult]] = await db.execute(
        'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
        [id]
      );

      res.json({
        success: true,
        data: { isLiked, likesCount: countResult.count }
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({ success: false, message: 'Failed to toggle like' });
    }
  },

  // Toggle bookmark
  async toggleBookmark(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const [existing] = await db.execute(
        'SELECT * FROM post_bookmarks WHERE post_id = ? AND user_id = ?',
        [id, user_id]
      );

      let isBookmarked;
      if (existing.length > 0) {
        await db.execute('DELETE FROM post_bookmarks WHERE post_id = ? AND user_id = ?', [id, user_id]);
        isBookmarked = false;
      } else {
        await db.execute('INSERT INTO post_bookmarks (post_id, user_id) VALUES (?, ?)', [id, user_id]);
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
      const { id } = req.params;
      const user_id = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Use string interpolation for LIMIT/OFFSET since mysql2 has issues with parameterized LIMIT
      const [comments] = await db.query(
        `SELECT 
          c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, c.updated_at,
          u.name as user_name, u.image as user_image
         FROM post_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ? 
           AND c.deleted_at IS NULL 
           AND (c.parent_id IS NULL OR c.parent_id = 0)
         ORDER BY c.created_at DESC
         LIMIT ${limit} OFFSET ${offset}`,
        [id]
      );

      // Add counts for each comment
      const commentsWithCounts = await Promise.all(comments.map(async (comment) => {
        let likesCount = 0;
        let isLiked = false;
        let repliesCount = 0;

        try {
          const [[likesResult]] = await db.execute(
            'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
            [comment.id]
          );
          likesCount = likesResult?.count || 0;

          const [[isLikedResult]] = await db.execute(
            'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ? AND user_id = ?',
            [comment.id, user_id]
          );
          isLiked = (isLikedResult?.count || 0) > 0;
        } catch (e) {
          // comment_likes table might not exist
        }

        const [[repliesResult]] = await db.execute(
          'SELECT COUNT(*) as count FROM post_comments WHERE parent_id = ? AND deleted_at IS NULL',
          [comment.id]
        );
        repliesCount = repliesResult?.count || 0;

        return {
          ...comment,
          likes_count: likesCount,
          is_liked: isLiked,
          replies_count: repliesCount
        };
      }));

      res.json({ success: true, data: commentsWithCounts });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
  },

  // Add comment
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content, parent_id } = req.body;
      const user_id = req.user.id;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Comment content is required' });
      }

      const [result] = await db.execute(
        'INSERT INTO post_comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)',
        [id, user_id, parent_id || null, content.trim()]
      );

      const [comments] = await db.execute(
        `SELECT c.*, u.name as user_name, u.image as user_image
         FROM post_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`,
        [result.insertId]
      );

      const commentData = {
        ...comments[0],
        is_liked: false,
        likes_count: 0,
        replies_count: 0
      };

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: commentData
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
  },

  // Delete comment
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const user_id = req.user.id;

      const [comments] = await db.execute(
        'SELECT * FROM post_comments WHERE id = ? AND user_id = ?',
        [commentId, user_id]
      );

      if (comments.length === 0) {
        return res.status(404).json({ success: false, message: 'Comment not found or unauthorized' });
      }

      await db.execute('UPDATE post_comments SET deleted_at = NOW() WHERE id = ?', [commentId]);

      res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
  },

  // Toggle comment like
  async toggleCommentLike(req, res) {
    try {
      const { commentId } = req.params;
      const user_id = req.user.id;

      const [existing] = await db.execute(
        'SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?',
        [commentId, user_id]
      );

      let isLiked;
      if (existing.length > 0) {
        await db.execute('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, user_id]);
        isLiked = false;
      } else {
        await db.execute('INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)', [commentId, user_id]);
        isLiked = true;
      }

      const [[countResult]] = await db.execute(
        'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
        [commentId]
      );

      res.json({
        success: true,
        data: { isLiked, likesCount: countResult.count }
      });
    } catch (error) {
      console.error('Toggle comment like error:', error);
      res.status(500).json({ success: false, message: 'Failed to toggle comment like' });
    }
  },

  // Get comment replies - fix to include replies_count
  async getCommentReplies(req, res) {
    try {
      const { commentId } = req.params;
      const user_id = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const [replies] = await db.query(
        `SELECT c.*, u.name as user_name, u.image as user_image
         FROM post_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.parent_id = ? AND c.deleted_at IS NULL
         ORDER BY c.created_at ASC
         LIMIT ${limit} OFFSET ${offset}`,
        [commentId]
      );

      // Add counts for each reply
      const repliesWithCounts = await Promise.all(replies.map(async (reply) => {
        let likesCount = 0;
        let isLiked = false;
        let repliesCount = 0;

        try {
          const [[likesResult]] = await db.execute(
            'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
            [reply.id]
          );
          likesCount = likesResult?.count || 0;

          const [[isLikedResult]] = await db.execute(
            'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ? AND user_id = ?',
            [reply.id, user_id]
          );
          isLiked = (isLikedResult?.count || 0) > 0;
        } catch (e) {
          // comment_likes table might not exist
        }

        // Count nested replies (replies to this reply)
        const [[nestedRepliesResult]] = await db.execute(
          'SELECT COUNT(*) as count FROM post_comments WHERE parent_id = ? AND deleted_at IS NULL',
          [reply.id]
        );
        repliesCount = nestedRepliesResult?.count || 0;

        return {
          ...reply,
          likes_count: likesCount,
          is_liked: isLiked,
          replies_count: repliesCount
        };
      }));

      console.log(`Returning ${repliesWithCounts.length} replies for comment ${commentId}`);
      res.json({ success: true, data: repliesWithCounts });
    } catch (error) {
      console.error('Get comment replies error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch replies' });
    }
  }
};

module.exports = postController;

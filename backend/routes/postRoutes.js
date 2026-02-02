const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// IMPORTANT: Put specific routes BEFORE parameterized routes
router.get('/bookmarked', postController.getBookmarkedPosts);
router.get('/feed', postController.getFeed);

// Parameterized routes
router.post('/', postController.createPost);
router.get('/:id', postController.getPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

// Post interactions
router.post('/:id/like', postController.toggleLike);
router.post('/:id/bookmark', postController.toggleBookmark);

// Comments
router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', postController.addComment);
router.delete('/:id/comments/:commentId', postController.deleteComment);
router.post('/:id/comments/:commentId/like', postController.toggleCommentLike);
router.get('/:id/comments/:commentId/replies', postController.getCommentReplies);

// Report
router.post('/:id/report', postController.reportPost);

// User posts
router.get('/user/:userId', postController.getUserPosts);

module.exports = router;

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Post CRUD
router.post('/', postController.createPost);
router.get('/feed', postController.getFeed);
router.get('/:id', postController.getPost);
router.delete('/:id', postController.deletePost);

// User posts
router.get('/user/:userId', postController.getUserPosts);

// Interactions
router.post('/:id/like', postController.toggleLike);
router.post('/:id/bookmark', postController.toggleBookmark);

// Comments
router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', postController.addComment);
router.delete('/:id/comments/:commentId', postController.deleteComment);

// Comment interactions
router.post('/:id/comments/:commentId/like', postController.toggleCommentLike);
router.get('/:id/comments/:commentId/replies', postController.getCommentReplies);

module.exports = router;

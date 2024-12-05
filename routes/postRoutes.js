const express = require('express');
const { getAllPosts, getPostById, createPost } = require('../controllers/postController');
const router = express.Router();

router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);
router.post('/posts', createPost);

module.exports = router;

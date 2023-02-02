import express from 'express';

import { getPostsBySearch, getPosts, getPostDetails, createPost, updatePost, deletePost, likePost } from '../controllers/posts.js'

import authenticateUser from '../middleware/authenticateUser.js';
import validateIdParam from '../middleware/validateIdParam.js';
import authorizeUser from '../middleware/authorizeUser.js';

// Router that handles all the requests to the /posts/*

// Create a new router object that behaves like a middleware of modular, mountable router handlers
const router = express.Router();

// Handles GET requests to search the posts and retrieve them
router.get('/search', getPostsBySearch);
// Handles GET requests to search a post by id and retrieve its data
router.get('/:id', getPostDetails);
// Handles GET requests to retrieve all the posts
router.get('/', getPosts);

// Handles POST requests to create a new post
router.post('/', authenticateUser, createPost);

// Handles PATCH requests to update the likes
router.patch('/:id/likePost', authenticateUser, validateIdParam, likePost);
// Handles PATCH request to update the post
router.patch('/:id', authenticateUser, validateIdParam, authorizeUser, updatePost);

// Handles DELETE request to remove the post
router.delete('/:id', authenticateUser, validateIdParam, authorizeUser, deletePost);

export default router;
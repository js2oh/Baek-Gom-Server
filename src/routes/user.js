import express from 'express';

import { signin, signup } from '../controllers/user.js'

// Router that handles all the requests to the /user/*

// Create a new router object that behaves like a middleware of modular, mountable router handlers
const router = express.Router();

// Handles POST requests to sign-in and authenticate the user
router.post('/signin', signin);
// Handles POST requests to sign-up and sign-in as a new user
router.post('/signup', signup);

export default router;
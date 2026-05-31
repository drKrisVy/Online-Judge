import express from 'express';
import { registerUser, loginUser } from '../controller/auth-controller.js';

// Create Express router instance
const router = express.Router();

// Route for new user registration - accepts name, email, password
router.post('/register', registerUser);

// Route for user login - issues secure HTTP-only JWT cookie
router.post('/login', loginUser);

export default router;
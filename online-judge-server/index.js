import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import DBConnection from './database/db.js';
import authRoutes from './routes/auth-routes.js';

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Enable Cross-Origin Resource Sharing (configured to accept secure cookies)
app.use(cors({ origin: true, credentials: true }));

// Parse URL-encoded data with extended syntax
app.use(express.urlencoded({ extended: true }));

// Parse JSON payloads
app.use(express.json());

// Parse cookies from HTTP requests
app.use(cookieParser());

// Use router for authentication routes
app.use('/api/auth', authRoutes);

// Get port from environment variables or use default port 8000
const PORT = process.env.PORT || 8000;

// Connect to MongoDB database
DBConnection();

// Start server and listen on specified port
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
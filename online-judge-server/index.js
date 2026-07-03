import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; 

import DBConnection from './database/db.js';
import problemRoutes from './routes/problem-routes.js';
import authRoutes from './routes/auth-routes.js';
import submissionRoutes from './routes/submission-routes.js';
import aiRoutes from './routes/ai-routes.js';
import profileRoutes from './routes/profile-routes.js';
import leaderboardRoutes from './routes/leaderboard-routes.js';
import './workers/submissionWorker.js'; 

dotenv.config();
const app = express();
const server = http.createServer(app);

// --- CORS CONFIGURATION ---
const allowedOrigins = [
    'http://localhost:3000', 
    'http://13.218.219.24', 
    'http://13.218.219.24:3000',
    'https://online-judge-taupe.vercel.app',
    'https://online-judge.online' // FIXED: Replaced Cloudflare with your actual domain
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true // Crucial for accepting the Vercel cookie
    }
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// --- THE SOCKET GATEKEEPER ---
io.use((socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            console.warn(`Socket blocked: No cookies present [Socket ID: ${socket.id}]`);
            return next(new Error("Socket Access Denied: No cookies present"));
        }

        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            acc[name] = value;
            return acc;
        }, {});

        const token = cookies.token;
        if (!token) {
            console.warn(`Socket blocked: No JWT token found [Socket ID: ${socket.id}]`);
            return next(new Error("Socket Access Denied: No JWT token found"));
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = verified;
        next(); 

    } catch (error) {
        console.error("Socket Auth Error:", error.message);
        return next(new Error("Socket Access Denied: Invalid or expired token"));
    }
});

// --- THE MULTIPLAYER SOCKET LOGIC ---
io.on('connection', (socket) => {
    const userId = socket.user._id || socket.user.id;
    console.log(`🔒 Secure Connection established by User ID: ${userId}`);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`👥 User ${userId} joined room: ${roomId}`);
    });

    socket.on('code-change', ({ roomId, newCode }) => {
        socket.to(roomId).emit('receive-code-change', newCode);
    });

    socket.on('draw', ({ roomId, drawingData }) => {
        socket.to(roomId).emit('receive-draw', drawingData);
    });

    socket.on('clear-canvas', ({ roomId }) => {
        socket.to(roomId).emit('receive-clear-canvas');
    });

    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${userId}`);
    });
});

const PORT = process.env.PORT || 8000;
DBConnection();

server.listen(PORT, () => console.log(`🚀 Server is running on PORT ${PORT}`));
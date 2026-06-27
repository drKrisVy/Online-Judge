import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // NEW: Imported for Socket Auth

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

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// --- THE SOCKET GATEKEEPER ---
io.use((socket, next) => {
    try {
        // 1. Manually extract the cookie string from the socket handshake
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            console.warn(`Socket blocked: No cookies present [Socket ID: ${socket.id}]`);
            return next(new Error("Socket Access Denied: No cookies present"));
        }

        // 2. Parse the cookie string to find the 'token=' value
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

        // 3. Verify the token using your server's secret key
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Attach the user data to this specific socket connection
        socket.user = verified;
        next(); // Let them into the room!

    } catch (error) {
        console.error("Socket Auth Error:", error.message);
        return next(new Error("Socket Access Denied: Invalid or expired token"));
    }
});

// THE MULTIPLAYER SOCKET LOGIC
io.on('connection', (socket) => {
    // You now securely have access to the user making the connection!
    const userId = socket.user._id || socket.user.id;
    console.log(`🔒 Secure Connection established by User ID: ${userId}`);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`👥 User ${userId} joined room: ${roomId}`);
    });

    socket.on('code-change', ({ roomId, newCode }) => {
        socket.to(roomId).emit('receive-code-change', newCode);
    });

    // Listen for brush strokes and broadcast them to the room
    socket.on('draw', ({ roomId, drawingData }) => {
        socket.to(roomId).emit('receive-draw', drawingData);
    });

    // Listen for the clear canvas command and broadcast it
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
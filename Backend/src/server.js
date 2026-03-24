import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Đã import thì dùng luôn thư viện này cho chuẩn
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import { connectDB } from './libs/db.js';
import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/userRoute.js';
import chatRoutes from './routes/chatRoute.js';
import protecttedRoute from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// 1. Cấu hình CORS dùng thư viện (Thay cho đoạn res.header thủ công)
const corsOptions = {
    origin: "http://localhost:5175", // Đã sửa thành 5175 khớp với trình duyệt của bạn
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 2. Cấu hình Socket.io với cùng origin
const io = new Server(server, {
    cors: corsOptions
});

// Socket.io Middleware & Logic
const onlineUsers = new Map();

io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Authentication error'));

    // Lưu ý: Check kỹ chính tả ACCSESS hay ACCESS trong file .env nhé
    jwt.verify(token, process.env.ACCSESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.userId = decoded.userId;
        next();
    });
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    onlineUsers.set(socket.userId, socket.id);
    io.emit('user:online', { userId: socket.userId, socketId: socket.id, online: true });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user:joined', { userId: socket.userId, roomId });
    });

    socket.on('sendMessage', (data) => {
        const { roomId, message } = data;
        socket.to(roomId).emit('receiveMessage', { ...message, senderId: socket.userId });
    });

    // Các sự kiện call video giữ nguyên...
    socket.on('call:user', (data) => socket.to(data.to).emit('call:offered', data));
    socket.on('call:answer', (data) => socket.to(data.to).emit('call:answered', data));
    
    socket.on('disconnect', () => {
        onlineUsers.delete(socket.userId);
        io.emit('user:online', { userId: socket.userId, online: false });
    });
});

// 3. Routes
app.use("/api/auth", authRoutes);

// Private routes
app.use(protecttedRoute); 
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

// 4. Khởi động
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
        console.log(`👉 Cho phép Frontend tại: http://localhost:5175`);
    });
});
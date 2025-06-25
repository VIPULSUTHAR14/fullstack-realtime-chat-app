import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authroutes from './routes/auth.js';
import messageRoutes from './routes/message.routes.js';
import { connectDB } from './lib/db.js';
import { initSocket } from './lib/socket.js'; // ✅ use initSocket, not app/server

dotenv.config();

const app = express();
const server = http.createServer(app);

// Set server timeouts
server.timeout = 30000; // 30 seconds
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

initSocket(server); // ✅ initialize sockets on this server

// Global error handlers
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => {
        process.exit(1);
    });
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? ["https://fullstack-realtime-chat-app-7.onrender.com", "http://localhost:5173"]
    : "http://localhost:5173",
  credentials: true,
}));

// Request timeout middleware
app.use((req, res, next) => {
    req.setTimeout(25000, () => {
        res.status(408).json({ message: 'Request timeout' });
    });
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use("/api/auth", authroutes);
app.use("/api/messages", messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
});

// 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Production build serve
const __dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  app.use(express.static(frontendPath));

  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) return next();
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
  connectDB();
});

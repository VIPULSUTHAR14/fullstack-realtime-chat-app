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
initSocket(server); // ✅ initialize sockets on this server

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Routes
app.use("/api/auth", authroutes);
app.use("/api/messages", messageRoutes);

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

import express from 'express';
import dotenv from 'dotenv'
import authroutes from './routes/auth.js';
import messageRoutes from './routes/message.routes.js'
import { connectDB } from './lib/db.js';
import cookiePasrser from 'cookie-parser'
import cors from 'cors'
import { app , server } from './lib/socket.js';
dotenv.config();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookiePasrser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))

const PORT = process.env.PORT
app.use("/api/auth",authroutes)
app.use("/api/messages",messageRoutes)
server.listen(PORT,()=>{
    console.log("server is running on PORT:", +PORT);
    connectDB();
})
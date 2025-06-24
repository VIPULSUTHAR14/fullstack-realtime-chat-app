import {Server} from 'socket.io'
import http from 'http'
import express from 'express'

const app = express();
const server = http.createServer(app);
const io  = new Server(server,{
    cors:{
        origin:["http://localhost:5173"]
    }
});

export function getReceiverSocketId (userId){
    return userSocketMap[userId];
}

//for checking online users
const userSocketMap = {}; // it will take {userId : socketId} as argument
io.on("connection",(socket)=>{
    console.log("A user Connected",socket.id)
    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id

    // io.emit is used to send events to the all the connnected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
    socket.on("disconnect",()=>{
        console.log("A user Disconnection",socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

export {io,server,app};
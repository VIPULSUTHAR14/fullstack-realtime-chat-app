import { Server } from "socket.io";

let io;
const userSocketMap = {};

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
}

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// ✅ Use this to access io safely after initSocket
function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

export { initSocket, getReceiverSocketId, getIO };

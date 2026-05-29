import http from "http";
import { Server } from "socket.io";
import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

import chatRoutes from "./routes/chatRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import Message from "./models/Message.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import SwapRequestRoutes from "./routes/swapRequestRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import SwapRequest from "./models/SwapRequest.js";

await connectDB();

const app = express();

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/swap", SwapRequestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// ✅ Track online users: userId -> Set of socketIds (handles multiple tabs)
const onlineUsers = new Map();

// Helper: broadcast the current online user IDs to everyone
const broadcastOnlineUsers = () => {
  io.emit("online_users", Array.from(onlineUsers.keys()));
};

// SOCKET AUTH
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

// SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  // Auto join user's own room using authenticated userId
  socket.join(socket.userId);

  // ✅ Add to online users map and broadcast
  if (!onlineUsers.has(socket.userId)) {
    onlineUsers.set(socket.userId, new Set());
  }
  onlineUsers.get(socket.userId).add(socket.id);
  broadcastOnlineUsers();

  // SEND MESSAGE
  socket.on("send_message", async (data) => {
    try {
      if (!data.message?.trim()) return;

      // ✅ Always use socket.userId — never trust data.senderId from client
      const senderId = socket.userId;
      const receiverId = data.receiverId;

      // ✅ Check accepted swap before allowing message
      const isAllowed = await SwapRequest.findOne({
        status: "accepted",
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      });

      if (!isAllowed) {
        socket.emit("error", {
          message: "You can only chat with accepted swap partners",
        });
        return;
      }

      const conversationId = [senderId, receiverId].sort().join("_");

      const newMessage = await Message.create({
        conversationId,
        sender: senderId,
        receiver: receiverId,
        message: data.message,
      });

      await newMessage.populate("sender", "name");

      io.to(receiverId).emit("receive_message", newMessage);
      io.to(senderId).emit("receive_message", newMessage);
    } catch (err) {
      console.log(err.message);
    }
  });

  // TYPING
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("typing", { senderId });
  });

  socket.on("stop_typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("stop_typing", { senderId });
  });

  // ✅ On disconnect, remove socket from online map and broadcast
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);

    const sockets = onlineUsers.get(socket.userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(socket.userId); // fully offline
      }
    }
    broadcastOnlineUsers();
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

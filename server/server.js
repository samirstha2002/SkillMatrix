import http from "http";
import { Server } from "socket.io";
import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import errorMiddleware from "./middleware/errorMiddleware.js";
import Message from "./models/Message.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import SwapRequestRoutes from "./routes/swapRequestRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
await connectDB();

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

//routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/swap", SwapRequestRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);

// socket setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  // join room
  socket.on("join_room", (userId) => {
    socket.join(userId);

    onlineUsers.set(userId, socket.id);

    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  // typing
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        senderId,
      });
    }
  });

  // stop typing
  socket.on("stop_typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stop_typing", {
        senderId,
      });
    }
  });

  // send message
  socket.on("send_message", async (data) => {
    const newMessage = await Message.create({
      sender: data.senderId,
      receiver: data.receiverId,
      message: data.message,
    });

    io.to(data.receiverId).emit("receive_message", newMessage);

    io.to(data.senderId).emit("receive_message", newMessage);
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);

    for (let [userId, socketId] of onlineUsers) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("online_users", Array.from(onlineUsers.keys()));
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

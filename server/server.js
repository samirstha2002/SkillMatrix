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

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join user room
  socket.on("join_room", (userId) => {
    socket.join(userId);
  });

  // send message
  socket.on("send_message", async (data) => {
    try {
      if (!data.message?.trim()) return;

      const newMessage = await Message.create({
        sender: data.senderId,
        receiver: data.receiverId,
        message: data.message,
      });

      // optional: populate sender info
      await newMessage.populate("sender", "name");

      // send to receiver
      io.to(data.receiverId).emit("receive_message", newMessage);

      // send to sender
      io.to(data.senderId).emit("receive_message", newMessage);
    } catch (err) {
      console.log("Socket message error:", err.message);
    }
  });

  // typing indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("typing", { senderId });
  });

  socket.on("stop_typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("stop_typing", { senderId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

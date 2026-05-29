import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import SwapRequest from "../models/SwapRequest.js";
import Message from "../models/Message.js";

const router = express.Router();

// GET CHAT USERS (ONLY ACCEPTED SWAPS)
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user._id;

  const swaps = await SwapRequest.find({
    status: "accepted",
    $or: [{ sender: userId }, { receiver: userId }],
  }).populate("sender receiver", "name email");

  const chatMap = new Map();

  for (let swap of swaps) {
    const otherUser =
      swap.sender._id.toString() === userId.toString()
        ? swap.receiver
        : swap.sender;

    const conversationId = [userId, otherUser._id].sort().join("_");

    const lastMessage = await Message.findOne({ conversationId }).sort({
      createdAt: -1,
    });

    chatMap.set(otherUser._id.toString(), {
      _id: otherUser._id,
      name: otherUser.name,
      email: otherUser.email,
      lastMessage: lastMessage?.message || "",
      time: lastMessage?.createdAt || null,
    });
  }

  res.json(Array.from(chatMap.values()));
});

export default router;

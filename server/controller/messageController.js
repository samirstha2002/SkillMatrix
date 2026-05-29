import Message from "../models/Message.js";
import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";

// -----------------------------
// GET CONVERSATION MESSAGES
// -----------------------------
export const getConversationMessages = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const otherId = req.params.userId;

  // ✅ Only accepted swap partners can read each other's messages
  const isAllowed = await SwapRequest.findOne({
    status: "accepted",
    $or: [
      { sender: myId, receiver: otherId },
      { sender: otherId, receiver: myId },
    ],
  });

  if (!isAllowed) {
    return res
      .status(403)
      .json({ message: "Not authorized to view this conversation" });
  }

  const conversationId = [myId, otherId].sort().join("_");

  const messages = await Message.find({ conversationId }).sort({
    createdAt: 1,
  });

  res.json(messages);
});

// -----------------------------
// CHAT LIST (ONLY ACCEPTED USERS)
// -----------------------------
export const getChatList = asyncHandler(async (req, res) => {
  const myId = req.user._id;

  // only accepted swap users
  const swaps = await SwapRequest.find({
    status: "accepted",
    $or: [{ sender: myId }, { receiver: myId }],
  }).populate("sender receiver", "name email profilePic");

  const chatMap = new Map();

  for (let swap of swaps) {
    const otherUser =
      swap.sender._id.toString() === myId.toString()
        ? swap.receiver
        : swap.sender;

    const conversationId = [myId, otherUser._id].sort().join("_");

    const lastMessage = await Message.findOne({
      conversationId,
    }).sort({ createdAt: -1 });

    chatMap.set(otherUser._id.toString(), {
      user: otherUser,
      lastMessage: lastMessage?.message || "",
      time: lastMessage?.createdAt || null,
    });
  }

  res.json(Array.from(chatMap.values()));
});

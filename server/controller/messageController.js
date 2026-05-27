import Message from "../models/Message.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

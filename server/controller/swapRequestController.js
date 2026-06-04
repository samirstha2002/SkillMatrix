import SwapRequest from "../models/SwapRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import { io } from "../server.js";

// SEND REQUEST
export const sendSwapRequest = asyncHandler(async (req, res) => {
  const { receiverId, offeredSkill, requestedSkill } = req.body;

  if (req.user._id.toString() === receiverId) {
    return res.status(400).json({ message: "Cannot send to yourself" });
  }

  const exists = await SwapRequest.findOne({
    sender: req.user._id,
    receiver: receiverId,
    status: "pending",
  });

  if (exists) {
    return res.status(400).json({ message: "Already sent" });
  }

  const swap = await SwapRequest.create({
    sender: req.user._id,
    receiver: receiverId,
    offeredSkill,
    requestedSkill,
  });

  io.to(receiverId).emit("notification", {
    type: "swap_request",
    message: "New swap request received",
    requestId: swap._id,
  });

  res.status(201).json(swap);
});

// GET RECEIVED REQUESTS — only pending
export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await SwapRequest.find({
    receiver: req.user._id,
    status: "pending",
  })
    .populate("sender", "name email profilePic")
    .sort({ createdAt: -1 });

  res.json(requests);
});

// GET SENT REQUESTS — all statuses
export const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await SwapRequest.find({
    sender: req.user._id,
  })
    .populate("receiver", "name email profilePic")
    .sort({ createdAt: -1 });

  res.json(requests);
});

// ACCEPT
export const acceptRequest = asyncHandler(async (req, res) => {
  const request = await SwapRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ message: "Not found" });
  }

  request.status = "accepted";
  await request.save();

  io.to(request.sender.toString()).emit("notification", {
    type: "swap_accepted",
    message: "Your swap request was accepted 🎉",
    requestId: request._id,
    from: request.receiver,
  });

  res.json(request);
});

// REJECT
export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await SwapRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ message: "Not found" });
  }

  request.status = "rejected";
  await request.save();

  io.to(request.sender.toString()).emit("notification", {
    type: "swap_rejected",
    message: "Your swap request was rejected ❌",
    requestId: request._id,
  });

  res.json(request);
});

// ✅ CANCEL — only sender can cancel a pending request
export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await SwapRequest.findOne({
    _id: req.params.id,
    sender: req.user._id,
    status: "pending",
  });

  if (!request) {
    return res.status(404).json({ message: "Pending request not found" });
  }

  await request.deleteOne();

  // Notify receiver that request was cancelled
  io.to(request.receiver.toString()).emit("notification", {
    type: "swap_cancelled",
    message: "A swap request was cancelled",
    requestId: request._id,
  });

  res.json({ message: "Request cancelled" });
});

// ✅ DELETE — sender can delete accepted/rejected requests from their list
export const deleteRequest = asyncHandler(async (req, res) => {
  const request = await SwapRequest.findOne({
    _id: req.params.id,
    sender: req.user._id,
    status: { $in: ["accepted", "rejected"] },
  });

  if (!request) {
    return res
      .status(404)
      .json({ message: "Request not found or cannot be deleted" });
  }

  await request.deleteOne();

  res.json({ message: "Request deleted" });
});

// CHAT PARTNERS
export const getChatPartners = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const swaps = await SwapRequest.find({
    status: "accepted",
    $or: [{ sender: userId }, { receiver: userId }],
  });

  const partnerIds = swaps.map((s) =>
    s.sender.toString() === userId.toString() ? s.receiver : s.sender,
  );

  const users = await User.find({
    _id: { $in: partnerIds },
  }).select("-password");

  res.json(users);
});

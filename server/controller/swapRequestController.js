import SwapRequest from "../models/SwapRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";
// SEND SWAP REQUEST
export const sendSwapRequest = asyncHandler(async (req, res) => {
  const { receiverId, offeredSkill, requestedSkill } = req.body;

  // prevent self request
  if (req.user._id.toString() === receiverId) {
    return res.status(400).json({
      message: "You cannot send request to yourself",
    });
  }

  // prevent duplicate pending request
  const existingRequest = await SwapRequest.findOne({
    sender: req.user._id,
    receiver: receiverId,
    status: "pending",
  });

  if (existingRequest) {
    return res.status(400).json({
      message: "Request already sent and pending",
    });
  }

  const swap = await SwapRequest.create({
    sender: req.user._id,
    receiver: receiverId,
    offeredSkill,
    requestedSkill,
  });

  res.status(201).json(swap);
});
// GET MY REQUESTS
export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await SwapRequest.find({
    receiver: req.user._id,
  })
    .populate("sender", "name email")
    .sort({ createdAt: -1 });

  res.json(requests);
});

// ACCEPT REQUEST
export const acceptRequest = asyncHandler(async (req, res) => {
  const request = await SwapRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      message: "Request not found",
    });
  }

  request.status = "accepted";
  await request.save();

  res.json(request);
});

// REJECT REQUEST
export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await SwapRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      message: "Request not found",
    });
  }

  request.status = "rejected";
  await request.save();

  res.json(request);
});

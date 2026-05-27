import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  acceptRequest,
  getMyRequests,
  rejectRequest,
  sendSwapRequest,
} from "../controller/swapRequestController.js";

const router = express.Router();

router.post("/send", authMiddleware, sendSwapRequest);

router.get("/my-requests", authMiddleware, getMyRequests);

router.put("/accept/:id", authMiddleware, acceptRequest);

router.put("/reject/:id", authMiddleware, rejectRequest);

export default router;

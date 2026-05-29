import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  acceptRequest,
  cancelRequest,
  deleteRequest,
  getMyRequests,
  getSentRequests,
  rejectRequest,
  sendSwapRequest,
} from "../controller/swapRequestController.js";

const router = express.Router();

router.post("/send", authMiddleware, sendSwapRequest);
router.get("/my-requests", authMiddleware, getMyRequests);
router.get("/sent-requests", authMiddleware, getSentRequests);
router.put("/accept/:id", authMiddleware, acceptRequest);
router.put("/reject/:id", authMiddleware, rejectRequest);
router.delete("/cancel/:id", authMiddleware, cancelRequest); // ✅ cancel pending
router.delete("/delete/:id", authMiddleware, deleteRequest); // ✅ delete accepted/rejected

export default router;

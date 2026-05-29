import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getConversationMessages,
  getChatList,
} from "../controller/messageController.js";

const router = express.Router();

// ⚠️ IMPORTANT: static routes first
router.get("/chats", authMiddleware, getChatList);

// conversation between 2 users
router.get("/conversation/:userId", authMiddleware, getConversationMessages);

export default router;

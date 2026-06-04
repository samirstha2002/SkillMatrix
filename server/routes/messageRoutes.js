import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getConversationMessages,
  getChatList,
  deleteMessage,
  deleteConversation,
} from "../controller/messageController.js";

const router = express.Router();

// ⚠️ static routes first
router.get("/chats", authMiddleware, getChatList);
router.get("/conversation/:userId", authMiddleware, getConversationMessages);

// ✅ delete routes
router.delete("/:messageId", authMiddleware, deleteMessage);
router.delete("/conversation/:userId", authMiddleware, deleteConversation);

export default router;

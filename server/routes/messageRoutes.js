import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMessages } from "../controller/messageController.js";

const router = express.Router();

router.get("/:userId", authMiddleware, getMessages);

export default router;

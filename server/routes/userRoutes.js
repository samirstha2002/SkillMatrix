import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMe, updateProfile } from "../controller/userController.js";

const router = express.Router();

// protected route
router.get("/me", authMiddleware, getMe);
router.put("/update", authMiddleware, updateProfile);

export default router;

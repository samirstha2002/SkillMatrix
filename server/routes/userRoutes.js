import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getMe,
  updateProfile,
  uploadProfilePic,
  getUserById,
} from "../controller/userController.js";
import User from "../models/User.js";
import { getChatPartners } from "../controller/swapRequestController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", authMiddleware, getMe);
router.put("/update", authMiddleware, updateProfile);
router.post(
  "/upload-pic",
  authMiddleware,
  upload.single("profilePic"),
  uploadProfilePic,
);
router.get("/chat/partners", authMiddleware, getChatPartners);
router.get("/:id", authMiddleware, getUserById); // ✅ must be last to avoid catching /me

export default router;

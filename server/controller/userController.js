import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// ✅ Get any user's public profile by ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { bio, skillsOffered, skillsWanted } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (bio !== undefined) user.bio = bio;
  if (skillsOffered !== undefined) {
    user.skillsOffered = Array.isArray(skillsOffered)
      ? skillsOffered
      : skillsOffered
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  }
  if (skillsWanted !== undefined) {
    user.skillsWanted = Array.isArray(skillsWanted)
      ? skillsWanted
      : skillsWanted
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  }

  const updatedUser = await user.save();
  res.json(updatedUser);
});

export const uploadProfilePic = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "skillmatrix/avatars",
        transformation: [{ width: 300, height: 300, crop: "fill" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(req.file.buffer);
  });

  const user = await User.findById(req.user._id);
  user.profilePic = result.secure_url;
  await user.save();

  res.json({ profilePic: result.secure_url });
});

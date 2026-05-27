import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { bio, skillsOffered, skillsWanted } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (bio !== undefined) user.bio = bio;
  if (skillsOffered) user.skillsOffered = skillsOffered;
  if (skillsWanted) user.skillsWanted = skillsWanted;

  const updatedUser = await user.save();

  res.json(updatedUser);
});

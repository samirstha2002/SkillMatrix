import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
export const findTeachers = asyncHandler(async (req, res) => {
  const { skill } = req.query;

  if (!skill) {
    return res.status(400).json({
      message: "Skill is required",
    });
  }

  const users = await User.find({
    skillsOffered: { $in: [skill] },
  }).select("-password");

  res.json(users);
});

export const findLearners = asyncHandler(async (req, res) => {
  const { skill } = req.query;

  if (!skill) {
    return res.status(400).json({
      message: "Skill required",
    });
  }

  const users = await User.find({
    skillsWanted: { $in: [skill] },
  }).select("-password");

  res.json(users);
});

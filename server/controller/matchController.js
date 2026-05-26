import User from "../models/User.js";

export const findTeachers = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const findLearners = async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({
        message: "Skill required",
      });
    }

    const users = await User.find({ skillsWanted: { $in: [skill] } }).select(
      "-password",
    );

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

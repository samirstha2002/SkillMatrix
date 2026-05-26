import User from "../models/User.js";

export const getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { bio, skillsOffered, skillsWanted } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (bio !== undefined) user.bio = bio;
    if (skillsOffered) user.skillsOffered = skillsOffered;
    if (skillsWanted) user.skillsWanted = skillsWanted;

    const updateUser = await user.save();

    res.json(updateUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

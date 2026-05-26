import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    bio: {
      type: String,
      default: "",
    },

    skillsOffered: [
      {
        type: String,
      },
    ],

    skillsWanted: [
      {
        type: String,
      },
    ],

    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// HASH PASSWORD BEFORE SAVE
// ✅ modern Mongoose — no next parameter needed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// PASSWORD COMPARISON METHOD
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;

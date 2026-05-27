import mongoose from "mongoose";
const swapRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    offeredSkill: {
      type: String,
      required: true,
    },

    requestedSkill: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timeStamps: true },
);

const SwapRequest = mongoose.model("SwapRequest", swapRequestSchema);

export default SwapRequest;

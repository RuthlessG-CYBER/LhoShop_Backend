import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payments",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    reason: String,

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Refunded", "Replaced"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Return", returnSchema);
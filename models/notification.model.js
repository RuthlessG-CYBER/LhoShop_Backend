import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    type: {
      type: String,
      enum: ["admin", "user"],
      default: "admin",
    },
    read: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);

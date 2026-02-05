import mongoose from "mongoose";

const adminSchema = mongoose.Schema(
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
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "manager", "support"],
      default: "manager",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Admin", adminSchema);

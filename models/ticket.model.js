import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
    },

    subject: {
      type: String,
      required: true,
    },

    message: {
      type: String,
    },

    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },

    sla: {
      type: String,
      default: "—",
    },
  },
  { timestamps: true }
);


export default mongoose.model("Ticket", ticketSchema);

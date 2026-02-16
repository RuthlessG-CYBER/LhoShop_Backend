import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
        },
        quantity: Number,
        price: Number,
        color: String,
        size: String,
      },
    ],
    address: String,
    orderId: String,
    paymentId: String,
    amount: Number,
    status: String,
    delivaryStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payments", paymentSchema);

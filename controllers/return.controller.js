import Return from "../models/return.model.js";
import Payments from "../models/payment.model.js";

/* CREATE RETURN REQUEST */
export const createReturn = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;

    const payment = await Payments.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🚀 prevent duplicate return
    const alreadyExists = await Return.findOne({ paymentId });

    if (alreadyExists) {
      return res
        .status(400)
        .json({ message: "Return already requested for this order" });
    }

    const newReturn = await Return.create({
      paymentId: payment._id, // always use ObjectId
      userId: payment.userId,
      reason,
    });

    res.status(201).json(newReturn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/* GET ALL RETURNS (Admin) */
export const getReturns = async (_, res) => {
  try {
    const returns = await Return.find()
      .populate({
        path: "paymentId",
        select: "orderId amount delivaryStatus createdAt",
      })
      .populate({
        path: "userId",
        select: "name email",
      })
      .sort({ createdAt: -1 });

    res.json({ 
        count: returns.length,
        message: "Returns fetched successfully",
        returns
     });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



/* APPROVE / REJECT */
export const updateReturnStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = [
      "Pending",
      "Approved",
      "Rejected",
      "Refunded",
      "Replaced",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ret = await Return.findById(req.params.id);

    if (!ret) {
      return res.status(404).json({ message: "Return not found" });
    }

    ret.status = status;
    await ret.save();

    /* ================= OPTIONAL BUSINESS LOGIC ================= */

    // auto refund example
    if (status === "Refunded") {
      await Payments.findByIdAndUpdate(ret.paymentId, {
        status: "refunded",
      });
    }

    // auto replacement example
    if (status === "Replaced") {
      await Payments.findByIdAndUpdate(ret.paymentId, {
        delivaryStatus: "Processing",
      });
    }

    res.json(ret);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

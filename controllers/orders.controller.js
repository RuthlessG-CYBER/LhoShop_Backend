import Payments from "../models/payment.model.js";


export const getOrders = async (req, res) => {
    try {
        const orders = await Payments.find();
        res.status(200).json({
          message: "Orders fetched successfully",
          orders
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getOrderByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Payments.find({ userId })
      .populate("userId", "name email")
      .populate("items.productId", "name image price")
      .sort({ createdAt: -1 });

    res.json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body

    const order = await Payments.findOne({ orderId })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    order.delivaryStatus = status
    await order.save()

    res.json({
      message: "Order status updated successfully",
      order,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}




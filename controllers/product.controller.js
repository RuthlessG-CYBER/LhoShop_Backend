import Products from "../models/product.model.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Payments from "../models/payment.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";




export const getProducts = async (req, res) => {
  try {
    const products = await Products.find();
    if (!products) {
      return res.status(404).json({ message: "Products not found" });
    }
    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Products.create(req.body);
    const notification = Notification({
      message: `New product ${product.name} has been added to the store.`,
      date: new Date(),
      type: "admin"
    })
    await notification.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const editProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const notification = Notification({
      message: `Product ${product.name} has been updated.`,
      date: new Date(),
      type: "admin"
    })

    await notification.save();
    const updatedProduct = await Products.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await Products.findByIdAndDelete(req.params.id);

    const notification = Notification({
      message: `Product ${product.name} has been deleted.`,
      date: new Date(),
      type: "admin"
    })
    await notification.save();
    res.status(200).json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};


// Payment

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      items,
      address,
      amount,
    } = req.body;

    if (!userId || !items?.length || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing items, userId or address",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    session.startTransaction();

    for (const item of items) {
      const product = await Products.findById(item.productId).session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stock < item.quantity) {
        throw new Error(`${product.name} is out of stock`);
      }

      product.stock -= item.quantity;
      await product.save();
    }

    const savePayment = await Payments.create(
      [
        {
          userId,
          items,
          address,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount,
          status: "success",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const notification = Notification({
      message: `Your payment of ₹${amount} was successful.`,
      date: new Date(),
      type: "user"
    });
    await notification.save();

    res.json({
      success: true,
      savePayment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all products where product type == "Beauty"
export const getBeautyProducts = async (req, res) => {
  try {
    const products = await Products.find({ type: "Beauty" });
    if (!products) {
      return res.status(404).json({ message: "Products not found" });
    }
    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

// get all products where product type == "Fashion"
export const getFashionProducts = async (req, res) => {
  try {
    const products = await Products.find({ type: "Fashion" });
    if (!products) {
      return res.status(404).json({ message: "Products not found" });
    }
    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}
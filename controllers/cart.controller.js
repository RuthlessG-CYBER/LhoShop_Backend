import Cart from "../models/cart.model.js";
import Notification from "../models/notification.model.js";

export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart) {
      return res.json({ products: [] });
    }

    const products = cart.products
      .filter((p) => p.productId)
      .map((p) => ({
        productId: p.productId._id,
        name: p.productId.name,
        image: p.productId.image,
        price: p.productId.price,
        quantity: p.quantity,
      }));

    res.json({ products });
  } catch (error) {
    console.log("GET CART ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, color, size } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const duplicateCheck = await Cart.findOne({
      userId,
      "products.productId": productId,
    });
    if (duplicateCheck) {
      return res.status(400).json({ message: "Product already in cart" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({
        userId,
        products: [{ productId, quantity, color, size }],
      });

      return res.json(cart);
    }

    const index = cart.products.findIndex((p) => p.productId === productId);

    if (index > -1) {
      cart.products[index].quantity += 1;
    } else {
      cart.products.push({ productId, quantity: 1 });
    }

    await cart.save();

    const notification = Notification({
      message: `${productId} has been added to ${userId}'s cart.`,
      date: new Date(),
      type: "user",
    });
    await notification.save();

    res.json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId,
    );

    await cart.save();

    res.json({ message: "Removed", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

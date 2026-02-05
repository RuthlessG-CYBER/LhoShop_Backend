import Customer from "../models/customer.model.js";
import Notification from "../models/notification.model.js";

export const addAddress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { address } = req.body;

    const user = await Customer.findByIdAndUpdate(
      userId,
      {
        $push: {
          address: { value: address },
        },
      },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = Notification({
      userId: userId,
      message: `${user.name}, a new address has been added to your account.`,
      date: new Date(),
      type: "user"
    });
    await notification.save();

    res.status(200).json({
      message: "Address added successfully",
      addresses: user.address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAddresses = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await Customer.findById(userId).select("address");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Addresses fetched successfully",
      addresses: user.address,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const user = await Customer.findByIdAndUpdate(
      userId,
      {
        $pull: { address: { _id: addressId } },
      },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = Notification({
      userId: userId,
      message: `${user.name}, an address has been removed from your account.`,
      date: new Date(),
      type: "user"
    });
    await notification.save();
    res.json({
      message: "Address deleted successfully",
      addresses: user.address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

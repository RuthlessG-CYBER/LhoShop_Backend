import Admin from "../models/admin.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const adminregister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      return res.status(400).json({
        message: "Only @gmail.com emails allowed",
      });
    }

    const allowedRoles = ["superadmin", "admin", "manager", "support"];
    const safeRole = allowedRoles.includes(role) ? role : "manager";

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: safeRole,
    });



    await Notification.create({
      title: "New Admin Registered",
      message: `${name} joined as ${safeRole}`,
      type: "admin",
    });



    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch {
    res.status(500).json({ message: "Something went wrong" });
  }
};

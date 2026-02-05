import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.status(200).json({
            message: "Notifications fetched successfully",
            notifications
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const totalNotifications = async (req, res) => {
    try {
        const count = await Notification.countDocuments();
        res.status(200).json({
            message: "Total unread notifications fetched successfully",
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const readNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        notification.read = true;
        await notification.save();
        res.status(200).json({
            message: "Notification marked as read successfully",
            notification
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const totalUnreadNotifications = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ read: false });
        res.status(200).json({
            message: "Total unread notifications fetched successfully",
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const totalReadNotifications = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ read: true });
        res.status(200).json({
            message: "Total read notifications fetched successfully",
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
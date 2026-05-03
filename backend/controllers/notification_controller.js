const Notification = require("../models/notifications");
const User = require("../models/user");
const { validationResult } = require("express-validator");

exports.mark_as_read = async (req, res) => {
  const { notification_id } = req.body;

  try {
    await Notification.findByIdAndUpdate(notification_id, {
      isRead: true,
    });

    return res.status(200).json({
      success: true,
      message: "successful",
    });
  } catch (error) {
    console.error("error", error.message);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

exports.get_notifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user.userId })
      .populate("sender", "full_name username email")
      .sort({ createdAt: -1 });

    if (!notifications) {
      return res.status(200).json({
        success: true,
        message: "no notifications yet",
      });
    }
    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

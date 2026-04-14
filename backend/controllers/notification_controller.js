const Notification = require("../models/notifications");

exports.send_notification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  receiver_id;
  try {
    const { receiver, type, message } = req.body;

    // find the user to notify
    const sent_to = await User.findById(receiver);
    if (!sent_to) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const notification = new Notification({
      sender: req.user.userId,
      receiver: sent_to._id,
      type,
      message,
    });

    await notification.save();

    return res.status(201).json({
      success: true,
      message: "Notification sent",
      data: notification,
    });
  } catch (error) {
    console.error("error", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.mark_as_read = async (req, res) => {
  const { notification_id } = req.body;

  try {
    await Notification.findByIdAndUpdate(notification_id, {
      isRead: true,
    });

    return res.status(201).json({
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

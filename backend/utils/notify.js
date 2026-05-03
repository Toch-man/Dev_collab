const Notification = require("../models/notifications");
const send_notification = async ({ sender, receiver, type, message }) => {
  try {
    if (!receiver) return;

    await Notification.create({
      sender,
      receiver,
      type,
      message,
    });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

module.exports = send_notification;

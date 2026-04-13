const Notification = require("../models/notifications");
const { validationResult } = require("express-validator");

exports.send_notification = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(500).json({
      success: false,
      errors: error.array(),
    });
  }

  try {
    const { user, type, message } = req.body;
  } catch (error) {}
};

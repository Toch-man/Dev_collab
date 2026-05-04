const router = require("express").Router();
const notification_controller = require("../controllers/notification_controller");
const { verify_token } = require("../middleware/auth");

router.post(
  "/mark_as_read",
  verify_token,
  notification_controller.mark_as_read
);

router.get(
  "/get_notification",
  verify_token,
  notification_controller.get_notifications
);

module.exports = router;

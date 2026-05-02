const router = require("express").Router();
const { verify_token } = require("../middleware/auth");
const invite_controller = require("../controllers/inviteController");

router.get("/get_my_invites", verify_token, invite_controller.get_my_invites);

router.post("/accept_invite", verify_token, invite_controller.accept_invite);

router.post(
  "reject_invite/:invite_id",
  verify_token,
  invite_controller.reject_invite
);

module.exports = router;

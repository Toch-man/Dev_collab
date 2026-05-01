const router = require("express").Router();
const project_controller = require("../controllers/projectController");
const { verify_token } = require("../middleware/auth");

router.get("/all_projects", verify_token, project_controller.all_project);

router.get("/view_projects", verify_token, project_controller.get_my_projects);

router.get(
  "/project_details/:project_id",
  verify_token,
  project_controller.get_single_project
);

router.post("/create_project", verify_token, project_controller.create_project);

router.post(
  "/send_invite/:project_id",
  verify_token,
  project_controller.send_invite
);

router.get("/get_invites", verify_token, project_controller.get_my_invites);

router.post("/accept_invite", verify_token, project_controller.accept_invite);

router.post(
  "/reject_invite/:invite_id",
  verify_token,
  project_controller.reject_invite
);

module.exports = router;

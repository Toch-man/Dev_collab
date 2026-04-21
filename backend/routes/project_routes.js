const router = require("express").Router();
const project_controller = require("../controllers/projectController");
const { verify_token } = require("../middleware/auth");
const { is_project_owner } = require("../middleware/auth");
router.get("/view_projects", project_controller.get_project);

router.get(
  "/project_details",
  verify_token,
  project_controller.get_single_project
);
router.post("/create_project", verify_token, project_controller.create_project);
router.post(
  "/send_invite/:project_id",
  verify_token,
  project_controller.send_invite
);
router.post("/accept_invite", verify_token, project_controller.accept_invite);

module.exports = router;

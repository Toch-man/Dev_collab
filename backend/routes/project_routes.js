const router = require("express").Router();
const project_controller = require("../controllers/projectController");
const { verify_token, is_project_owner } = require("../middleware/auth");

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

router.delete(
  "/delete_project/:project_id",
  verify_token,
  is_project_owner,
  project_controller.delete_project
);

router.post(
  "/remove_member/:project_id",
  is_project_owner,
  project_controller.remove_member
);

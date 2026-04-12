const router = require("express").Router();
const project_controller = require("../controllers/projectController");

router.get("/view_projects", project_controller.get_project);
router.get("/project_details", project_controller.get_single_project);
router.post("/create_project", project_controller.create_project);
router.post("/send_invite", project_controller.send_invite);
router.post("/accept_invite", project_controller.accept_invite);

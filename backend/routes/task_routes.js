const task_controller = require("../controllers/taskController");
const { verify_token } = require("../middleware/auth");
const { is_task_owner } = require("../middleware/auth");
const { is_project_owner } = require("../middleware/auth");
const router = require("express").Router();

router.post(
  "/assign_task",
  verify_token,
  is_project_owner,
  task_controller.assign_task
);

router.post(
  "/update_task_data/:project_id",
  verify_token,
  is_task_owner,
  task_controller.update_task_status
);

router.post(
  "/submit_task/:project_id",
  verify_token,
  is_task_owner,
  upload.single("file"),
  task_controller.submit_task
);

module.exports = router;

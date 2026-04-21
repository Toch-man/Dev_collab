const task_controller = require("../controllers/taskController");
const { verify_token } = require("../middleware/auth");
const { is_task_owner } = require("../middleware/auth");
const { is_project_owner } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
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
  task_controller.update_task_data
);

router.post(
  "/submit_task/:taskId",
  verify_token,
  is_task_owner,
  upload.single("file"),
  task_controller.submit_task
);

router.get_submitted_task(
  "/get_submitted_task/:project_id",
  verify_token,
  is_project_owner,
  task_controller.get_submitted_task
);

router.post("/get_tasks", verify_token, task_controller.get_tasks);

router.post("/get_task", verify_token, task_controller.get_single_task);
module.exports = router;

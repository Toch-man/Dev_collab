const { validationResult } = require("express-validator");
const Task = require("../models/task");

exports.assign_task = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(500).json({
      success: false,
      errors: error.array(),
    });
  }

  try {
    const task = new Task({
      ...req.body,
    });
    await task.save();

    return res.status(201).json({
      success: true,
      message: "task assigned",
    });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

exports.update_task_data = async (req, res) => {
  const { project_id } = req.params;
  const { data_to_update, update_to_id } = req.body;

  try {
    //status would be to update status
    if (data_to_update == "status") {
      let update_to;
      if (update_to_id == 1) {
        if (req.userId.toString() !== Task.find(assignedTo).toString()) {
          return res
            .status(401)
            .json({ success: false, message: "unauthorised access" });
        }
        update_to = "in_progress";
      } else if ((update_to_id = 3)) {
        if (req.userId.toString() !== project_id.toString()) {
          return res.status(401).json({
            success: false,
            message: "unauthorised",
          });
        }
        update_to = "done";
      }

      const task = await Task.findByIdAndUpdate(
        project_id,
        {
          $set: { status: update_to },
        },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "task status updated",
        updated_task: task,
      });
    }
    if (data_to_update == "priority") {
      let update_to;
      if (update_to_id == 0) {
        update_to = "low";
      } else if (update_to_id == 1) {
        update_to = "medium";
      } else {
        update_to = "high";
      }

      const task = await Task.findByIdAndUpdate(
        project_id,
        {
          $set: { priority: update_to },
        },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "task priority updated",
        updated_task: task,
      });
    }
  } catch (error) {
    console.error("error", error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

exports.submit_task = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { taskId } = req.params;
    const file = req.file?.path; // from multer

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      { $set: { proof: file, status: "under_review" } }, // set to under_review when submitted
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task submitted successfully",
      task,
    });
  } catch (error) {
    console.error("Submit task error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting task",
    });
  }
};

exports.get_submitted_tasks = async (req, res) => {
  try {
    const project_id = req.params;
    const submitted_task = Task.find({
      $and: [{ project: project_id }, { status: "under_review" }],
    }).populate();

    if (!submitted_task) {
      return res.status(404).json({
        success: false,
        message: "no task submited yet",
      });
    }
    return res.status(200).json({
      success: true,
      task: submitted_task,
    });
  } catch (error) {
    console.error("error", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// taskController.js
exports.get_tasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId })
      .populate("project", "project_name")
      .populate("assignedTo", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// also add get single task
exports.get_single_task = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "project_name")
      .populate("assignedTo", "username email");

    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    return res.status(200).json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

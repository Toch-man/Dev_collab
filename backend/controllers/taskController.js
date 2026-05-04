const { validationResult } = require("express-validator");
const Task = require("../models/task");
const Project = require("../models/project");
const cloudinary = require("../config/cloudinary");
const send_notification = require("../utils/notify");

// ── POST /api/tasks/assign_task/:project_id ───────────────────────────────────
exports.assign_task = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ success: false, errors: error.array() });
  }

  try {
    const { project_id } = req.params;
    const { title, description, assignedTo, priority, due_date } = req.body;

    const project = await Project.findById(project_id).select(
      "project_name owner"
    );
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // only project owner can assign tasks
    if (project.owner.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can assign tasks",
      });
    }

    const task = await Task.create({
      title,
      description,
      project: project_id,
      assignedTo,
      priority,
      due_date,
    });

    await send_notification({
      sender: req.user.userId,
      receiver: assignedTo,
      type: "task_assigned",
      message: `You were assigned a task "${title}" in ${project.project_name}`,
    });

    return res
      .status(201)
      .json({ success: true, message: "Task assigned", task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// handles both status AND priority updates cleanly
exports.update_task_data = async (req, res) => {
  const { task_id, project_id } = req.params;
  const { data_to_update, update_to_id } = req.body;

  try {
    const project = await Project.findById(project_id);
    const task = await Task.findById(task_id).populate(
      "assignedTo",
      "username"
    );

    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    const is_owner = req.user.userId.toString() === project.owner.toString();
    const is_assigned =
      req.user.userId.toString() === task.assignedTo._id.toString();

    // ── STATUS UPDATE ─────────────────────────────────────────────────────────
    if (data_to_update === "status") {
      let update_to;

      if (update_to_id === 1) {
        // only assigned user can start
        if (!is_assigned) {
          return res.status(403).json({
            success: false,
            message: "Only assigned user can start this task",
          });
        }
        update_to = "in_progress";
      }

      if (update_to_id === 3) {
        // only owner can mark done
        if (!is_owner) {
          return res.status(403).json({
            success: false,
            message: "Only project owner can mark task as done",
          });
        }
        update_to = "done";
      }

      if (!update_to) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status action" });
      }

      const updated_task = await Task.findByIdAndUpdate(
        task_id,
        { $set: { status: update_to } },
        { new: true }
      )
        .populate("project", "project_name owner _id")
        .populate("assignedTo", "username _id");

      return res
        .status(200)
        .json({ success: true, message: "Task status updated", updated_task });
    }

    // PRIORITY UPDATE
    if (data_to_update === "priority") {
      if (!is_owner) {
        return res.status(403).json({
          success: false,
          message: "Only project owner can change priority",
        });
      }

      const priority_map = {
        0: "low",
        1: "medium",
        2: "high",
      };
      const update_to = priority_map[update_to_id];

      if (!update_to) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid priority value" });
      }

      const updated_task = await Task.findByIdAndUpdate(
        task_id,
        { $set: { priority: update_to } },
        { new: true }
      )
        .populate("project", "project_name owner _id")
        .populate("assignedTo", "username _id");

      return res.status(200).json({
        success: true,
        message: "Task priority updated",
        updated_task,
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Invalid update type" });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/tasks/submit/:taskId ────────────────────────────────────────────
exports.submit_task = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer.toString("base64");
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${fileBuffer}`,
      { folder: "devcollab_tasks", resource_type: "auto" }
    );

    const task = await Task.findByIdAndUpdate(
      taskId,
      { $set: { proof: result.secure_url, status: "under_review" } },
      { new: true }
    )
      .populate("project", "project_name owner")
      .populate("assignedTo", "username _id");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Task submitted successfully", task });
  } catch (error) {
    console.error("Submit task error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while submitting task" });
  }
};

// ── GET /api/tasks ────────────────────────────────────────────────────────────
exports.get_tasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId })
      .populate("project", "project_name _id")
      .populate("assignedTo", "username email _id")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/tasks/:task_id ───────────────────────────────────────────────────
exports.get_single_task = async (req, res) => {
  try {
    const { task_id } = req.params;
    const task = await Task.findById(task_id)

      .populate("project", "project_name owner _id")
      .populate("assignedTo", "username email _id");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    return res.status(200).json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/tasks/submitted/:project_id ─────────────────────────────────────
exports.get_submitted_tasks = async (req, res) => {
  try {
    const { project_id } = req.params;
    const tasks = await Task.find({
      project: project_id,
      status: "under_review",
    })
      .populate("assignedTo", "username full_name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

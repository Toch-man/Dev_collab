const { validationResult } = require("express-validator");
const Task = require("../models/task");
const Project = require("../models/project");
const cloudinary = require("../config/cloudinary");

exports.assign_task = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(500).json({
      success: false,
      errors: error.array(),
    });
  }

  try {
    const { project_id } = req.params();
    const { title, description, assignedTo, priority, due_date } = req.body;
    const task = new Task({
      title: title,
      description: description,
      project: project_id,
      assignedTo: assignedTo,
      priority: priority,
      due_date: due_date,
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
  const { task_id, project_id } = req.params;
  const { data_to_update, update_to_id } = req.body;

  try {
    // fetch data first
    const project = await Project.findById(project_id);
    const task = await Task.findById(task_id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    let update_to;

    // STATUS UPDATE LOGIC
    if (data_to_update === "status") {
      if (update_to_id === 1) {
        // ONLY task assignee can start task
        if (req.user.userId.toString() !== task.assignedTo.toString()) {
          return res.status(403).json({
            success: false,
            message: "Only assigned user can start this task",
          });
        }

        update_to = "in_progress";
      }

      if (update_to_id === 3) {
        // ONLY project owner can mark as done
        if (req.user.userId.toString() !== project.owner.toString()) {
          return res.status(403).json({
            success: false,
            message: "Only project owner can mark task as done",
          });
        }

        update_to = "done";
      }

      if (!update_to) {
        return res.status(400).json({
          success: false,
          message: "Invalid status action",
        });
      }

      const updated_task = await Task.findByIdAndUpdate(
        task_id,
        { $set: { status: update_to } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Task status updated",
        updated_task,
      });
    }

    // PRIORITY UPDATE LOGIC

    if (data_to_update === "priority") {
      // ONLY project owner can change priority
      if (req.user.userId.toString() !== project.owner.toString()) {
        return res.status(403).json({
          success: false,
          message: "Only project owner can change priority",
        });
      }

      update_to =
        update_to_id === 0 ? "low" : update_to_id === 1 ? "medium" : "high";

      const updated_task = await Task.findByIdAndUpdate(
        task_id,
        { $set: { priority: update_to } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Task priority updated",
        updated_task,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid update type",
    });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.submit_task = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // convert buffer to base64
    const fileBuffer = req.file.buffer.toString("base64");

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${fileBuffer}`,
      {
        folder: "devcollab_tasks",
        resource_type: "auto",
      }
    );

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: {
          proof: result.secure_url,
          status: "under_review",
        },
      },
      { new: true }
    );

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
    const { project_id } = req.params;
    const submitted_task = await Task.find({
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
    const tasks = await Task.find({
      $or: [{ assignedTo: req.user.userId }, { owner: req.user.userId }],
    })
      .populate("project", "project_name")
      .populate("assignedTo", "username email")
      .sort({ createdAt: -1 });
    //shoud get task not oly whit assing to but also theproject the taks belongs
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
    const { task_id } = req.params;
    const task = await Task.findById(task_id)
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

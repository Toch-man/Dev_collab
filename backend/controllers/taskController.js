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

exports.update_task_status = async (req, res) => {
  const { project_id } = req.params;
  const { data_to_update, update_to_id } = req.body;

  try {
    //status would be to update status
    if (data_to_update == "status") {
      let update_to;
      if (update_to_id == 1) {
        update_to = "in_progress";
      } else {
        update_to = "done";
      }

      const task = await Task.findByIdAndUpdate(
        project_id,
        {
          $set: { status: update_to },
        },
        { new: true }
      );
      await task.save();
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
    }

    return res.status(200).json({
      success: true,
      message: "task updated",
    });
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
    const { taskId } = req.param;
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

//task that are under reviewed fetched and approved chnages to done else chnages to inprogres

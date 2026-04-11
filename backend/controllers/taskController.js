const { validationResult } = require("express-validator");
const Task = require("../models/task");

exports.assign_task = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty) {
    return res.status(500).json({
      success: false,
      errors: error.array,
    });
  }

  try {
    const task_details = req.body;
    const task = new Task({
      task_details,
    });
    await task.save();

    return res.status(201).json({
      success: true,
      message: "task assigned",
      access_token,
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
  const { project_id } = req.param;
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
          $addToSet: { status: update_to },
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
          $addToSet: { priority: update_to },
        },
        { new: true }
      );
      await task.save();
    }

    return res.status(201).json({
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

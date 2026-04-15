const jwt = require("jsonwebtoken");
const Project = require("../models/project");
const Task = require("../models/task");

exports.verify_token = async (req, res, next) => {
  const auth_header = req.headers.authorization;

  if (!auth_header || !auth_header.startsWith("Bearer")) {
    return res.status(401).json({
      success: false,
      message: "no token provided",
    });
  }
  const token = auth_header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        expired: true,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
};

exports.is_task_owner = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    const task = await Task.findById(task_id).populate();
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!task.assignedTo.toString() == req.user.userId.toString()) {
      return res.status(404).json({
        success: false,
        message: "no authorised",
      });
    }

    next();
  } catch (error) {
    console.error("error", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.is_project_owner = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "project not found",
      });
    }

    if (!project.owner.toString() == req.user.userId.toString()) {
      return res.status(404).json({
        success: false,
        message: "not authorised",
      });
    }
    next();
  } catch (error) {
    console.error("error", error.message);
    return;
  }
};

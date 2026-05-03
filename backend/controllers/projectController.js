const Project = require("../models/project");
const Invite = require("../models/invite");

const { validationResult } = require("express-validator");
const send_notification = require("../utils/notify");

exports.all_project = async (req, res) => {
  try {
    const all_project = await Project.find()
      .populate("owner", "full_name email")
      .populate("members", "full_name email skills niche ")
      .sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      message: "all project fetched",
      total_project: all_project.length,
      projects: all_project,
    });
  } catch (error) {
    console.error("error", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.get_my_projects = async (req, res) => {
  try {
    const all_project = await Project.find({
      $or: [{ owner: req.user.userId }, { members: req.user.userId }],
    })
      .populate("owner", "full_name email")
      .populate("members", "full_name email skills niche ")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "fetched all projects",
      total_project: all_project.length,
      project: all_project,
    });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.get_single_project = async (req, res) => {
  try {
    const { project_id } = req.params;
    const project = await Project.findById(project_id)
      .populate("owner", "full_name username email niche bio skills role")
      .populate("members", "full_name username email niche bio skills role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "successful",

      project: project,
    });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.create_project = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(500).json({
      success: false,
      errors: error.array(),
    });
  }
  try {
    const project = await Project.create({
      ...req.body,
      owner: req.user.userId,
    });
    await project.save();

    return res.status(201).json({
      success: true,
      message: "project created successfully",
      project: project,
    });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({
      success: false,
      message: "server error during creation",
      error: error.message,
    });
  }
};

exports.send_invite = async (req, res) => {
  try {
    const { receiver_id } = req.body;
    const { project_id } = req.params;

    const project = await Project.findById(project_id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const sender = req.user.userId;
    const receiver = receiver_id ? receiver_id : project.owner;
    const type = receiver_id ? "owner_invite" : "join_request";

    const invite = await Invite.create({
      project: project._id,
      sender,
      receiver,
      type,
    });

    //  populate for message
    const populatedInvite = await Invite.findById(invite._id)
      .populate("project", "project_name")
      .populate("sender", "username");

    await send_notification({
      sender,
      receiver,
      type: "invite",
      message:
        type === "owner_invite"
          ? `${populatedInvite.sender.username} invited you to ${populatedInvite.project.project_name}`
          : `${populatedInvite.sender.username} requested to join ${populatedInvite.project.project_name}`,
    });

    return res.status(200).json({
      success: true,
      message: "Invite sent",
      invite,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.get_my_invites = async (req, res) => {
  try {
    const invites = await Invite.find({
      receiver: req.user.userId,
    })
      .populate("project", "project_name description techStack")
      .populate("sender", "username email niche")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      invites,
    });
  } catch (error) {
    console.error("Get invites error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching invites",
    });
  }
};

const Project = require("../models/project");
const Invite = require("../models/invite");
const { validationResult } = require("express-validator");

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
      .populate("member", "full_name email skills niche ")
      .sort(-1);

    return res.status(201).json({
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

    // only restriction — private projects block join requests
    if (!project.isPublic && !receiver_id) {
      return res.status(403).json({
        success: false,
        message: "This project is private. You cannot request to join.",
      });
    }

    /*
      - if receiver_id is provided  → owner is inviting someone
      - if no receiver_id           → user is requesting to join, owner receives it
    */
    const sender = req.user.userId;
    const receiver = receiver_id ? receiver_id : project.owner;
    const type = receiver_id ? "owner_invite" : "join_request";

    // check if sender is already a member
    const already_member = (project.members || []).some(
      (member) => member.toString() === sender.toString()
    );
    if (already_member) {
      return res.status(409).json({
        success: false,
        message: "User is already a member of this project",
      });
    }

    // check for an existing pending invite
    const already_exists = await Invite.findOne({
      project: project._id,
      sender,
      receiver,
      type,
      status: "pending",
    });
    if (already_exists) {
      return res.status(409).json({
        success: false,
        message:
          type === "owner_invite"
            ? "Invite already sent to this user"
            : "You already have a pending join request for this project",
      });
    }

    const invite = await Invite.create({
      project: project._id,
      sender,
      receiver,
      type,
    });

    return res.status(200).json({
      success: true,
      message:
        type === "owner_invite"
          ? "Invite sent successfully"
          : "Join request sent successfully",
      invite,
    });
  } catch (error) {
    console.error("Send invite error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending invite",
    });
  }
};

// ACCEPT INVITE — this is where the user actually gets added to the project
exports.accept_invite = async (req, res) => {
  try {
    const { invite_id } = req.body;

    const invite = await Invite.findById(invite_id);
    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found",
      });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This invite has already been responded to",
      });
    }

    // only the receiver can accept
    if (invite.receiver.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this invite",
      });
    }

    const new_member =
      invite.type === "owner_invite" ? invite.receiver : invite.sender;

    await Project.findByIdAndUpdate(
      invite.project,
      { $addToSet: { members: new_member } },
      { new: true }
    );

    invite.status = "accepted";
    await invite.save();

    return res.status(200).json({
      success: true,
      message: "Invite accepted. User added to project.",
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while accepting invite",
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

exports.reject_invite = async (req, res) => {
  try {
    const { invite_id } = req.params;
    const invite = await Invite.findById(invite_id);

    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found" });
    }

    if (invite.receiver.toString() !== req.user.userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    invite.status = "rejected";
    await invite.save();

    return res.status(200).json({ success: true, message: "Invite rejected" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

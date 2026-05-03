const Invite = require("../models/invite");
const Project = require("../models/project");
const Notification = require("../models/notifications");
const User = require("../models/user");
const send_notification = require("../utils/notify");
exports.get_my_invites = async (req, res) => {
  try {
    const user_id = req.user.userId;

    // invites sent to me by an owner
    const received_invites = await Invite.find({
      receiver: user_id,
      type: "owner_invite",
    })
      .populate("project", "project_name description techStack isPublic")
      .populate("sender", "username email niche")
      .sort({ createdAt: -1 });

    // join requests I sent to projects
    const sent_requests = await Invite.find({
      sender: user_id,
      type: "join_request",
    })
      .populate("project", "project_name description techStack isPublic")
      .populate("receiver", "username email") // receiver = project owner
      .sort({ createdAt: -1 });

    // join requests sent to MY projects (I'm the owner/receiver)
    const project_requests = await Invite.find({
      receiver: user_id,
      type: "join_request",
    })
      .populate("project", "project_name description techStack")
      .populate("sender", "username email niche full_name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      received_invites, // owner invited me → I can accept/reject
      sent_requests, // I requested to join → pending owner approval
      project_requests, // someone wants to join my project → I can accept/reject
    });
  } catch (error) {
    console.error("Get invites error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching invites",
    });
  }
};

// POST /api/invite/accept
exports.accept_invite = async (req, res) => {
  try {
    const { invite_id } = req.body;
    const user_id = req.user.userId;

    const invite = await Invite.findById(invite_id)
      .populate("project", "project_name")
      .populate("sender receiver", "username");

    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found" });
    }

    if (invite.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Already handled" });
    }

    if (invite.receiver.toString() !== user_id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const new_member =
      invite.type === "owner_invite" ? invite.receiver : invite.sender;

    await Project.findByIdAndUpdate(invite.project._id, {
      $addToSet: { members: new_member },
    });

    invite.status = "accepted";
    await invite.save();

    //  correct receiver logic
    const notifyUser =
      invite.type === "owner_invite"
        ? invite.sender // owner gets notified
        : invite.receiver; // owner gets notified

    await send_notification({
      sender: user_id,
      receiver: notifyUser,
      type: "invite_accept",
      message: `${invite.project.project_name} invite accepted`,
    });

    return res.status(200).json({
      success: true,
      message: "Invite accepted",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/invite/reject
exports.reject_invite = async (req, res) => {
  try {
    const { invite_id } = req.params;
    const user_id = req.user.userId;

    const invite = await Invite.findById(invite_id)
      .populate("project", "project_name")
      .populate("sender receiver", "username");

    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found" });
    }

    if (invite.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Already handled" });
    }

    if (invite.receiver.toString() !== user_id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    invite.status = "rejected";
    await invite.save();

    const notifyUser =
      invite.type === "owner_invite" ? invite.sender : invite.receiver;

    await send_notification({
      sender: user_id,
      receiver: notifyUser,
      type: "invite_reject",
      message: `${invite.project.project_name} invite rejected`,
    });

    return res.status(200).json({
      success: true,
      message: "Invite rejected",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

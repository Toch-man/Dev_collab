const Invite = require("../models/invite");
const Project = require("../models/project");

// GET /api/invite/my_invites
// Returns:
//   - invites sent TO me (owner invited me to their project)
//   - join requests I sent (I requested to join a project)
//   - join requests sent TO my projects (I'm the owner, someone wants to join)
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

    const invite = await Invite.findById(invite_id);
    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found" });
    }

    if (invite.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Invite already responded to" });
    }

    // only the receiver can accept
    if (invite.receiver.toString() !== user_id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to accept this invite",
      });
    }

    // figure out who actually joins the project
    // owner_invite → receiver (the invited user) joins
    // join_request → sender (the user who requested) joins
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/invite/reject
exports.reject_invite = async (req, res) => {
  try {
    const { invite_id } = req.params;
    const user_id = req.user.userId;

    const invite = await Invite.findById(invite_id);
    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found" });
    }

    if (invite.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Invite already responded to" });
    }

    if (invite.receiver.toString() !== user_id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reject this invite",
      });
    }

    invite.status = "rejected";
    await invite.save();

    return res.status(200).json({ success: true, message: "Invite declined." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

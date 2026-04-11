const Project = require("../models/project");
const { validationResult } = require("express-validator");

exports.get_project = async (req, res) => {
  const all_project = Project.find({
    $or: [{ owner: req.user._id }, { team: req.user._id }],
  })
    .populate("owner", "name email")
    .populate("team", "name email")
    .sort(-1);

  return res.status(201).json({
    success: true,
    message: "fetched all projects",
    access_token,
    total_project: all_project,
  });
};
exports.get_single_project = async (req, res) => {
  try {
    const project = Project.findOne({ project_name });
    if (!project) {
      return res.status(401).json({
        success: false,
        message: "project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "successful",
      access_token,
      project: project,
    });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({
      success: false,
      message: `$error`,
    });
  }
};

exports.create_project = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty) {
    return res.status(500).json({
      success: false,
      errors: error.array,
    });
  }
  try {
    const project = await Project.create({
      ...req.body,
      owner: req.user._id,
    });
    await project.save();
    const access_token = jwt.sign(
      {
        userId: new_user._id,
        email: new_user.email,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(201).json({
      success: true,
      message: "project created successfully",
      access_token,
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

exports.add_member = async (req, res) => {
  const { project_id } = req.param;
  const { user_id } = req.body;
  await project.findByIdAndUpdate(
    project_id,
    {
      $addToSet: { members: user_id },
    },
    { new: true }
  );
};

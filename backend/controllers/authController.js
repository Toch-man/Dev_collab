const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.sign_up = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const errors = error.array();
    return res.status(400).json({
      success: false,
      message: errors[0].msg,
      errors: errors, // full list of all errors
    });
  }

  try {
    const { username, email, password } = req.body;
    const existing_user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existing_user) {
      const already_exist =
        existing_user.email === email ? "email" : "username";
      return res.status(409).json({
        success: false,
        message: `${already_exist} already exists`,
      });
    }

    const hashed_password = await bcrypt.hash(password, 12);

    const new_user = new User({
      ...req.body,
      password: hashed_password,
    });

    await new_user.save();

    const access_token = jwt.sign(
      {
        userId: new_user._id,
        email: new_user.email,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: new_user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    new_user.refreshToken = refreshToken;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      access_token,
      user: new_user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: error.array(),
    });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "email not found",
      });
    }

    const is_match = await bcrypt.compare(password, user.password);
    if (!is_match) {
      return res.status(401).json({
        success: false,
        message: "incorrect password",
      });
    }

    const access_token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      access_token,
      user: user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};
exports.google_callback = async (req, res) => {
  const user = req.user;

  const access_token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  user.refreshToken = refreshToken;

  const one_time_code = crypto.randomBytes(32).toString("hex");
  user.one_time_code = one_time_code;
  user.one_time_code_expires = Date.now() + 60 * 1000;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${process.env.CLIENT_URL}/auth/callback?code=${one_time_code}`);
};

exports.exchange_code = async (req, res) => {
  const { code } = req.body;
  const user = User.findOne({
    one_time_code: code,
    one_time_code_expires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "invalid or expired code" });
  }
  user.one_time_code = null;
  user.one_time_code_expires = null;
  await user.save();

  const access_token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  return res.status(200).json({ success: true, access_token });
};
exports.get_all_users = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "full_name username email niche bio skills role"
    );
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

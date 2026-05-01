const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const { Resend } = require("resend");

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
  const user = await User.findOne({
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

  return res.status(200).json({
    success: true,
    access_token,
    user: {
      _id: user._id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      niche: user.niche,
      bio: user.bio,
      skills: user.skills,
    },
  });
};
exports.get_all_users = async (req, res) => {
  try {
    const { niche } = req.query;

    const query = niche ? { niche: { $regex: niche, $options: "i" } } : {};

    const users = await User.find(
      query,
      "full_name username email niche bio skills role"
    );

    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgot_password = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);
    console.log(
      "All env keys:",
      Object.keys(process.env).filter((k) => k.includes("RESEND"))
    );

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "if email exists check email for reset link",
      });
    }

    const raw_token = crypto.randomBytes(32).toString("hex");
    const hashed_token = crypto
      .createHash("sha256")
      .update(raw_token)
      .digest("hex");

    user.reset_token = hashed_token;
    user.reset_token_expires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const reset_url = `${
      process.env.CLIENT_URL
    }/auth/reset_password?token=${raw_token}&email=${encodeURIComponent(
      email
    )}`;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: email_error } = await resend.emails.send({
      from: "DevCollab <onboarding@resend.dev>", // use this until you verify a domain
      to: email,
      subject: "Reset your DevCollab password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #15803d;">Reset your password</h2>
          <p>You requested a password reset for your DevCollab account.</p>
          <p>Click the button below — the link expires in <strong>30 minutes</strong>.</p>
          <a href="${reset_url}"
            style="display:inline-block;margin:16px 0;padding:12px 24px;background:#15803d;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
            Reset password
          </a>
          <p style="color:#6b7280;font-size:13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color:#6b7280;font-size:12px;">
            Or copy this link: ${reset_url}
          </p>
        </div>
      `,
    });

    return res
      .status(200)
      .json({ success: true, message: "reset sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.reset_password = async (req, res) => {
  const { token, email, new_password } = req.body;

  const hashed_token = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    email,
    reset_token: hashed_token,
    reset_token_expires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired reset link" });
  }

  user.password = await bcrypt.hash(new_password, 12);
  user.reset_token = null;
  user.reset_token_expires = null;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Password reset successfully" });
};

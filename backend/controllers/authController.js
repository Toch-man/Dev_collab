const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const jwt = require("jsonwebtoken");

exports.sign_up = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(404).json({
      success: false,
      errors: error.array(),
    });
  }

  try {
    const { username, email, password, full_name, niche } = req.body;
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
      username,
      email,
      password: hashed_password,
      full_name,
      niche,
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
    await new_user.save();

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
      user: {
        id: new_user._id,
        username: new_user.username,
        email: new_user.email,
        niche: new_user.niche,
      },
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
      return res.status(401).json({
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

    const refresh_token = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refresh_token = refresh_token;
    await user.save();
    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      access_token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        wallet: user.wallet,
      },
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
  const refresh_token = req.cookies.refreshToken;

  if (!refresh_token) {
    return res.status(401).json({
      success: false,
      message: "No refresh token",
    });
  }

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refresh_token !== refresh_token) {
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

const jwt = require("jsonwebtoken");

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

exports.is_admin = async (req, res, next) => {
  if (req.user.role == "admin") {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "only admin can do this",
  });
};

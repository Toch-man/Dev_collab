const router = require("express").Router();
const { body } = require("express-validator");
const auth_controller = require("../controllers/authController");
const { verify_token } = require("../middleware/auth");
const passport = require("../config/google_passport");
const { google_callback } = require("../controllers/authController");

const signup_validation = [
  body("username").trim().isLength({ min: 3, max: 30 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("role").isIn(["buyer", "seller"]),
];

const login_validation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.post("/sign_up", signup_validation, auth_controller.sign_up);
router.post("/login", login_validation, auth_controller.login);
router.post("/refresh_token", auth_controller.refreshToken);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  google_callback
);

module.exports = router;

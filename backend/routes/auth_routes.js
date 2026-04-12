const router = require("express").Router();
const { body } = require("express-validator");
const auth_controller = require("../controllers/authController");
const { verify_token } = require("../middleware/auth");

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

router.post("/sign_up", auth_controller.sign_up, signup_validation);
router.post("login", auth_controller.login, login_validation);
router.post("/refresh_token", auth_controller.refreshToken);

module.exports = router;

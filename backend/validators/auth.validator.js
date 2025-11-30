const { body } = require("express-validator");

exports.registerValidator = [
  body("name").notEmpty().withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars"),

  body("phone")
    .notEmpty().withMessage("Phone number is required"),

  body("role")
    .optional()
    .isIn(["admin", "trainer", "student"])
    .withMessage("Invalid role")
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required")
];

exports.forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email required")
];

exports.resetPasswordValidator = [
  body("token").notEmpty().withMessage("Token required"),
  body("new_password")
    .isLength({ min: 6, max: 16 })
    .withMessage("New password must be at least 6 chars")
];

exports.changePasswordValidator = [
  body("old_password").notEmpty().withMessage("Old password required"),
  body("new_password")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 chars")
];

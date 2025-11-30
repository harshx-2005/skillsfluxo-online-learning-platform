const { body } = require("express-validator");

exports.updateProfileValidator = [
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone"),

  body("name")
    .optional()
    .isString()
    .withMessage("Name must be string")
];

exports.deleteAccountValidator = [];

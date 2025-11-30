const { body } = require("express-validator");

exports.uploadVideoValidator = [
  body("name").notEmpty().withMessage("Video name is required"),
  body("course_id")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("course_id must be numeric"),
  body("batch_id")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("batch_id must be numeric")
];

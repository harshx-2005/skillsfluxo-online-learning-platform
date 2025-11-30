const { body } = require("express-validator");

exports.createBatchValidator = [
  body("title").notEmpty().withMessage("Batch title required"),
  body("course_id")
    .isNumeric()
    .withMessage("course_id must be numeric"),
  body("start_date").optional().isISO8601(),
  body("end_date").optional().isISO8601()
];

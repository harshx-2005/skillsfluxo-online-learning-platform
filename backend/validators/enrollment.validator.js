const { body } = require("express-validator");

exports.assignStudentValidator = [
  body("student_id").isNumeric().withMessage("user_id must be numeric"),
  body("course_id").isNumeric().withMessage("course_id must be numeric"),
  body("batch_id").isNumeric().withMessage("batch_id must be numeric")
];

exports.assignTrainerValidator = [
  body("trainer_id").isNumeric().withMessage("user_id must be numeric"),
  body("course_id").isNumeric().withMessage("course_id must be numeric"),
  body("batch_id").isNumeric().withMessage("batch_id must be numeric")
];

exports.studentEnrollmentRequestValidator = [
  body("course_id").isNumeric().withMessage("course_id required")
];

const { body } = require('express-validator');

exports.removeStudentCourseValidator = [
  body("student_id")
    .notEmpty().withMessage("student_id is required")
    .isInt(),

  body("course_id")
    .notEmpty().withMessage("course_id is required")
    .isInt()
];

exports.removeStudentBatchValidator = [
  body("student_id")
    .notEmpty().withMessage("student_id is required")
    .isInt(),

  body("batch_id")
    .notEmpty().withMessage("batch_id is required")
    .isInt()
];

exports.removeTrainerCourseValidator = [
  body("trainer_id")
    .notEmpty().withMessage("trainer_id is required")
    .isInt(),

  body("course_id")
    .notEmpty().withMessage("course_id is required")
    .isInt()
];

exports.removeTrainerBatchValidator = [
  body("trainer_id")
    .notEmpty().withMessage("trainer_id is required")
    .isInt(),

  body("batch_id")
    .notEmpty().withMessage("batch_id is required")
    .isInt()
];

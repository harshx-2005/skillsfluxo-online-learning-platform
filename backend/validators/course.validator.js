const { body } = require("express-validator");

exports.createCourseValidator = [
  body("name").notEmpty().withMessage("Course name required"),
  body("description").optional().isString()
];

const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller").verifyToken;
const { allowRoles } = require("../middleware/role.middleware");
const courseController = require("../controllers/course.controller");

const { createCourseValidator } = require("../validators/course.validator");
const validate = require("../middleware/validate");

// PUBLIC
router.get("/public", auth, courseController.getPublicCourses);

// LIST ALL
router.get("/all", auth, courseController.getCourses);

// GET ONE
router.get("/:id", auth, courseController.getCourseById);

module.exports = router;

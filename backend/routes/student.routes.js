// routes/student.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller").verifyToken;
const { allowRoles } = require("../middleware/role.middleware");
const studentController = require("../controllers/student.controller");

// All student routes
router.use(auth, allowRoles("student"));

// Dashboard
router.get("/dashboard", studentController.getDashboard);

// My courses
router.get("/courses", studentController.getMyCourses);

// My requests
router.get("/my-requests", studentController.getMyEnrollmentRequests);

// My batch
router.get("/batch", studentController.getMyBatch);

// My trainer
router.get("/my-trainer", studentController.getMyTrainer);

// Request Enrollment
router.post("/enroll/:courseId", studentController.enroll);

// All Courses
router.get("/all-courses", studentController.getAllCourses);

// Course Content
router.get("/course/:courseId/content", studentController.getCourseContent);

// Default Videos (Home Page)
router.get("/default-videos", studentController.getDefaultVideos);

module.exports = router;

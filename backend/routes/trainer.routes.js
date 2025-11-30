// routes/trainer.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller").verifyToken;
const { allowRoles } = require("../middleware/role.middleware");
const trainerController = require("../controllers/trainer.controller");

// All trainer routes
router.use(auth, allowRoles("trainer"));

// Trainer dashboard summary
router.get("/dashboard", trainerController.getDashboard);

// Trainer → My courses
router.get("/courses", trainerController.getMyCourses);

// Trainer → My batches
router.get("/batches", trainerController.getMyBatches);

// Trainer → Students in a specific batch
router.get("/batches/:batch_id/students", trainerController.getBatchStudents);

// Trainer → Videos in a specific batch
router.get("/batches/:batch_id/videos", trainerController.getBatchVideos);

// Trainer → All Courses (Read Only)
router.get("/all-courses", trainerController.getAllCourses);

// Trainer → Uploaded Videos
router.get("/uploaded-videos", trainerController.getUploadedVideos);

module.exports = router;

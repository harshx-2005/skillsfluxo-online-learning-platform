// routes/admin.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller").verifyToken;
const { allowRoles } = require("../middleware/role.middleware");
const adminController = require("../controllers/admin.controller");
const validate = require("../middleware/validate");
const { removeStudentCourseValidator,
    removeStudentBatchValidator,
    removeTrainerCourseValidator,
    removeTrainerBatchValidator
} = require("../validators/admin.validator");

// All routes here require ADMIN
router.use(auth, allowRoles("admin"));

// Dashboard metrics
router.get("/dashboard", adminController.getDashboard);

// Students
router.get("/students", adminController.getStudents);
router.get("/students/:id", adminController.getStudentById);

// Trainers
router.get("/trainers", adminController.getTrainers);
router.get("/trainers/:id", adminController.getTrainerById);

// Activate / Deactivate any user (student or trainer)
router.patch("/users/:id/status", adminController.updateUserStatus);

/* ======================================================
   🗑️ ADMIN → Remove Student Course
====================================================== */
router.post(
    "/student/remove-course",
    auth,
    allowRoles("admin"),
    adminController.removeStudentCourse
);

/* ======================================================
   🗑️ ADMIN → Remove Student Batch
====================================================== */
router.post(
    "/student/remove-batch",
    auth,
    allowRoles("admin"),
    adminController.removeStudentBatch
);

/* ======================================================
   🗑️ ADMIN → Remove Trainer Course
====================================================== */
router.post(
    "/trainer/remove-course",
    auth,
    allowRoles("admin"),
    adminController.removeTrainerCourse
);

/* ======================================================
   🗑️ ADMIN → Remove Trainer Batch
====================================================== */
router.post(
    "/trainer/remove-batch",
    auth,
    allowRoles("admin"),
    adminController.removeTrainerBatch
);

// Reassign User (Switch Batch/Course)
router.put("/reassign-user", auth, allowRoles("admin"), adminController.reassignUser);

module.exports = router;

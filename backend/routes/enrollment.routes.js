const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller").verifyToken;
const { allowRoles } = require("../middleware/role.middleware");
const enrollmentController = require("../controllers/enrollment.controller");

const {
  assignStudentValidator,
  assignTrainerValidator,
  studentEnrollmentRequestValidator
} = require("../validators/enrollment.validator");

const validate = require("../middleware/validate");

// STUDENT → enrollment request
router.post(
  "/enrollment-request",
  auth,
  allowRoles("student"),
  studentEnrollmentRequestValidator,
  validate,
  enrollmentController.enrollmentRequest
);

// ADMIN → assign student
router.post(
  "/student-assign",
  auth,
  allowRoles("admin"),
  assignStudentValidator,
  validate,
  enrollmentController.assignStudentCourseBatch
);

// ADMIN → assign trainer (uses same validator? you didn't provide trainer one)
router.post(
  "/trainer-assign",
  auth,
  allowRoles("admin"),
  assignTrainerValidator,  // SAME VALIDATOR APPLIES
  validate,
  enrollmentController.assignTrainerCourseBatch
);

router.get(
  "/requests",
  auth,
  allowRoles("admin"),
  enrollmentController.getAllRequests
);

router.post(
  "/approve",
  auth,
  allowRoles("admin"),
  enrollmentController.approveRequest
);

router.post(
  "/reject",
  auth,
  allowRoles("admin"),
  enrollmentController.rejectRequest
);


module.exports = router;

// routes/export.routes.js
const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller").verifyToken;
const { allowRoles } = require("../middleware/role.middleware");
const exportController = require("../controllers/export.controller");

// All exports are admin-only
router.get(
  "/students",
  auth,
  allowRoles("admin"),
  exportController.exportAllStudents
);

router.get(
  "/trainers",
  auth,
  allowRoles("admin"),
  exportController.exportAllTrainers
);

router.get(
  "/courses",
  auth,
  allowRoles("admin"),
  exportController.exportCourses
);

router.get(
  "/batches",
  auth,
  allowRoles("admin"),
  exportController.exportBatches
);

// Multi-sheet dashboard workbook
router.get(
  "/dashboard",
  auth,
  allowRoles("admin"),
  exportController.exportDashboardWorkbook
);

module.exports = router;

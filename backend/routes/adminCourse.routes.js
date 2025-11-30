const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller").verifyToken;
const { allowRoles } = require("../middleware/role.middleware");
const adminCourse = require("../controllers/adminCourse.controller");

router.use(auth, allowRoles("admin"));

const uploadImage = require("../utils/uploadImage");

// COURSE CRUD
router.post("/course", uploadImage.single("thumbnail"), adminCourse.createCourse);
router.get("/course", adminCourse.getCourses);
router.get("/course/:id", adminCourse.getCourseById);
router.patch("/course/:id", uploadImage.single("thumbnail"), adminCourse.updateCourse);
router.delete("/course/:id", adminCourse.deleteCourse);
router.patch("/course/:id/approve", adminCourse.approveCourse);
router.get("/course/:id/details", adminCourse.getCourseWithBatches);


// BATCH CRUD
router.post("/batch", adminCourse.createBatch);
router.get("/batch", adminCourse.getBatches);
router.get("/batch/:id", adminCourse.getBatchById);
router.patch("/batch/:id", adminCourse.updateBatch);
router.delete("/batch/:id", adminCourse.deleteBatch);



// course-scoped batches
router.get("/course/:courseId/batches", adminCourse.getBatchesByCourse);
router.post("/course/:courseId/batches", adminCourse.createBatchForCourse);

// update/delete batch (id-based)
router.patch("/batch/:id", adminCourse.updateBatch);
router.delete("/batch/:id", adminCourse.deleteBatch);

module.exports = router;



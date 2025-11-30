const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller").verifyToken;
const { allowRoles } = require("../middleware/role.middleware");
const { trainerCourseBatchAccess } = require("../middleware/trainerCourseAccess");
const videoController = require("../controllers/video.controller");
const uploadVideo = require("../utils/uploadVideo");

const { uploadVideoValidator } = require("../validators/video.validator");
const validate = require("../middleware/validate");

// ADMIN DEFAULT UPLOAD
/*router.post(
  "/upload/default",
  auth,
  allowRoles("admin"),
  uploadVideo.single("video"),
  uploadVideoValidator,
  validate,
  videoController.uploadDefaultVideo
);

// TRAINER/ADMIN COURSE VIDEO UPLOAD
router.post(
  "/upload",
  auth,
  allowRoles("admin", "trainer"),
  uploadVideo.single("video"),
  uploadVideoValidator,
  validate,
  trainerCourseBatchAccess,
  videoController.uploadCourseVideo
);*/

router.post(
  "/upload/default",
  auth,
  allowRoles("admin"),
  uploadVideo.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }   // OPTIONAL – if you want default video to have thumbnail
  ]),
  uploadVideoValidator,
  validate,
  videoController.uploadDefaultVideo
);

router.post(
  "/upload",
  auth,
  allowRoles("admin", "trainer"),
  uploadVideo.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  uploadVideoValidator,
  validate,
  trainerCourseBatchAccess,
  videoController.uploadCourseVideo
);


// GET DEFAULT VIDEOS
router.get("/getDefault", auth, allowRoles("admin", "trainer", "student"), videoController.getDefaultVideos);
// STUDENT
router.get("/student", auth, allowRoles("student"), videoController.getStudentVideos);
// TRAINER
router.get("/trainer", auth, allowRoles("trainer"), videoController.getTrainerVideos);
// ADMIN
router.get("/admin/all", auth, allowRoles("admin"), videoController.getAllVideosAdmin);
// COURSE
router.get("/course/:course_id", auth, allowRoles("admin", "trainer"), videoController.getVideosByCourse);
// BATCH
router.get("/batch/:batch_id", auth, allowRoles("admin", "trainer"), videoController.getVideosByBatch);
// SEARCH
router.get("/search", auth, allowRoles("admin", "trainer"), videoController.searchVideos);
// EDIT
router.put(
  "/edit/:video_id",
  auth,
  allowRoles("admin", "trainer"),
  uploadVideo.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  videoController.editVideo
);
// DELETE
router.delete("/delete/:video_id", auth, allowRoles("admin", "trainer"), videoController.deleteVideo);
// VIEW STRICT ACCESS
router.get("/view/:video_id", auth, allowRoles("admin", "trainer", "student"), videoController.getVideoById);

module.exports = router;

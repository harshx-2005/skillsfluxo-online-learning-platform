const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller").verifyToken;
const upload = require("../middleware/localUpload");
const profile = require("../controllers/profile.controller");
const profileController = require("../controllers/profile.controller");
const validate = require("../middleware/validate");
const { updateProfileValidator } = require("../validators/profile.validator");

// UPDATE PROFILE
const uploadProfile = require("../utils/uploadProfile");

router.patch(
  "/update",
  auth,
  uploadProfile.fields([
    { name: "resume", maxCount: 1 },
    { name: "profile_pic", maxCount: 1 }
  ]),
  profileController.updateProfile
);

// GET RESUME
router.get("/resume", auth, profile.getResume);

// GET PROFILE PIC
router.get("/profile-pic", auth, profile.getProfilePic);

// DELETE ACCOUNT (soft delete)
router.delete("/delete", auth, profile.deleteAccountDirect);

module.exports = router;

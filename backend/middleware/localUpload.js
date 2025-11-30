const multer = require("multer");
const path = require("path");

// Local storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.body.type === "resume") {
      cb(null, "uploads/resumes/");
    } else {
      cb(null, "uploads/profile_pics/");
    }
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fileName = req.user.id + "_" + Date.now() + ext;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

module.exports = upload;

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folders exist
const resumePath = path.join(__dirname, "../uploads/resumes");
const profilePicPath = path.join(__dirname, "../uploads/profile_pics");

if (!fs.existsSync(resumePath)) fs.mkdirSync(resumePath, { recursive: true });
if (!fs.existsSync(profilePicPath)) fs.mkdirSync(profilePicPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "resume") return cb(null, resumePath);
    if (file.fieldname === "profile_pic") return cb(null, profilePicPath);
    cb(null, resumePath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error("Invalid file type"), false);
};

module.exports = multer({ storage, fileFilter });

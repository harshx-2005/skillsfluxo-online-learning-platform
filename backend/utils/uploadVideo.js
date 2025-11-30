
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, "../uploads/videos");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer storage (LOCAL TEMP FILE)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// Allow VIDEO + IMAGE (for thumbnail)
const fileFilter = (req, file, cb) => {

    const allowedVideos = [
        "video/mp4",
        "video/mkv",
        "video/avi",
        "video/mov",
        "video/webm"
    ];

    const allowedImages = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowedVideos.includes(file.mimetype)) {
        return cb(null, true);
    }

    if (allowedImages.includes(file.mimetype)) {
        return cb(null, true);
    }

    return cb(new Error("Only video or thumbnail image files allowed"), false);
};

const uploadVideo = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 300 * 1024 * 1024 } // 300MB
});

module.exports = uploadVideo;

require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connection = require('./config/db');

// --------------------------
// CORS STRATEGIC CONFIG
// --------------------------
const allowedOrigins = [
  "https://skillsfluxo-online-learning-platfor.vercel.app",
  "http://localhost:5173"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// --------------------------
// BACKEND LIFECYCLE
// --------------------------
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

// --------------------------
// TEST ENDPOINT
// --------------------------
app.get("/test-db", (req, res) => {
  connection.query("SELECT 1", (err, result) => {
    if (err) return res.send({ status: "error", error: err });
    res.send({ status: "ok", result });
  });
});

// --------------------------
// CORE MIDDLEWARE
// --------------------------
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------
// ROUTING MATRIX
// --------------------------
const indexRouter = require('./routes/auth.routes');
const courseRouter = require('./routes/course.routes');
const authRouter = require('./routes/auth.routes');
const enrollmentRoutes = require("./routes/enrollment.routes");
const videoRoutes = require("./routes/video.routes");
const profileRoutes = require("./routes/profile.routes");
const adminRoutes = require("./routes/admin.routes");
const trainerRoutes = require("./routes/trainer.routes");
const studentRoutes = require("./routes/student.routes");
const adminCourses = require("./routes/adminCourse.routes");
const exportRoutes = require("./routes/export.routes");

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/course', courseRouter);
app.use("/api/enroll", enrollmentRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/adminCourse", adminCourses);
app.use("/api/admin/export", exportRoutes);

module.exports = app;

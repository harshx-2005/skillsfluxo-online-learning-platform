require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const connection = require('./config/db');

// CORS FIX for Vercel
app.use(
  cors({
    origin: [
      "https://skillsfluxo-online-learning-platfor.vercel.app",
      "http://localhost:5173"
    ],
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
  })
);
app.options("*", cors());

// Server start
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
  console.log("PM2 name =>", process.env.name);
});

// Test DB
app.get("/test-db", (req, res) => {
  connection.query("SELECT 1", (err, result) => {
    if (err) return res.send({ status: "error", error: err });
    res.send({ status: "ok", result });
  });
});

// ROUTES
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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
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

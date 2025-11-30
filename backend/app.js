// Trigger restart
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const connection = require('./config/db');
require('dotenv').config();



app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
  console.log("PM2 name =>", process.env.name);

});
// Load scheduler ONLY for primary instance
/*if (process.env.name === "primary" || process.env.name === "dev-primary") {
  console.log("⏰ Scheduler Enabled for PRIMARY");
  require("./scheduler/dailyReport");
} else {
  console.log("⛔ Scheduler Disabled for Replica");
}*/

app.get("/test-db", (req, res) => {
  connection.query("SELECT 1", (err, result) => {
    if (err) return res.send({ status: "error", error: err });
    res.send({ status: "ok", result });
  });
});





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
app.use(cors());

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

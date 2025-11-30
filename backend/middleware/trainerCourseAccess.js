// middleware/trainerCourseAccess.js
const db = require("../config/db");

module.exports = {
  trainerCourseBatchAccess: (req, res, next) => {
    const user = req.user; // from JWT
    const userId = user.id;
    const role = user.role;

    const courseId = req.body.course_id || req.params.course_id;
    const batchId = req.body.batch_id || req.params.batch_id;

    if (!courseId || !batchId) {
      return res.status(400).send({
        message: "course_id and batch_id are required for this action"
      });
    }

    // Admin can do anything
    if (role === "admin") {
      return next();
    }

    if (role !== "trainer") {
      return res.status(403).send({
        message: "Only trainers or admins can perform this action"
      });
    }

    const sql = `
      SELECT id FROM user_course_batch
      WHERE user_id = ?
      AND course_id = ?
      AND batch_id = ?
    `;

    db.query(sql, [userId, courseId, batchId], (err, rows) => {
      if (err) {
        console.log("trainerCourseBatchAccess error:", err);
        return res.send(err);
      }

      if (rows.length === 0) {
        return res.status(403).send({
          message: "You are not assigned to this course + batch"
        });
      }

      next();
    });
  }
};


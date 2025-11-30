// controllers/trainer.controller.js
const db = require("../config/db");

module.exports = {
  // Trainer Dashboard Summary
  getDashboard: (req, res) => {
    const trainer_id = req.user.id;
    const data = {};

    const q1 = `
      SELECT COUNT(*) AS total_batches
      FROM user_course_batch
      WHERE user_id = ?
    `;

    const q2 = `
      SELECT COUNT(*) AS total_videos
      FROM videos
      WHERE uploaded_by = ?
    `;

    const q3 = `
      SELECT COUNT(DISTINCT ucb.user_id) AS total_students
      FROM user_course_batch ucb
      JOIN users u ON u.id = ucb.user_id
      WHERE ucb.batch_id IN (
        SELECT batch_id FROM user_course_batch WHERE user_id = ?
      )
      AND u.role = 'student'
    `;

    db.query(q1, [trainer_id], (err1, r1) => {
      if (err1) return res.status(500).send(err1);
      data.total_batches = r1[0].total_batches;

      db.query(q2, [trainer_id], (err2, r2) => {
        if (err2) return res.status(500).send(err2);
        data.total_videos = r2[0].total_videos;

        db.query(q3, [trainer_id], (err3, r3) => {
          if (err3) return res.status(500).send(err3);
          data.total_students = r3[0].total_students;

          return res.send(data);
        });
      });
    });
  },

  // Trainer → My Courses
  getMyCourses: (req, res) => {
    const trainer_id = req.user.id;

    const sql = `
      SELECT c.id, c.name, c.description
      FROM user_courses uc
      JOIN courses c ON c.id = uc.course_id
      WHERE uc.user_id = ? AND uc.role_in_course = 'trainer'
    `;

    db.query(sql, [trainer_id], (err, rows) => {
      if (err) return res.status(500).send(err);

      return res.send({
        total: rows.length,
        courses: rows
      });
    });
  },

  // Trainer → My Batches (with optional course_id filter)
  getMyBatches: (req, res) => {
    const trainer_id = req.user.id;
    const course_id = req.query.course_id;

    let sql = `
      SELECT 
        ucb.batch_id,
        b.title AS batch_title,
        b.start_date,
        b.end_date,
        ucb.course_id,
        c.name AS course_name
      FROM user_course_batch ucb
      JOIN batches b ON b.id = ucb.batch_id
      JOIN courses c ON c.id = ucb.course_id
      WHERE ucb.user_id = ?
    `;

    const params = [trainer_id];

    if (course_id) {
      sql += ` AND ucb.course_id = ?`;
      params.push(course_id);
    }

    sql += ` ORDER BY b.id DESC`;

    db.query(sql, params, (err, rows) => {
      if (err) return res.status(500).send(err);

      return res.send({
        total: rows.length,
        batches: rows
      });
    });
  },

  // Trainer → Students in a batch
  getBatchStudents: (req, res) => {
    const trainer_id = req.user.id;
    const batch_id = req.params.batch_id;

    // First: check trainer has this batch
    const checkSql = `
      SELECT * FROM user_course_batch
      WHERE user_id = ? AND batch_id = ?
    `;

    db.query(checkSql, [trainer_id, batch_id], (err, rows) => {
      if (err) return res.status(500).send(err);

      if (rows.length === 0) {
        return res.status(403).send({ message: "Not your batch" });
      }

      const course_id = rows[0].course_id;

      const studentSql = `
        SELECT u.id, u.name, u.email, u.phone, u.profile_pic
        FROM user_course_batch ucb
        JOIN users u ON u.id = ucb.user_id
        WHERE ucb.batch_id = ? AND ucb.course_id = ? AND u.role = 'student'
      `;

      db.query(studentSql, [batch_id, course_id], (err2, students) => {
        if (err2) return res.status(500).send(err2);

        return res.send({
          batch_id,
          course_id,
          total_students: students.length,
          students
        });
      });
    });
  },

  // Trainer → Videos in a batch
  getBatchVideos: (req, res) => {
    const trainer_id = req.user.id;
    const batch_id = req.params.batch_id;

    // First: check trainer has this batch
    const checkSql = `
      SELECT * FROM user_course_batch
      WHERE user_id = ? AND batch_id = ?
    `;

    db.query(checkSql, [trainer_id, batch_id], (err, rows) => {
      if (err) return res.status(500).send(err);

      if (rows.length === 0) {
        return res.status(403).send({ message: "Not your batch" });
      }

      // Fetch videos for this batch
      const videoSql = `
        SELECT * FROM videos
        WHERE batch_id = ?
        ORDER BY id ASC
      `;

      db.query(videoSql, [batch_id], (err2, videos) => {
        if (err2) return res.status(500).send(err2);

        return res.send({
          batch_id,
          total_videos: videos.length,
          videos
        });
      });
    });
  },

  // Trainer → All Courses (Read Only)
  getAllCourses: (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let sql = `SELECT * FROM courses WHERE is_active = 1`;
    if (search) {
      sql += ` AND (name LIKE '%${search}%' OR description LIKE '%${search}%')`;
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    let countSql = `SELECT COUNT(*) as total FROM courses WHERE is_active = 1`;
    if (search) {
      countSql += ` AND (name LIKE '%${search}%' OR description LIKE '%${search}%')`;
    }

    db.query(countSql, (err, countResult) => {
      if (err) return res.status(500).send(err);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      db.query(sql, (err2, rows) => {
        if (err2) return res.status(500).send(err2);
        return res.send({
          courses: rows,
          totalPages,
          currentPage: page,
          totalCourses: total
        });
      });
    });
  },

  // Trainer → Uploaded Videos
  getUploadedVideos: (req, res) => {
    const trainer_id = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let sql = `
      SELECT v.*, c.name as course_name, b.title as batch_title 
      FROM videos v
      LEFT JOIN courses c ON v.course_id = c.id
      LEFT JOIN batches b ON v.batch_id = b.id
      WHERE v.uploaded_by = ?
    `;

    if (search) {
      sql += ` AND (v.title LIKE '%${search}%' OR v.description LIKE '%${search}%')`;
    }
    sql += ` ORDER BY v.id DESC LIMIT ${limit} OFFSET ${offset}`;

    let countSql = `SELECT COUNT(*) as total FROM videos WHERE uploaded_by = ?`;
    if (search) {
      countSql += ` AND (title LIKE '%${search}%' OR description LIKE '%${search}%')`;
    }

    db.query(countSql, [trainer_id], (err, countResult) => {
      if (err) return res.status(500).send(err);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      db.query(sql, [trainer_id], (err2, rows) => {
        if (err2) return res.status(500).send(err2);
        return res.send({
          videos: rows,
          totalPages,
          currentPage: page,
          totalVideos: total
        });
      });
    });
  }
};

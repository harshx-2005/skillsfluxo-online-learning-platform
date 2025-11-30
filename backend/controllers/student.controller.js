// controllers/student.controller.js
const db = require("../config/db");

module.exports = {
  // Student Dashboard
  // Student Dashboard (Consolidated)
  getDashboard: async (req, res) => {
    const student_id = req.user.id;
    const data = {};

    try {
      // 1. Stats
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM user_courses WHERE user_id = ? AND role_in_course = 'student') as total_courses,
          (SELECT COUNT(*) FROM user_course_batch WHERE user_id = ?) as total_batches,
          (SELECT COUNT(*) FROM videos v WHERE (v.course_id, v.batch_id) IN (SELECT course_id, batch_id FROM user_course_batch WHERE user_id = ?)) as total_videos
      `;

      // 2. My Courses
      const myCoursesQuery = `
        SELECT c.id, c.name, c.description, c.thumbnail
        FROM user_courses uc
        JOIN courses c ON c.id = uc.course_id
        WHERE uc.user_id = ? AND uc.role_in_course = 'student' AND c.is_active = 1
      `;

      // 3. All Courses (Explore)
      const allCoursesQuery = `SELECT * FROM courses WHERE is_active = 1 AND is_approved = 1 ORDER BY created_at DESC`;

      // 4. My Requests
      const myRequestsQuery = `SELECT * FROM enrollment_requests WHERE student_id = ?`;

      // 5. Default Videos (Recommended)
      const defaultVideosQuery = `
        SELECT v.*, c.name AS course_name, c.thumbnail AS course_thumbnail
        FROM videos v
        LEFT JOIN courses c ON c.id = v.course_id
        WHERE v.is_default = 1 AND v.is_active = 1
        ORDER BY v.created_at DESC
        LIMIT 10
      `;

      // Execute queries in parallel (using Promise.all with db.query wrapped in promises would be ideal, but for now nesting/sequential or a helper is needed if db.query doesn't return promise)
      // Since the current db setup seems to use callbacks, I'll use a cleaner async/await wrapper approach if available, or just nested callbacks/Promise wrapper.
      // Assuming db.query supports callbacks. I will wrap them in Promises for cleaner code.

      const query = (sql, params) => {
        return new Promise((resolve, reject) => {
          db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      };

      const [stats, myCourses, allCourses, myRequests, defaultVideos] = await Promise.all([
        query(statsQuery, [student_id, student_id, student_id]),
        query(myCoursesQuery, [student_id]),
        query(allCoursesQuery, []),
        query(myRequestsQuery, [student_id]),
        query(defaultVideosQuery, [])
      ]);

      return res.send({
        stats: stats[0],
        myCourses: { total: myCourses.length, courses: myCourses },
        allCourses,
        myRequests,
        defaultVideos
      });

    } catch (error) {
      console.error("Dashboard Error:", error);
      return res.status(500).send({ message: "Error fetching dashboard data", error });
    }
  },

  // Student → My Courses
  getMyCourses: (req, res) => {
    const student_id = req.user.id;

    const sql = `
      SELECT c.id, c.name, c.description, c.thumbnail
      FROM user_courses uc
      JOIN courses c ON c.id = uc.course_id
      WHERE uc.user_id = ? AND uc.role_in_course = 'student' AND c.is_active = 1
    `;

    db.query(sql, [student_id], (err, rows) => {
      if (err) return res.status(500).send(err);

      return res.send({
        total: rows.length,
        courses: rows
      });
    });
  },

  // Student → My Batch (first assigned)
  getMyBatch: (req, res) => {
    const student_id = req.user.id;

    const sql = `
      SELECT 
        ucb.batch_id,
        ucb.course_id,
        b.title AS batch_title,
        b.start_date,
        b.end_date,
        c.name AS course_name
      FROM user_course_batch ucb
      JOIN batches b ON b.id = ucb.batch_id
      JOIN courses c ON c.id = ucb.course_id
      WHERE ucb.user_id = ?
      ORDER BY ucb.batch_id DESC
    `;

    db.query(sql, [student_id], (err, rows) => {
      if (err) return res.status(500).send(err);

      if (rows.length === 0) {
        return res.send({ assigned: false });
      }

      return res.send({
        assigned: true,
        batch: rows
      });
    });
  },

  // Student → My Trainer (first batch’s trainer)
  getMyTrainer: (req, res) => {
    const student_id = req.user.id;

    const sql = `
      SELECT t.id, t.name, t.email, t.phone, t.profile_pic
      FROM user_course_batch ucb_student
      JOIN user_course_batch ucb_trainer
        ON ucb_student.course_id = ucb_trainer.course_id
       AND ucb_student.batch_id = ucb_trainer.batch_id
      JOIN users t ON t.id = ucb_trainer.user_id
      WHERE ucb_student.user_id = ?
        AND t.role = 'trainer'
    `;

    db.query(sql, [student_id], (err, rows) => {
      if (err) return res.status(500).send(err);

      if (rows.length === 0) {
        return res.send({ message: "No trainer assigned yet" });
      }

      return res.send({
        trainer: rows
      });
    });
  },

  // Student → Request Enrollment
  enroll: (req, res) => {
    const student_id = req.user.id;
    const course_id = req.params.courseId;

    // Check if already enrolled
    const checkEnrolledSql = `SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?`;
    db.query(checkEnrolledSql, [student_id, course_id], (err, rows) => {
      if (err) return res.status(500).send(err);

      if (rows.length > 0) {
        return res.status(400).send({ message: "Already enrolled" });
      }

      // Check if request pending
      const checkRequestSql = `SELECT * FROM enrollment_requests WHERE student_id = ? AND course_id = ? AND status = 'pending'`;
      db.query(checkRequestSql, [student_id, course_id], (err2, reqRows) => {
        if (err2) return res.status(500).send(err2);

        if (reqRows.length > 0) {
          return res.status(400).send({ message: "Request already pending" });
        }

        // Create Request
        const insertSql = `INSERT INTO enrollment_requests (student_id, course_id, status) VALUES (?, ?, 'pending')`;

        db.query(insertSql, [student_id, course_id], (err3) => {
          if (err3) return res.status(500).send(err3);
          return res.send({ message: "Enrollment request sent successfully" });
        });
      });
    });
  },

  // Student → All Courses (for Explore) with Search & Pagination
  getAllCourses: (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*) as total FROM courses WHERE is_active = 1 AND is_approved = 1 AND name LIKE ?`;
    const sql = `SELECT * FROM courses WHERE is_active = 1 AND is_approved = 1 AND name LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;

    db.query(countSql, [`%${search}%`], (err, countResult) => {
      if (err) return res.status(500).send(err);
      const total = countResult[0].total;

      db.query(sql, [`%${search}%`, limit, offset], (err, rows) => {
        if (err) return res.status(500).send(err);
        return res.send({
          courses: rows,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        });
      });
    });
  },

  // Student → Get My Enrollment Requests
  getMyEnrollmentRequests: (req, res) => {
    const student_id = req.user.id;
    const sql = `SELECT * FROM enrollment_requests WHERE student_id = ?`;
    db.query(sql, [student_id], (err, rows) => {
      if (err) return res.status(500).send(err);
      return res.send(rows);
    });
  },

  // Student → Course Content (Videos)
  getCourseContent: (req, res) => {
    const student_id = req.user.id;
    const course_id = req.params.courseId;

    // Logic: Get videos that are either default for the course OR assigned to the student's batch for this course
    // 1. Get Videos
    const videoSql = `
      SELECT v.*, v.name as title 
      FROM videos v
      WHERE v.course_id = ?
      AND (
        v.is_default = 1
        OR v.batch_id IN (
          SELECT batch_id FROM user_course_batch WHERE user_id = ? AND course_id = ?
        )
      )
      ORDER BY v.created_at ASC
    `;

    // 2. Get Batches Info (if enrolled)
    const batchSql = `
      SELECT b.id, b.title, b.start_date, b.end_date, c.name as course_name
      FROM user_course_batch ucb
      JOIN batches b ON b.id = ucb.batch_id
      JOIN courses c ON c.id = ucb.course_id
      WHERE ucb.user_id = ? AND ucb.course_id = ?
      ORDER BY b.start_date DESC
    `;

    db.query(videoSql, [course_id, student_id, course_id], (err, videos) => {
      if (err) return res.status(500).send(err);

      db.query(batchSql, [student_id, course_id], (err2, batchRows) => {
        if (err2) return res.status(500).send(err2);

        return res.send({
          videos,
          batches: batchRows // Return all assigned batches
        });
      });
    });
  },

  // Student → Get Default Videos (Home Page) with Search & Pagination
  getDefaultVideos: (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    const countSql = `
      SELECT COUNT(*) as total
      FROM videos v
      LEFT JOIN courses c ON c.id = v.course_id
      WHERE v.is_default = 1 AND v.is_active = 1 AND v.name LIKE ?
    `;

    const sql = `
      SELECT v.*, v.name as title, c.name AS course_name, c.thumbnail AS course_thumbnail
      FROM videos v
      LEFT JOIN courses c ON c.id = v.course_id
      WHERE v.is_default = 1 AND v.is_active = 1 AND v.name LIKE ?
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `;

    db.query(countSql, [`%${search}%`], (err, countResult) => {
      if (err) return res.status(500).send(err);
      const total = countResult[0].total;

      db.query(sql, [`%${search}%`, limit, offset], (err, rows) => {
        if (err) return res.status(500).send(err);
        return res.send({
          videos: rows,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        });
      });
    });
  }
};

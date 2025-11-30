// controllers/admin.controller.js
const db = require("../config/db");

module.exports = {
  /* ---------------------------------------------------
     DASHBOARD: simple metrics for admin
     GET /api/admin/dashboard
  --------------------------------------------------- */
  getDashboard: (req, res) => {
    const data = {};

    const q1 = `SELECT COUNT(*) AS total_students FROM users WHERE role='student'`;
    const q2 = `SELECT COUNT(*) AS total_trainers FROM users WHERE role='trainer'`;
    const q3 = `SELECT COUNT(*) AS total_courses FROM courses`;
    const q4 = `SELECT COUNT(*) AS total_batches FROM batches`;
    const q5 = `SELECT COUNT(*) AS active_students FROM users WHERE role='student' AND is_active=1`;
    const q6 = `SELECT COUNT(*) AS inactive_students FROM users WHERE role='student' AND is_active=0`;
    const q7 = `SELECT COUNT(*) AS total_enrollments FROM user_courses`;

    db.query(q1, (err1, r1) => {
      if (err1) return res.status(500).send(err1);
      data.total_students = r1[0].total_students;

      db.query(q2, (err2, r2) => {
        if (err2) return res.status(500).send(err2);
        data.total_trainers = r2[0].total_trainers;

        db.query(q3, (err3, r3) => {
          if (err3) return res.status(500).send(err3);
          data.total_courses = r3[0].total_courses;

          db.query(q4, (err4, r4) => {
            if (err4) return res.status(500).send(err4);
            data.total_batches = r4[0].total_batches;

            db.query(q5, (err5, r5) => {
              if (err5) return res.status(500).send(err5);
              data.active_students = r5[0].active_students;

              db.query(q6, (err6, r6) => {
                if (err6) return res.status(500).send(err6);
                data.inactive_students = r6[0].inactive_students;

                db.query(q7, (err7, r7) => {
                  if (err7) return res.status(500).send(err7);
                  data.total_enrollments = r7[0].total_enrollments;

                  return res.send(data);
                });
              });
            });
          });
        });
      });
    });
  },

  /* ---------------------------------------------------
     STUDENTS LIST
     GET /api/admin/students?search=&status=&page=&limit=
  --------------------------------------------------- */
  getStudents: (req, res) => {
    const search = req.query.search || "";
    const status = req.query.status || "all"; // active / inactive / all
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let where = `WHERE role='student'`;

    if (search) {
      where += ` AND (name LIKE '%${search}%' OR email LIKE '%${search}%' OR phone LIKE '%${search}%')`;
    }

    if (status === "active") where += ` AND is_active=1`;
    if (status === "inactive") where += ` AND is_active=0`;

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.is_active,
        u.profile_pic,
        u.resume,
        u.created_at,
        (SELECT COUNT(*) FROM user_courses WHERE user_id = u.id) AS courses_assigned,
        (SELECT COUNT(*) FROM user_course_batch WHERE user_id = u.id) AS batches_assigned
      FROM users u
      ${where}
      ORDER BY u.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM users
      ${where}
    `;

    db.query(sql, (err, rows) => {
      if (err) return res.status(500).send(err);

      db.query(countSql, (err2, countRows) => {
        if (err2) return res.status(500).send(err2);

        return res.send({
          page,
          limit,
          total: countRows[0].total,
          students: rows
        });
      });
    });
  },

  /* ---------------------------------------------------
     SINGLE STUDENT DETAIL
     GET /api/admin/students/:id
  --------------------------------------------------- */
  getStudentById: (req, res) => {
    const id = req.params.id;

    const userSql = `
    SELECT id, name, email, phone, role, is_active, profile_pic, resume, created_at
    FROM users
    WHERE id = ? AND role='student'
    LIMIT 1
  `;

    db.query(userSql, [id], (err, users) => {
      if (err) return res.status(500).send(err);
      if (users.length === 0) {
        return res.status(404).send({ message: "Student not found" });
      }

      const student = users[0];

      // Fetch courses
      const courseSql = `
      SELECT uc.course_id, c.name AS course_name
      FROM user_courses uc
      JOIN courses c ON c.id = uc.course_id
      WHERE uc.user_id = ?
    `;

      // ❗ FIXED: batches table uses "title", not "name"
      const batchSql = `
      SELECT 
        ucb.batch_id, 
        b.title AS batch_name, 
        ucb.course_id
      FROM user_course_batch ucb
      JOIN batches b ON b.id = ucb.batch_id
      WHERE ucb.user_id = ?
    `;

      db.query(courseSql, [id], (err2, courses) => {
        if (err2) return res.status(500).send(err2);

        db.query(batchSql, [id], (err3, batches) => {
          if (err3) return res.status(500).send(err3);

          return res.send({
            ...student,
            courses,
            batches
          });
        });
      });
    });
  },

  /* ---------------------------------------------------
     TRAINERS LIST
     GET /api/admin/trainers?search=&status=&page=&limit=
  --------------------------------------------------- */
  getTrainers: (req, res) => {
    const search = req.query.search || "";
    const status = req.query.status || "all"; // active / inactive / all
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let where = `WHERE role='trainer'`;

    if (search) {
      where += ` AND (name LIKE '%${search}%' OR email LIKE '%${search}%' OR phone LIKE '%${search}%')`;
    }

    if (status === "active") where += ` AND is_active=1`;
    if (status === "inactive") where += ` AND is_active=0`;

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.is_active,
        u.profile_pic,
        u.created_at,
        (SELECT COUNT(*) FROM user_course_batch WHERE user_id = u.id) AS batches_assigned
      FROM users u
      ${where}
      ORDER BY u.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM users
      ${where}
    `;

    db.query(sql, (err, rows) => {
      if (err) return res.status(500).send(err);

      db.query(countSql, (err2, countRows) => {
        if (err2) return res.status(500).send(err2);

        return res.send({
          page,
          limit,
          total: countRows[0].total,
          trainers: rows
        });
      });
    });
  },

  /* ---------------------------------------------------
     SINGLE TRAINER DETAIL
     GET /api/admin/trainers/:id
  --------------------------------------------------- */
  getTrainerById: (req, res) => {
    const id = req.params.id;

    const userSql = `
      SELECT id, name, email, phone, role, is_active, profile_pic, created_at
      FROM users
      WHERE id = ? AND role='trainer'
      LIMIT 1
    `;

    db.query(userSql, [id], (err, users) => {
      if (err) return res.status(500).send(err);
      if (users.length === 0) {
        return res.status(404).send({ message: "Trainer not found" });
      }

      const trainer = users[0];

      const courseSql = `
        SELECT uc.course_id, c.name AS course_name
        FROM user_courses uc
        JOIN courses c ON c.id = uc.course_id
        WHERE uc.user_id = ?
      `;

      const batchSql = `
        SELECT ucb.batch_id, b.title AS batch_name, ucb.course_id, c.name AS course_name
        FROM user_course_batch ucb
        JOIN batches b ON b.id = ucb.batch_id
        JOIN courses c ON c.id = ucb.course_id
        WHERE ucb.user_id = ?
      `;

      db.query(courseSql, [id], (errCourse, courses) => {
        if (errCourse) return res.status(500).send(errCourse);

        db.query(batchSql, [id], (err2, batches) => {
          if (err2) return res.status(500).send(err2);

          return res.send({
            ...trainer,
            courses,
            batches
          });
        });
      });
    });
  },

  /* ---------------------------------------------------
     UPDATE USER STATUS (activate/deactivate)
     PATCH /api/admin/users/:id/status
     body: { is_active: 1 or 0 }
  --------------------------------------------------- */
  updateUserStatus: (req, res) => {
    const id = req.params.id;
    const { is_active } = req.body;

    if (typeof is_active === "undefined") {
      return res.status(400).send({ message: "is_active required (0 or 1)" });
    }

    const sql = `UPDATE users SET is_active = ? WHERE id = ?`;

    db.query(sql, [is_active, id], (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.affectedRows === 0) {
        return res.status(404).send({ message: "User not found" });
      }

      return res.send({
        message: "User status updated",
        user_id: id,
        is_active
      });
    });
  },

  /* -----------------------------------------------------------
    🗑️ ADMIN: Remove Trainer From Course (safe delete)
 ----------------------------------------------------------- */
  removeTrainerCourse: (req, res) => {
    const { trainer_id, course_id } = req.body;

    if (!trainer_id || !course_id) {
      return res.send({ message: "trainer_id and course_id required" });
    }

    // Step 1 – Validate trainer
    const trainerSql = `
        SELECT * FROM users 
        WHERE id = ? AND role='trainer' AND is_active=1
    `;
    db.query(trainerSql, [trainer_id], (err, rows) => {
      if (err) return res.send(err);
      if (rows.length === 0) return res.send({ message: "Invalid trainer" });

      // Step 2 – Check mapping exists
      const checkSql = `
            SELECT * FROM user_courses
            WHERE user_id = ? AND course_id = ?
        `;
      db.query(checkSql, [trainer_id, course_id], (err2, ucRows) => {
        if (err2) return res.send(err2);
        if (ucRows.length === 0) {
          return res.send({
            message: "Trainer is not assigned to this course"
          });
        }

        // Step 3 – Delete course
        const deleteCourseSql = `
                DELETE FROM user_courses
                WHERE user_id = ? AND course_id = ?
            `;
        db.query(deleteCourseSql, [trainer_id, course_id], (err3) => {
          if (err3) return res.send(err3);

          // Step 4 – Delete all batches of that course for the trainer
          const deleteBatchSql = `
                    DELETE FROM user_course_batch
                    WHERE user_id = ? AND course_id = ?
                `;
          db.query(deleteBatchSql, [trainer_id, course_id], (err4) => {
            if (err4) return res.send(err4);

            return res.send({
              message: "Trainer removed from course (and all related batches)",
              trainer_id,
              course_id
            });
          });
        });
      });
    });
  },

  /* -----------------------------------------------------------
     🗑️ ADMIN: Remove Trainer From a Batch (safe delete)
  ----------------------------------------------------------- */
  removeTrainerBatch: (req, res) => {
    const { trainer_id, batch_id } = req.body;

    if (!trainer_id || !batch_id) {
      return res.send({ message: "trainer_id and batch_id required" });
    }

    // Step 1 – Validate trainer
    const trainerSql = `
        SELECT * FROM users 
        WHERE id = ? AND role='trainer' AND is_active=1
    `;
    db.query(trainerSql, [trainer_id], (err, rows) => {
      if (err) return res.send(err);
      if (rows.length === 0) return res.send({ message: "Invalid trainer" });

      // Step 2 – Validate mapping
      const checkSql = `
            SELECT * FROM user_course_batch
            WHERE user_id = ? AND batch_id = ?
        `;
      db.query(checkSql, [trainer_id, batch_id], (err2, ucbRows) => {
        if (err2) return res.send(err2);
        if (ucbRows.length === 0) {
          return res.send({ message: "Trainer is not assigned to this batch" });
        }

        const courseId = ucbRows[0].course_id;

        // Step 3 – Remove ONLY the batch
        const deleteBatchSql = `
                DELETE FROM user_course_batch
                WHERE user_id = ? AND batch_id = ?
            `;
        db.query(deleteBatchSql, [trainer_id, batch_id], (err3) => {
          if (err3) return res.send(err3);

          return res.send({
            message: "Trainer removed from batch",
            trainer_id,
            batch_id,
            course_id: courseId
          });
        });
      });
    });
  },

  /* -----------------------------------------------------------
     🗑️ ADMIN: Remove Student From Course
  ----------------------------------------------------------- */
  removeStudentCourse: (req, res) => {
    const { student_id, course_id } = req.body;
    console.log("REMOVE COURSE REQUEST:", { student_id, course_id });

    if (!student_id || !course_id) {
      return res.send({ message: "student_id and course_id required" });
    }

    const studentSql = `
        SELECT * FROM users 
        WHERE id = ? AND role='student'
    `;

    db.query(studentSql, [student_id], (err, rows) => {
      if (err) return res.send(err);
      if (rows.length === 0) return res.send({ message: "Invalid student" });

      const checkSql = `
            SELECT * FROM user_courses
            WHERE user_id = ? AND course_id = ?
        `;

      db.query(checkSql, [student_id, course_id], (err2, ucRows) => {
        if (err2) return res.send(err2);
        if (ucRows.length === 0) {
          return res.send({ message: "Student is not assigned to this course" });
        }

        const deleteCourseSql = `
                DELETE FROM user_courses
                WHERE user_id = ? AND course_id = ?
            `;

        db.query(deleteCourseSql, [student_id, course_id], (err3) => {
          if (err3) return res.send(err3);

          const deleteBatchSql = `
                    DELETE FROM user_course_batch
                    WHERE user_id = ? AND course_id = ?
                `;

          db.query(deleteBatchSql, [student_id, course_id], (err4) => {
            if (err4) return res.send(err4);

            return res.send({
              message: "Student removed from course (and its batches)",
              student_id,
              course_id
            });
          });
        });
      });
    });
  },

  /* -----------------------------------------------------------
     🗑️ ADMIN: Remove Student From Batch
  ----------------------------------------------------------- */
  removeStudentBatch: (req, res) => {
    const { student_id, batch_id } = req.body;

    if (!student_id || !batch_id) {
      return res.send({ message: "student_id and batch_id required" });
    }

    const studentSql = `
        SELECT * FROM users 
        WHERE id = ? AND role='student'
    `;

    db.query(studentSql, [student_id], (err, rows) => {
      if (err) return res.send(err);
      if (rows.length === 0) return res.send({ message: "Invalid student" });

      const checkSql = `
            SELECT * FROM user_course_batch
            WHERE user_id = ? AND batch_id = ?
        `;

      db.query(checkSql, [student_id, batch_id], (err2, ucbRows) => {
        if (err2) return res.send(err2);
        if (ucbRows.length === 0) {
          return res.send({ message: "Student is not assigned to this batch" });
        }

        const deleteBatchSql = `
                DELETE FROM user_course_batch
                WHERE user_id = ? AND batch_id = ?
            `;

        db.query(deleteBatchSql, [student_id, batch_id], (err3) => {
          if (err3) return res.send(err3);

          return res.send({
            message: "Student removed from batch",
            student_id,
            batch_id
          });
        });
      });
    });
  },

  // ADMIN: REASSIGN USER (robust, simple callback flow)
  // PUT /api/admin/reassign-user
  reassignUser: (req, res) => {
    const {
      user_id,
      old_course_id,
      new_course_id,
      old_batch_id,
      new_batch_id
    } = req.body;

    if (!user_id) {
      return res.status(400).send({ message: "user_id is required" });
    }

    // STEP 0: Ensure user exists and get role
    const userSql = `SELECT id, role FROM users WHERE id = ? LIMIT 1`;
    db.query(userSql, [user_id], (uErr, uRows) => {
      if (uErr) return res.status(500).send(uErr);
      if (!uRows || uRows.length === 0) {
        return res.status(404).send({ message: "User not found" });
      }

      const userRole = uRows[0].role; // e.g. 'student' or 'trainer'

      // STEP 1: fetch current course mapping (if any)
      const currentCourseSql = `
      SELECT course_id
      FROM user_courses
      WHERE user_id = ?
      LIMIT 1
    `;
      db.query(currentCourseSql, [user_id], (ccErr, ccRows) => {
        if (ccErr) return res.status(500).send(ccErr);

        const currentCourseId = ccRows && ccRows.length ? ccRows[0].course_id : null;

        // STEP 2: fetch current batch mapping (if any)
        const currentBatchSql = `
        SELECT course_id, batch_id
        FROM user_course_batch
        WHERE user_id = ?
        LIMIT 1
      `;
        db.query(currentBatchSql, [user_id], (cbErr, cbRows) => {
          if (cbErr) return res.status(500).send(cbErr);

          const currentBatch = cbRows && cbRows.length ? cbRows[0] : null;
          const currentBatchId = currentBatch ? currentBatch.batch_id : null;
          const currentBatchCourseId = currentBatch ? currentBatch.course_id : null;

          // Decide target course for batch validation:
          // Priority: new_course_id (explicit) -> currentCourseId -> currentBatchCourseId
          let targetCourseForNewBatch = null;
          if (new_course_id) targetCourseForNewBatch = new_course_id;
          else if (currentCourseId) targetCourseForNewBatch = currentCourseId;
          else if (currentBatchCourseId) targetCourseForNewBatch = currentBatchCourseId;

          // If new_batch_id provided but no course context -> error
          if (new_batch_id && !targetCourseForNewBatch) {
            return res.status(400).send({
              message:
                "Cannot assign batch without a course. Provide new_course_id or ensure user has a course assigned."
            });
          }

          // If new_batch_id provided, validate batch belongs to targetCourseForNewBatch
          const validateBatchThenProceed = (cb) => {
            if (!new_batch_id) return cb(null);
            const checkBatchSql = `
            SELECT id FROM batches
            WHERE id = ? AND course_id = ? AND is_active = 1
            LIMIT 1
          `;
            db.query(checkBatchSql, [new_batch_id, targetCourseForNewBatch], (chkErr, chkRows) => {
              if (chkErr) return cb(chkErr);
              if (!chkRows || chkRows.length === 0) {
                return cb({
                  code: "INVALID_BATCH",
                  message: `Batch ${new_batch_id} does not belong to course ${targetCourseForNewBatch}`
                });
              }
              return cb(null);
            });
          };

          // Helper: remove old course mapping if requested (but validate it exists first)
          const removeOldCourse = (next) => {
            if (!old_course_id) return next(null);

            const checkSql = `SELECT * FROM user_courses WHERE user_id = ? AND course_id = ? LIMIT 1`;
            db.query(checkSql, [user_id, old_course_id], (chkErr, chkRows) => {
              if (chkErr) return next(chkErr);

              if (!chkRows || chkRows.length === 0) {
                // Admin asked to remove a course mapping that doesn't exist
                return next({
                  code: "MAPPING_NOT_FOUND",
                  message: `User ${user_id} is not assigned to course ${old_course_id}`
                });
              }

              // Delete from user_courses
              const delSql = `DELETE FROM user_courses WHERE user_id = ? AND course_id = ?`;
              db.query(delSql, [user_id, old_course_id], (dErr) => {
                if (dErr) return next(dErr);

                // Also remove any user_course_batch rows referencing that course for this user
                const delUcbSql = `DELETE FROM user_course_batch WHERE user_id = ? AND course_id = ?`;
                db.query(delUcbSql, [user_id, old_course_id], (d2Err) => {
                  if (d2Err) return next(d2Err);
                  return next(null);
                });
              });
            });
          };

          // Helper: remove old batch mapping
          const removeOldBatch = (next) => {
            if (!old_batch_id) return next(null);

            const delSql = `DELETE FROM user_course_batch WHERE user_id = ? AND batch_id = ?`;
            db.query(delSql, [user_id, old_batch_id], (dErr) => {
              if (dErr) return next(dErr);
              return next(null);
            });
          };

          // Helper: add new course mapping
          const addNewCourse = (next) => {
            if (!new_course_id) return next(null);

            // Check duplicate
            const checkSql = `SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?`;
            db.query(checkSql, [user_id, new_course_id], (cErr, cRows) => {
              if (cErr) return next(cErr);
              if (cRows && cRows.length > 0) return next(null); // already exists

              const insSql = `INSERT INTO user_courses (user_id, course_id, role_in_course) VALUES (?, ?, ?)`;
              db.query(insSql, [user_id, new_course_id, userRole], (iErr) => {
                if (iErr) return next(iErr);
                return next(null);
              });
            });
          };

          // Helper: add new batch mapping
          const addNewBatch = (next) => {
            if (!new_batch_id) return next(null);

            // Check duplicate
            const checkSql = `SELECT * FROM user_course_batch WHERE user_id = ? AND batch_id = ?`;
            db.query(checkSql, [user_id, new_batch_id], (cErr, cRows) => {
              if (cErr) return next(cErr);
              if (cRows && cRows.length > 0) return next(null); // already exists

              // We need course_id for this batch. We decided it earlier: targetCourseForNewBatch
              const insSql = `INSERT INTO user_course_batch (user_id, course_id, batch_id) VALUES (?, ?, ?)`;
              db.query(insSql, [user_id, targetCourseForNewBatch, new_batch_id], (iErr) => {
                if (iErr) return next(iErr);
                return next(null);
              });
            });
          };

          // EXECUTE FLOW
          validateBatchThenProceed((vErr) => {
            if (vErr) return res.status(400).send(vErr);

            removeOldCourse((r1Err) => {
              if (r1Err) return res.status(500).send(r1Err);

              removeOldBatch((r2Err) => {
                if (r2Err) return res.status(500).send(r2Err);

                addNewCourse((a1Err) => {
                  if (a1Err) return res.status(500).send(a1Err);

                  addNewBatch((a2Err) => {
                    if (a2Err) return res.status(500).send(a2Err);

                    return res.send({ message: "Reassignment successful" });
                  });
                });
              });
            });
          });
        });
      });
    });
  }
};

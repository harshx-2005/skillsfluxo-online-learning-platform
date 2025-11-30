// controllers/adminCourse.controller.js
const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

module.exports = {

  /* ---------------------------------------------------
     ADMIN → Create Course
  --------------------------------------------------- */
  createCourse: async (req, res) => {
    const { name, description, level, category, price, language, learning_outcomes, requirements } = req.body;
    let thumbnail = req.body.thumbnail; // Allow string URL if provided

    // Handle File Upload to Cloudinary
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "lms/course_thumbnails"
        });
        thumbnail = uploadResult.secure_url;
        fs.unlink(req.file.path, () => { }); // Clean up local file
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        return res.status(500).send({ message: "Thumbnail upload failed" });
      }
    }

    if (!name) {
      return res.status(400).send({ message: "Course name required" });
    }

    const sql = `
      INSERT INTO courses (name, description, thumbnail, level, category, price, language, learning_outcomes, requirements, is_active, is_approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `;

    db.query(sql, [name, description, thumbnail, level, category, price, language, learning_outcomes, requirements], (err, result) => {
      if (err) return res.status(500).send(err);

      return res.send({
        message: "Course created successfully",
        course_id: result.insertId
      });
    });
  },

  /* ---------------------------------------------------
     ADMIN → Get All Courses (search, filter, pagination)
  --------------------------------------------------- */
  getCourses: (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let where = "WHERE is_active = 1";

    if (search) {
      where += ` AND (name LIKE '%${search}%' OR description LIKE '%${search}%')`;
    }

    const sql = `
      SELECT *
      FROM courses
      ${where}
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM courses
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
          courses: rows
        });
      });
    });
  },

  /* ---------------------------------------------------
     ADMIN → Get Course by ID
  --------------------------------------------------- */
  getCourseById: (req, res) => {
    const id = req.params.id;

    const sql = `SELECT * FROM courses WHERE id = ?`;

    db.query(sql, [id], (err, rows) => {
      if (err) return res.status(500).send(err);

      if (rows.length === 0) {
        return res.status(404).send({ message: "Course not found" });
      }

      return res.send(rows[0]);
    });
  },

  /* ---------------------------------------------------
     ADMIN → Update Course
  --------------------------------------------------- */
  updateCourse: async (req, res) => {
    const id = req.params.id;
    const { name, description, level, category, price, language, learning_outcomes, requirements } = req.body;
    let thumbnail = req.body.thumbnail;

    // Handle File Upload to Cloudinary
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "lms/course_thumbnails"
        });
        thumbnail = uploadResult.secure_url;
        fs.unlink(req.file.path, () => { }); // Clean up local file
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        return res.status(500).send({ message: "Thumbnail upload failed" });
      }
    }

    // If thumbnail is not provided (and no new file), we don't want to overwrite it with null/undefined
    // However, standard SQL update usually requires all fields or dynamic query.
    // Let's first fetch the existing course to preserve thumbnail if not updated.
    // OR, simpler: use COALESCE in SQL if we were passing null, but here we might pass undefined.

    // Better approach: Construct query dynamically or fetch-then-update.
    // For simplicity and speed, let's just use a dynamic query approach.

    let sql = "UPDATE courses SET name=?, description=?, level=?, category=?, price=?, language=?, learning_outcomes=?, requirements=?";
    let params = [name, description, level, category, price, language, learning_outcomes, requirements];

    if (thumbnail) {
      sql += ", thumbnail=?";
      params.push(thumbnail);
    }

    sql += " WHERE id=?";
    params.push(id);

    db.query(sql, params, (err) => {
      if (err) return res.status(500).send(err);

      return res.send({ message: "Course updated successfully" });
    });
  },

  /* ---------------------------------------------------
     ADMIN → Delete Course (soft delete)
  --------------------------------------------------- */
  deleteCourse: (req, res) => {
    const id = req.params.id;

    const sql = `UPDATE courses SET is_active = 0 WHERE id = ?`;

    db.query(sql, [id], (err) => {
      if (err) return res.status(500).send(err);

      // Cascade soft delete to batches
      const batchSql = `UPDATE batches SET is_active = 0 WHERE course_id = ?`;
      db.query(batchSql, [id], (err2) => {
        if (err2) console.error("Error disabling batches:", err2); // Log but don't fail response
        return res.send({ message: "Course and associated batches disabled" });
      });
    });
  },

  /* ---------------------------------------------------
     ADMIN → Approve or Unapprove Course
  --------------------------------------------------- */
  approveCourse: (req, res) => {
    const id = req.params.id;
    const { is_approved } = req.body;

    if (typeof is_approved === "undefined") {
      return res.status(400).send({ message: "is_approved required (0 or 1)" });
    }

    const sql = `
      UPDATE courses
      SET is_approved = ?
      WHERE id = ?
    `;

    db.query(sql, [is_approved, id], (err) => {
      if (err) return res.status(500).send(err);

      return res.send({
        message: "Course approval updated",
        course_id: id,
        is_approved
      });
    });
  },

  /* ---------------------------------------------------
   ADMIN → Get Course + Assigned Batches
--------------------------------------------------- */
  getCourseWithBatches: (req, res) => {
    const courseId = req.params.id;

    const courseSql = `
    SELECT *
    FROM courses
    WHERE id = ?
  `;

    const batchSql = `
    SELECT id, title, start_date, end_date, is_active
    FROM batches
    WHERE course_id = ?
    ORDER BY id DESC
  `;

    // Step 1 — Get Course
    db.query(courseSql, [courseId], (err, courseRows) => {
      if (err) return res.status(500).send(err);

      if (courseRows.length === 0) {
        return res.status(404).send({ message: "Course not found" });
      }

      const course = courseRows[0];

      // Step 2 — Get Batches
      db.query(batchSql, [courseId], (err2, batchRows) => {
        if (err2) return res.status(500).send(err2);

        return res.send({
          course,
          batches: batchRows
        });
      });
    });
  },


  /* ---------------------------------------------------
     ADMIN → Create Batch
  --------------------------------------------------- */
  createBatch: (req, res) => {
    const { title, start_date, end_date, course_id } = req.body;

    if (!title || !course_id) {
      return res.status(400).send({ message: "title and course_id required" });
    }

    const sql = `
      INSERT INTO batches (title, start_date, end_date, course_id, is_active)
      VALUES (?, ?, ?, ?, 1)
    `;

    db.query(sql, [title, start_date, end_date, course_id], (err, result) => {
      if (err) return res.status(500).send(err);

      return res.send({
        message: "Batch created successfully",
        batch_id: result.insertId,
        course_id
      });
    });
  },

  /* ---------------------------------------------------
     ADMIN → Get All Batches
  --------------------------------------------------- */
  getBatches: (req, res) => {
    const course_id = req.query.course_id || null;

    let sql = `
      SELECT b.*, c.name AS course_name
      FROM batches b
      JOIN courses c ON c.id = b.course_id
      WHERE b.is_active = 1
    `;

    if (course_id) sql += ` AND b.course_id = ${course_id}`;

    db.query(sql, (err, rows) => {
      if (err) return res.status(500).send(err);

      return res.send(rows);
    });
  },

  /* ---------------------------------------------------
     ADMIN → Get Batch by ID
  --------------------------------------------------- */
  getBatchById: (req, res) => {
    const id = req.params.id;

    const sql = `
      SELECT b.*, c.name AS course_name
      FROM batches b
      JOIN courses c ON c.id = b.course_id
      WHERE b.id = ?
    `;

    db.query(sql, [id], (err, rows) => {
      if (err) return res.status(500).send(err);

      if (rows.length === 0) {
        return res.status(404).send({ message: "Batch not found" });
      }

      return res.send(rows[0]);
    });
  },

  /* ---------------------------------------------------
     ADMIN → Update Batch
  --------------------------------------------------- */
  updateBatch: (req, res) => {
    const id = req.params.id;
    const { title, start_date, end_date } = req.body;

    const sql = `
      UPDATE batches
      SET title = ?, start_date = ?, end_date = ?
      WHERE id = ?
    `;

    db.query(sql, [title, start_date, end_date, id], (err) => {
      if (err) return res.status(500).send(err);

      return res.send({ message: "Batch updated successfully" });
    });
  },

  /* ---------------------------------------------------
     ADMIN → Delete Batch
  --------------------------------------------------- */
  deleteBatch: (req, res) => {
    const id = req.params.id;

    const sql = `UPDATE batches SET is_active = 0 WHERE id = ?`;

    db.query(sql, [id], (err) => {
      if (err) return res.status(500).send(err);

      return res.send({ message: "Batch disabled" });
    });
  },

  // controllers/adminCourse.controller.js  (add these functions)



  /* ---------------------------------------------------
    Get batches for a specific course
    GET /api/adminCourse/course/:courseId/batches
  --------------------------------------------------- */
  getBatchesByCourse: (req, res) => {
    const courseId = req.params.courseId;
    const sql = `
    SELECT b.*, c.name AS course_title
    FROM batches b
    LEFT JOIN courses c ON c.id = b.course_id
    WHERE b.course_id = ? AND b.is_active = 1
    ORDER BY b.start_date IS NULL, b.start_date DESC
  `;
    db.query(sql, [courseId], (err, rows) => {
      if (err) return res.status(500).json({ success: false, error: err });
      return res.json({ success: true, data: rows });
    });
  },

  /* ---------------------------------------------------
    Create a batch under a specific course
    POST /api/adminCourse/course/:courseId/batches
    Body: { title, start_date (YYYY-MM-DD or null), end_date, is_active }
  --------------------------------------------------- */
  createBatchForCourse: (req, res) => {
    const courseId = req.params.courseId;
    const { title, start_date, end_date, is_active } = req.body;
    const active = is_active ? 1 : 0;
    if (!title) return res.status(400).json({ success: false, message: "title required" });

    const sql = `
    INSERT INTO batches (title, course_id, start_date, end_date, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
    db.query(sql, [title, courseId, start_date || null, end_date || null, active], (err, result) => {
      if (err) {
        console.log("SQL ERROR:", err);
        return res.status(500).json({ success: false, error: err });
      }
      // fetch inserted row to return
      const id = result.insertId;
      const getSql = `SELECT b.*, c.name AS course_name FROM batches b LEFT JOIN courses c ON c.id = b.course_id WHERE b.id = ?`;
      db.query(getSql, [id], (err2, rows) => {
        if (err2) {
          console.log("SQL ERROR 2:", err);
          return res.status(500).json({ success: false, error: err2 });
        }
        return res.json({ success: true, data: rows[0] });
      });
    });
  },

  /* ---------------------------------------------------
    Update a batch by id
    PATCH /api/adminCourse/batch/:id
    Body: { title?, start_date?, end_date?, is_active? }
  --------------------------------------------------- */
  updateBatch: (req, res) => {
    const batchId = req.params.id;
    const { title, start_date, end_date, is_active } = req.body;

    const sql = `
    UPDATE batches SET
      title = COALESCE(?, title),
      start_date = ?,
      end_date = ?,
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `;

    // Use explicit nulls for dates if they are empty string
    const sdate = start_date === "" ? null : start_date;
    const edate = end_date === "" ? null : end_date;
    const activeVal = typeof is_active === "boolean" ? (is_active ? 1 : 0) : (is_active !== undefined ? is_active : null);

    db.query(sql, [title, sdate, edate, activeVal, batchId], (err) => {
      if (err) return res.status(500).json({ success: false, error: err });
      // return updated row
      const getSql = `SELECT b.*, c.name AS course_title FROM batches b LEFT JOIN courses c ON c.id = b.course_id WHERE b.id = ?`;
      db.query(getSql, [batchId], (err2, rows) => {
        if (err2) return res.status(500).json({ success: false, error: err2 });
        return res.json({ success: true, data: rows[0] });
      });
    });
  },

  /* ---------------------------------------------------
    Delete batch by id
    DELETE /api/adminCourse/batch/:id
  --------------------------------------------------- */
  deleteBatch: (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM batches WHERE id = ?`;
    db.query(sql, [id], (err) => {
      if (err) return res.status(500).json({ success: false, error: err });
      return res.json({ success: true, message: "Batch deleted" });
    });
  }
};

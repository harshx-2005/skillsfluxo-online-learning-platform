const db = require("../config/db");

module.exports = {

  // GET COURSES (role-based)
  getCourses: (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    let sql = "";
    let params = [];

    if (role === "admin") {
      sql = `SELECT * FROM courses`;
    } else if (role === "trainer") {
      sql = `
        SELECT c.*
        FROM courses c
        JOIN user_courses uc ON uc.course_id = c.id
        WHERE uc.user_id = ? AND uc.role_in_course = 'trainer'
      `;
      params = [userId];
    } else {
      sql = `
        SELECT * FROM courses
        WHERE is_approved = 1 AND is_active = 1
      `;
    }

    db.query(sql, params, (err, rows) => {
      if (err) return res.send(err);
      return res.send(rows);
    });
  },

  // GET COURSE BY ID (role-based)
  getCourseById: (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    let sql = "";
    let params = [];

    if (role === "admin") {
      sql = `SELECT * FROM courses WHERE id = ?`;
      params = [id];
    } else if (role === "trainer") {
      sql = `
        SELECT c.*
        FROM courses c
        JOIN user_courses uc ON uc.course_id = c.id
        WHERE c.id = ? AND uc.user_id = ? AND uc.role_in_course = 'trainer'
      `;
      params = [id, userId];
    } else {
      sql = `
        SELECT *
        FROM courses
        WHERE id = ? AND is_approved = 1 AND is_active = 1
      `;
      params = [id];
    }

    db.query(sql, params, (err, rows) => {
      if (err) return res.send(err);
      if (rows.length === 0) {
        return res.send({ message: "Course not found or access denied" });
      }
      return res.send(rows[0]);
    });
  },



  // PUBLIC COURSE LIST
  getPublicCourses: (req, res) => {
    const sql = `
      SELECT id, name, description, thumbnail, level, price, category, is_active
      FROM courses
      WHERE is_active = 1 AND is_approved = 1
    `;

    db.query(sql, (err, rows) => {
      if (err) return res.status(500).json(err);
      return res.json(rows);
    });
  }
};

// controllers/export.controller.js
const db = require("../config/db");
const ExcelJS = require("exceljs");

// Small helper to use async/await with MySQL
const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });

module.exports = {
  // ======================================================
  // 1) EXPORT ALL STUDENTS (with course + batch mapping)
  // ======================================================
  exportAllStudents: async (req, res) => {
    try {
      const sql = `
        SELECT 
          u.id AS student_id,
          u.name AS student_name,
          u.email,
          u.phone,
          u.created_at,
          c.id AS course_id,
          c.name AS course_name,
          b.id AS batch_id,
          b.title AS batch_name
        FROM users u
        LEFT JOIN user_courses uc 
          ON uc.user_id = u.id 
          AND uc.role_in_course = 'student'
        LEFT JOIN courses c 
          ON c.id = uc.course_id
        LEFT JOIN user_course_batch ucb 
          ON ucb.user_id = u.id
        LEFT JOIN batches b 
          ON b.id = ucb.batch_id
        WHERE u.role = 'student'
        ORDER BY u.id ASC
      `;

      const rows = await runQuery(sql);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Students");

      sheet.columns = [
        { header: "Student ID", key: "student_id", width: 12 },
        { header: "Student Name", key: "student_name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Joined At", key: "created_at", width: 20 },
        { header: "Course ID", key: "course_id", width: 12 },
        { header: "Course Name", key: "course_name", width: 25 },
        { header: "Batch ID", key: "batch_id", width: 12 },
        { header: "Batch Name", key: "batch_name", width: 25 }
      ];

      rows.forEach(r => sheet.addRow(r));

      sheet.getRow(1).font = { bold: true };

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=students_export.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.log("exportAllStudents Error:", err);
      return res.status(500).send({ message: "Server error", error: err });
    }
  },

  // ======================================================
  // 2) EXPORT ALL TRAINERS (with course + batch mapping)
  // ======================================================
  exportAllTrainers: async (req, res) => {
    try {
      const sql = `
        SELECT 
          u.id AS trainer_id,
          u.name AS trainer_name,
          u.email,
          u.phone,
          u.created_at,
          c.id AS course_id,
          c.name AS course_name,
          b.id AS batch_id,
          b.name AS batch_name
        FROM users u
        LEFT JOIN user_courses uc 
          ON uc.user_id = u.id 
          AND uc.role_in_course = 'trainer'
        LEFT JOIN courses c 
          ON c.id = uc.course_id
        LEFT JOIN user_course_batch ucb 
          ON ucb.user_id = u.id
        LEFT JOIN batches b 
          ON b.id = ucb.batch_id
        WHERE u.role = 'trainer'
        ORDER BY u.id ASC
      `;

      const rows = await runQuery(sql);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Trainers");

      sheet.columns = [
        { header: "Trainer ID", key: "trainer_id", width: 12 },
        { header: "Trainer Name", key: "trainer_name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Joined At", key: "created_at", width: 20 },
        { header: "Course ID", key: "course_id", width: 12 },
        { header: "Course Name", key: "course_name", width: 25 },
        { header: "Batch ID", key: "batch_id", width: 12 },
        { header: "Batch Name", key: "batch_name", width: 25 }
      ];

      rows.forEach(r => sheet.addRow(r));
      sheet.getRow(1).font = { bold: true };

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=trainers_export.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.log("exportAllTrainers Error:", err);
      return res.status(500).send({ message: "Server error", error: err });
    }
  },

  // ======================================================
  // 3) EXPORT COURSES (with counts)
  // ======================================================
  exportCourses: async (req, res) => {
    try {
      const sql = `
        SELECT
          c.id,
          c.name,
          c.description,
          c.is_active,
          c.is_approved,
          c.created_at,
          (SELECT COUNT(*) 
             FROM user_courses uc 
             WHERE uc.course_id = c.id AND uc.role_in_course = 'student') AS total_students,
          (SELECT COUNT(*) 
             FROM user_courses uc2 
             WHERE uc2.course_id = c.id AND uc2.role_in_course = 'trainer') AS total_trainers,
          (SELECT COUNT(*) 
             FROM batches b 
             WHERE b.course_id = c.id) AS total_batches
        FROM courses c
        ORDER BY c.id ASC
      `;

      const rows = await runQuery(sql);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Courses");

      sheet.columns = [
        { header: "Course ID", key: "id", width: 10 },
        { header: "Course Name", key: "name", width: 30 },
        { header: "Description", key: "description", width: 40 },
        { header: "Is Active", key: "is_active", width: 10 },
        { header: "Is Approved", key: "is_approved", width: 12 },
        { header: "Created At", key: "created_at", width: 20 },
        { header: "Total Students", key: "total_students", width: 15 },
        { header: "Total Trainers", key: "total_trainers", width: 15 },
        { header: "Total Batches", key: "total_batches", width: 15 }
      ];

      rows.forEach(r => sheet.addRow(r));
      sheet.getRow(1).font = { bold: true };

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=courses_export.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.log("exportCourses Error:", err);
      return res.status(500).send({ message: "Server error", error: err });
    }
  },

  // ======================================================
  // 4) EXPORT BATCHES (with course + counts)
  // ======================================================
  exportBatches: async (req, res) => {
    try {
      const sql = `
        SELECT
          b.id,
          b.name AS batch_name,
          b.title,
          b.start_date,
          b.end_date,
          b.is_active,
          c.id AS course_id,
          c.name AS course_name,
          (SELECT COUNT(*) 
             FROM user_course_batch ucb 
             WHERE ucb.batch_id = b.id) AS total_students
        FROM batches b
        LEFT JOIN courses c ON c.id = b.course_id
        ORDER BY b.id ASC
      `;

      const rows = await runQuery(sql);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Batches");

      sheet.columns = [
        { header: "Batch ID", key: "id", width: 10 },
        { header: "Batch Name", key: "batch_name", width: 25 },
        { header: "Batch Title", key: "title", width: 25 },
        { header: "Course ID", key: "course_id", width: 10 },
        { header: "Course Name", key: "course_name", width: 25 },
        { header: "Start Date", key: "start_date", width: 18 },
        { header: "End Date", key: "end_date", width: 18 },
        { header: "Is Active", key: "is_active", width: 10 },
        { header: "Total Students", key: "total_students", width: 15 }
      ];

      rows.forEach(r => sheet.addRow(r));
      sheet.getRow(1).font = { bold: true };

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=batches_export.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.log("exportBatches Error:", err);
      return res.status(500).send({ message: "Server error", error: err });
    }
  },

  // ======================================================
  // 5) EXPORT DASHBOARD – MULTI-SHEET WORKBOOK
  //    (Students, Trainers, Courses, Batches)
  // ======================================================
  exportDashboardWorkbook: async (req, res) => {
    try {
      // Reuse above queries
      const studentsSql = `
        SELECT 
          u.id AS student_id,
          u.name AS student_name,
          u.email,
          u.phone,
          u.created_at,
          c.id AS course_id,
          c.name AS course_name,
          b.id AS batch_id,
          b.name AS batch_name
        FROM users u
        LEFT JOIN user_courses uc 
          ON uc.user_id = u.id 
          AND uc.role_in_course = 'student'
        LEFT JOIN courses c 
          ON c.id = uc.course_id
        LEFT JOIN user_course_batch ucb 
          ON ucb.user_id = u.id
        LEFT JOIN batches b 
          ON b.id = ucb.batch_id
        WHERE u.role = 'student'
        ORDER BY u.id ASC
      `;

      const trainersSql = `
        SELECT 
          u.id AS trainer_id,
          u.name AS trainer_name,
          u.email,
          u.phone,
          u.created_at,
          c.id AS course_id,
          c.name AS course_name,
          b.id AS batch_id,
          b.name AS batch_name
        FROM users u
        LEFT JOIN user_courses uc 
          ON uc.user_id = u.id 
          AND uc.role_in_course = 'trainer'
        LEFT JOIN courses c 
          ON c.id = uc.course_id
        LEFT JOIN user_course_batch ucb 
          ON ucb.user_id = u.id
        LEFT JOIN batches b 
          ON b.id = ucb.batch_id
        WHERE u.role = 'trainer'
        ORDER BY u.id ASC
      `;

      const coursesSql = `
        SELECT
          c.id,
          c.name,
          c.description,
          c.is_active,
          c.is_approved,
          c.created_at,
          (SELECT COUNT(*) 
             FROM user_courses uc 
             WHERE uc.course_id = c.id AND uc.role_in_course = 'student') AS total_students,
          (SELECT COUNT(*) 
             FROM user_courses uc2 
             WHERE uc2.course_id = c.id AND uc2.role_in_course = 'trainer') AS total_trainers,
          (SELECT COUNT(*) 
             FROM batches b 
             WHERE b.course_id = c.id) AS total_batches
        FROM courses c
        ORDER BY c.id ASC
      `;

      const batchesSql = `
        SELECT
          b.id,
          b.name AS batch_name,
          b.title,
          b.start_date,
          b.end_date,
          b.is_active,
          c.id AS course_id,
          c.name AS course_name,
          (SELECT COUNT(*) 
             FROM user_course_batch ucb 
             WHERE ucb.batch_id = b.id) AS total_students
        FROM batches b
        LEFT JOIN courses c ON c.id = b.course_id
        ORDER BY b.id ASC
      `;

      const [students, trainers, courses, batches] = await Promise.all([
        runQuery(studentsSql),
        runQuery(trainersSql),
        runQuery(coursesSql),
        runQuery(batchesSql)
      ]);

      const workbook = new ExcelJS.Workbook();

      // Students Sheet
      const sSheet = workbook.addWorksheet("Students");
      sSheet.columns = [
        { header: "Student ID", key: "student_id", width: 12 },
        { header: "Student Name", key: "student_name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Joined At", key: "created_at", width: 20 },
        { header: "Course ID", key: "course_id", width: 12 },
        { header: "Course Name", key: "course_name", width: 25 },
        { header: "Batch ID", key: "batch_id", width: 12 },
        { header: "Batch Name", key: "batch_name", width: 25 }
      ];
      students.forEach(r => sSheet.addRow(r));
      sSheet.getRow(1).font = { bold: true };

      // Trainers Sheet
      const tSheet = workbook.addWorksheet("Trainers");
      tSheet.columns = [
        { header: "Trainer ID", key: "trainer_id", width: 12 },
        { header: "Trainer Name", key: "trainer_name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Joined At", key: "created_at", width: 20 },
        { header: "Course ID", key: "course_id", width: 12 },
        { header: "Course Name", key: "course_name", width: 25 },
        { header: "Batch ID", key: "batch_id", width: 12 },
        { header: "Batch Name", key: "batch_name", width: 25 }
      ];
      trainers.forEach(r => tSheet.addRow(r));
      tSheet.getRow(1).font = { bold: true };

      // Courses Sheet
      const cSheet = workbook.addWorksheet("Courses");
      cSheet.columns = [
        { header: "Course ID", key: "id", width: 10 },
        { header: "Course Name", key: "name", width: 30 },
        { header: "Description", key: "description", width: 40 },
        { header: "Is Active", key: "is_active", width: 10 },
        { header: "Is Approved", key: "is_approved", width: 12 },
        { header: "Created At", key: "created_at", width: 20 },
        { header: "Total Students", key: "total_students", width: 15 },
        { header: "Total Trainers", key: "total_trainers", width: 15 },
        { header: "Total Batches", key: "total_batches", width: 15 }
      ];
      courses.forEach(r => cSheet.addRow(r));
      cSheet.getRow(1).font = { bold: true };

      // Batches Sheet
      const bSheet = workbook.addWorksheet("Batches");
      bSheet.columns = [
        { header: "Batch ID", key: "id", width: 10 },
        { header: "Batch Name", key: "batch_name", width: 25 },
        { header: "Batch Title", key: "title", width: 25 },
        { header: "Course ID", key: "course_id", width: 10 },
        { header: "Course Name", key: "course_name", width: 25 },
        { header: "Start Date", key: "start_date", width: 18 },
        { header: "End Date", key: "end_date", width: 18 },
        { header: "Is Active", key: "is_active", width: 10 },
        { header: "Total Students", key: "total_students", width: 15 }
      ];
      batches.forEach(r => bSheet.addRow(r));
      bSheet.getRow(1).font = { bold: true };

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=lms_dashboard_export.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.log("exportDashboardWorkbook Error:", err);
      return res.status(500).send({ message: "Server error", error: err });
    }
  }
};

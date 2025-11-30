const db = require("../config/db");
const nodemailer = require("nodemailer");

module.exports = {

    /* -----------------------------------------------------------
   🆕 ADMIN: Assign student to Course + Batch (SAFE + NO DUPLICATES)
----------------------------------------------------------- */
    assignStudentCourseBatch: (req, res) => {
        const { student_id, course_id, batch_id } = req.body;

        if (!student_id || !course_id || !batch_id) {
            return res.send({ message: "student_id, course_id and batch_id are required" });
        }

        // STEP 1: Validate student
        const studentSql = `
        SELECT * FROM users
        WHERE id = ? AND role = 'student' AND is_active = 1
    `;

        db.query(studentSql, [student_id], (err1, users) => {
            if (err1) return res.send(err1);
            if (users.length === 0) return res.send({ message: "Invalid student" });

            // STEP 2: Validate course
            const courseSql = `
            SELECT * FROM courses
            WHERE id = ? AND is_active = 1 AND is_approved = 1
        `;

            db.query(courseSql, [course_id], (err2, courses) => {
                if (err2) return res.send(err2);
                if (courses.length === 0) return res.send({ message: "Invalid or unapproved course" });

                // STEP 3: Validate batch belongs to course
                const batchSql = `
                SELECT * FROM batches
                WHERE id = ? AND course_id = ? AND is_active = 1
            `;

                db.query(batchSql, [batch_id, course_id], (err3, batches) => {
                    if (err3) return res.send(err3);
                    if (batches.length === 0) return res.send({ message: "Batch does not belong to this course" });

                    /* -----------------------------------------------
                       STEP 4: Check duplicate BEFORE INSERT
                    ----------------------------------------------- */
                    const checkSql = `
                    SELECT * FROM user_course_batch
                    WHERE user_id = ? AND course_id = ? AND batch_id = ?
                `;

                    db.query(checkSql, [student_id, course_id, batch_id], (errCheck, rows) => {
                        if (errCheck) return res.send(errCheck);

                        if (rows.length > 0) {
                            return res.send({
                                message: "Student already assigned to this course and batch",
                                student_id,
                                course_id,
                                batch_id
                            });
                        }

                        // STEP 5: Assign student → course
                        const courseInsertSql = `
                        INSERT INTO user_courses (user_id, course_id, role_in_course)
                        VALUES (?, ?, 'student')
                    `;

                        db.query(courseInsertSql, [student_id, course_id], (err4) => {
                            if (err4 && err4.code !== "ER_DUP_ENTRY") return res.send(err4);

                            // STEP 6: Assign student → batch
                            const batchInsertSql = `
                            INSERT INTO user_course_batch (user_id, course_id, batch_id)
                            VALUES (?, ?, ?)
                        `;

                            db.query(batchInsertSql, [student_id, course_id, batch_id], (err5) => {
                                if (err5 && err5.code !== "ER_DUP_ENTRY") return res.send(err5);

                                return res.send({
                                    message: "Student assigned to course + batch successfully",
                                    student_id,
                                    course_id,
                                    batch_id
                                });
                            });
                        });
                    });
                });
            });
        });
    },


    /* -----------------------------------------------------------
   🆕 ADMIN: Assign Trainer to Course + Batch (SAFE + NO DUPLICATES)
----------------------------------------------------------- */
    assignTrainerCourseBatch: (req, res) => {
        const { trainer_id, course_id, batch_id } = req.body;

        if (!trainer_id || !course_id || !batch_id) {
            return res.send({ message: "trainer_id, course_id and batch_id required" });
        }

        // STEP 1: Validate trainer
        const trainerSql = `
        SELECT * FROM users
        WHERE id = ? AND role = 'trainer' AND is_active = 1
    `;

        db.query(trainerSql, [trainer_id], (err, trainers) => {
            if (err) return res.send(err);
            if (trainers.length === 0) return res.send({ message: "Invalid trainer" });

            // STEP 2: Validate batch belongs to course
            const batchSql = `
            SELECT * FROM batches
            WHERE id = ? AND course_id = ? AND is_active = 1
        `;

            db.query(batchSql, [batch_id, course_id], (err2, batches) => {
                if (err2) return res.send(err2);
                if (batches.length === 0) return res.send({ message: "Batch does not belong to this course" });

                /* -----------------------------------------------
                   STEP 3: Check duplicate BEFORE INSERT
                ----------------------------------------------- */
                const checkSql = `
                SELECT * FROM user_course_batch
                WHERE user_id = ? AND course_id = ? AND batch_id = ?
            `;

                db.query(checkSql, [trainer_id, course_id, batch_id], (errCheck, rows) => {
                    if (errCheck) return res.send(errCheck);

                    if (rows.length > 0) {
                        return res.send({
                            message: "Trainer already assigned to this course and batch",
                            trainer_id,
                            course_id,
                            batch_id
                        });
                    }

                    // STEP 4: Assign trainer → course
                    const courseInsertSql = `
                    INSERT INTO user_courses (user_id, course_id, role_in_course)
                    VALUES (?, ?, 'trainer')
                `;

                    db.query(courseInsertSql, [trainer_id, course_id], (err4) => {
                        if (err4 && err4.code !== "ER_DUP_ENTRY") return res.send(err4);

                        // STEP 5: Assign trainer → batch
                        const batchInsertSql = `
                        INSERT INTO user_course_batch (user_id, course_id, batch_id)
                        VALUES (?, ?, ?)
                    `;

                        db.query(batchInsertSql, [trainer_id, course_id, batch_id], (err5) => {
                            if (err5 && err5.code !== "ER_DUP_ENTRY") return res.send(err5);

                            return res.send({
                                message: "Trainer assigned to course + batch successfully",
                                trainer_id,
                                course_id,
                                batch_id
                            });
                        });
                    });
                });
            });
        });
    },


    /* -----------------------------------------------------------
       STUDENT: Enrollment Request → Email Admin
       ----------------------------------------------------------- */
    /* -----------------------------------------------------------
   STUDENT: Enrollment Request → Save DB + Email Admin
----------------------------------------------------------- */
    enrollmentRequest: (req, res) => {
        const student_id = req.user.id;
        const student_email = req.user.email;
        const student_name = req.user.name;
        const { course_id, batch_id } = req.body;

        if (!course_id) {
            return res.status(400).json({ message: "course_id required" });
        }

        // STEP 1 — INSERT into DB
        const sqlInsert = `
        INSERT INTO enrollment_requests (student_id, course_id, batch_id)
        VALUES (?, ?, ?)
    `;

        db.query(sqlInsert, [student_id, course_id, batch_id || null], (err, result) => {
            if (err) return res.status(500).json(err);

            const request_id = result.insertId;

            // STEP 2 — Fetch course name
            const sqlCourse = `SELECT name FROM courses WHERE id = ?`;

            db.query(sqlCourse, [course_id], (err2, courseRows) => {
                if (err2) return res.status(500).json(err2);
                if (courseRows.length === 0) {
                    return res.status(404).json({ message: "Course not found" });
                }

                const courseName = courseRows[0].name;

                // STEP 3 — Send Email
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.ADMIN_EMAIL,
                        pass: process.env.ADMIN_PASS
                    },
                    tls: { rejectUnauthorized: false }
                });

                const mailOptions = {
                    from: student_email,
                    to: process.env.ADMIN_EMAIL,
                    subject: `Enrollment Request: ${student_name}`,
                    html: `
                    <h3>New Enrollment Request</h3>
                    <p><b>Name:</b> ${student_name}</p>
                    <p><b>Email:</b> ${student_email}</p>
                    <p><b>Student ID:</b> ${student_id}</p>
                    <p><b>Course:</b> ${courseName}</p>
                    <p><b>Request ID:</b> ${request_id}</p>

                    <hr>
                    <h4>Approve Enrollment (API)</h4>
                    <pre>
POST /api/enroll/approve
{
  "request_id": ${request_id},
  "batch_id": "batch here"
}
                    </pre>
                `
                };

                transporter.sendMail(mailOptions, () => {
                    return res.json({
                        success: true,
                        message: "Enrollment request submitted",
                        request_id,
                        course_id,
                        course: courseName
                    });
                });
            });
        });
    },

    getAllRequests: (req, res) => {
        const sql = `
      SELECT er.*, u.name AS student_name, c.name AS course_name
      FROM enrollment_requests er
      JOIN users u ON u.id = er.student_id
      JOIN courses c ON c.id = er.course_id
      WHERE er.status = 'pending'
      ORDER BY er.created_at DESC
    `;

        db.query(sql, (err, rows) => {
            if (err) return res.status(500).send(err);
            res.send({ success: true, data: rows });
        });
    },

    approveRequest: (req, res) => {
        const { request_id, batch_id } = req.body;

        const sql = `
      SELECT * FROM enrollment_requests
      WHERE id = ? AND status = 'pending'
    `;

        db.query(sql, [request_id], (err, rows) => {
            if (err) return res.send(err);
            if (rows.length === 0) return res.send({ message: "Invalid request" });

            const reqData = rows[0];

            // Assign using your existing safe method
            module.exports.assignStudentCourseBatch(
                {
                    body: {
                        student_id: reqData.student_id,
                        course_id: reqData.course_id,
                        batch_id
                    }
                },
                {
                    send: (response) => {
                        // Mark as approved
                        const updateSql = `
                  UPDATE enrollment_requests
                  SET status = 'approved'
                  WHERE id = ?
                `;

                        db.query(updateSql, [request_id], () => {
                            res.send({
                                success: true,
                                message: "Enrollment approved",
                                details: response
                            });
                        });
                    }
                }
            );
        });
    },

    /* -----------------------------------------------------------
       ADMIN: Reject Enrollment Request
    ----------------------------------------------------------- */
    rejectRequest: (req, res) => {
        const { request_id } = req.body;

        if (!request_id) {
            return res.status(400).json({ message: "request_id required" });
        }

        // Verify that the request exists & is pending
        const sql = `
      SELECT * FROM enrollment_requests
      WHERE id = ? AND status = 'pending'
    `;

        db.query(sql, [request_id], (err, rows) => {
            if (err) return res.status(500).send(err);

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "Invalid request or already processed"
                });
            }

            // Reject the request
            const updateSql = `
            UPDATE enrollment_requests
            SET status = 'rejected'
            WHERE id = ?
        `;

            db.query(updateSql, [request_id], (err2) => {
                if (err2) return res.status(500).send(err2);

                return res.json({
                    success: true,
                    message: "Enrollment request rejected successfully",
                    request_id
                });
            });
        });
    }


};

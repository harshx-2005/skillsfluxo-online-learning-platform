// controllers/profile.controller.js
const db = require("../config/db");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

module.exports = {

  // ================================================
  // UPDATE PROFILE (phone, name, resume, profile pic)
  // ================================================
  updateProfile: (req, res) => {
    const user = req.user;
    const userId = user.id;
    const role = user.role;

    const { phone, name } = req.body;

    const resumeFile = req.files?.resume?.[0];
    const profilePicFile = req.files?.profile_pic?.[0];

    const updates = [];

    // -----------------------------
    // PHONE + NAME
    // -----------------------------
    if (phone) updates.push(`phone='${phone}'`);
    if (name) updates.push(`name='${name}'`);

    // -----------------------------
    // RESUME (LOCAL) – STUDENTS ONLY
    // -----------------------------
    if (resumeFile) {
      if (role !== "student") {
        fs.unlink(resumeFile.path, () => {});
        return res.send({ message: "Only students can upload resume" });
      }

      const resumeRelative = `/uploads/resumes/${resumeFile.filename}`;
      updates.push(`resume='${resumeRelative}'`);
    }

    // -----------------------------
    // PROFILE PIC (LOCAL)
    // -----------------------------
    if (profilePicFile) {
      const picRelative = `/uploads/profile_pics/${profilePicFile.filename}`;
      updates.push(`profile_pic='${picRelative}'`);
    }

    // -----------------------------
    // NOTHING TO UPDATE?
    // -----------------------------
    if (updates.length === 0) {
      return res.send({ message: "No fields to update" });
    }

    // -----------------------------
    // UPDATE SQL
    // -----------------------------
    const sql = `
      UPDATE users
      SET ${updates.join(",")}
      WHERE id = ?
    `;

    db.query(sql, [userId], (err) => {
      if (err) return res.send(err);

      return res.send({
        message: "Profile updated successfully",
        updated: updates
      });
    });
  },

  // ================================================
  // GET RESUME
  // ================================================
  getResume: (req, res) => {
    const userId = req.user.id;

    const sql = `SELECT resume FROM users WHERE id = ?`;

    db.query(sql, [userId], (err, rows) => {
      if (err) return res.send(err);

      if (!rows.length || !rows[0].resume) {
        return res.send({ message: "No resume found" });
      }

      return res.send({ resume: rows[0].resume });
    });
  },

  // ================================================
  // GET PROFILE PIC
  // ================================================
  getProfilePic: (req, res) => {
    const userId = req.user.id;

    const sql = `SELECT profile_pic FROM users WHERE id = ?`;

    db.query(sql, [userId], (err, rows) => {
      if (err) return res.send(err);

      if (!rows.length || !rows[0].profile_pic) {
        return res.send({ message: "No profile picture found" });
      }

      return res.send({ profile_pic: rows[0].profile_pic });
    });
  },

  // ================================================
  // DELETE ACCOUNT (SOFT DELETE)
  // ================================================
  deleteAccountDirect: (req, res) => {
    const userId = req.user.id;

    const sql = `UPDATE users SET is_active = 0 WHERE id = ?`;

    db.query(sql, [userId], (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.affectedRows === 0) {
        return res.status(404).send({ message: "User not found" });
      }

      return res.send({
        message: "Account deleted successfully (soft delete applied)",
        user_id: userId,
        note: "User can no longer login"
      });
    });
  }
};

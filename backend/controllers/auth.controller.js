// controllers/auth.controller.js
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Common transporter for emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS
  },
  tls: { rejectUnauthorized: false }
});

module.exports = {

  // REGISTER USER
  register: (req, res) => {
    console.log("Register Request Body:", req.body);
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone || null;
    const password = req.body.password;
    const role = req.body.role; // admin / trainer / student

    if (!name || !email || !password || !phone) {
      console.log("Missing fields");
      return res.status(400).send({ message: "Name, email, password and phone required" });
    }

    const checkSql = `SELECT * FROM users WHERE email = ?`;

    db.query(checkSql, [email], async (err, result) => {
      if (err) {
        console.error("Check Email Error:", err);
        return res.status(500).send(err);
      }

      if (result.length > 0) {
        console.log("Email already exists:", email);
        return res.status(400).send({ message: "Email already exists" });
      }

      try {
        const hashed = await bcrypt.hash(password, 10);
        const finalRole = role ? role : "student";

        const insertSql = `
          INSERT INTO users (name, email, phone, password, role, is_active)
          VALUES (?, ?, ?, ?, ?, 1)
        `;

        db.query(insertSql, [name, email, phone, hashed, finalRole], (err2, result2) => {
          if (err2) {
            console.error("Insert User Error:", err2);
            return res.status(500).send(err2);
          }

          console.log("User Registered Successfully:", result2.insertId);

          const token = jwt.sign(
            { id: result2.insertId, email: email, role: finalRole, name: name },
            JWT_SECRET,
            { expiresIn: "1d" }
          );

          return res.status(201).send({
            message: "User registered",
            user: {
              id: result2.insertId,
              name,
              email,
              role: finalRole,
              phone: phone
            },
            token
          });
        });
      } catch (hashError) {
        console.error("Hashing Error:", hashError);
        return res.status(500).send({ message: "Error processing password" });
      }
    });
  },

  // LOGIN USER
  login: (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const secretKey = req.body.secretKey; // for admin
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password required" });
    }

    const sql = `SELECT * FROM users WHERE email='${email}'`;
    console.log(`Login attempt for email: '${email}'`);

    db.query(sql, async (err, result) => {
      if (err) {
        console.log("Login SQL Error:", err);
        return res.status(500).send(err);
      }
      console.log(`Query result length: ${result.length}`);

      if (result.length === 0) {
        return res.status(404).send({ message: "Invalid email", debug_email: email, debug_sql: sql });
      }

      const user = result[0];

      if (user.is_active === 0) {
        return res.status(403).send({ message: "Account is pending approval. Please contact admin." });
      }

      // Admin role requires secret key
      if (user.role === "admin") {
        if (!secretKey) {
          return res.status(401).send({ message: "Admin secret key required" });
        }

        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
          return res.status(401).send({ message: "Invalid admin secret key" });
        }
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).send({ message: "Invalid password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
      );

      return res.status(200).send({
        message: "Login successful",
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profile_pic: user.profile_pic
        }
      });
    });
  },

  // PROTECT ROUTE
  verifyToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.send({ message: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Token Error:", err);
        return res.send({ message: "Invalid or expired token" });
      }

      req.user = decoded; // { id, email, role, name }
      next();
    });
  },

  // FORGOT PASSWORD
  forgotPassword: (req, res) => {
    const email = req.body.email;

    if (!email) {
      return res.send({ message: "Email is required" });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;

    db.query(sql, [email], (err, rows) => {
      if (err) return res.send(err);

      if (rows.length === 0) {
        return res.send({ message: "If this email exists, a reset link has been sent" });
      }

      const user = rows[0];

      const resetToken = jwt.sign(
        { id: user.id, email: user.email, action: "reset_password" },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: "Password Reset Request",
        html: `
          <h3>Password Reset</h3>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click the link below:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you did not request this, ignore this email.</p>
        `
      };

      transporter.sendMail(mailOptions, (err2) => {
        if (err2) {
          console.log("Forgot Password Email Error:", err2);
          return res.send({ message: "Failed to send reset email" });
        }

        return res.send({
          message: "If this email exists, a reset link has been sent"
        });
      });
    });
  },

  // RESET PASSWORD
  resetPassword: (req, res) => {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.send({ message: "token and new_password are required" });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err || !decoded || decoded.action !== "reset_password") {
        console.log("Reset token error:", err);
        return res.send({ message: "Invalid or expired reset token" });
      }

      const userId = decoded.id;
      const hashed = await bcrypt.hash(new_password, 10);

      const sql = `UPDATE users SET password = ? WHERE id = ?`;

      db.query(sql, [hashed, userId], (err2) => {
        if (err2) return res.send(err2);

        return res.send({ message: "Password reset successfully" });
      });
    });
  },

  // CHANGE PASSWORD
  changePassword: (req, res) => {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.send({ message: "old_password and new_password are required" });
    }

    const sql = `SELECT * FROM users WHERE id = ?`;

    db.query(sql, [userId], async (err, rows) => {
      if (err) return res.send(err);
      if (rows.length === 0) {
        return res.send({ message: "User not found" });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(old_password, user.password);

      if (!isMatch) {
        return res.send({ message: "Old password is incorrect" });
      }

      const hashed = await bcrypt.hash(new_password, 10);
      const updateSql = `UPDATE users SET password = ? WHERE id = ?`;

      db.query(updateSql, [hashed, userId], (err2) => {
        if (err2) return res.send(err2);

        return res.send({ message: "Password changed successfully" });
      });
    });
  },

  // LOGOUT
  logout: (req, res) => {
    return res.send({ message: "Logged out successfully. Please remove token on client." });
  },

  // ADMIN LOGIN
  adminLogin: (req, res) => {
    const { email, password, secretKey } = req.body;

    if (!email || !password || !secretKey) {
      return res.status(400).send({ message: "Email, password & admin secret key required" });
    }

    const sql = `SELECT * FROM users WHERE email='${email}' AND role='admin'`;

    db.query(sql, async (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.length === 0) {
        return res.status(404).send({ message: "Invalid admin account" });
      }

      const admin = result[0];

      if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(401).send({ message: "Invalid admin secret key" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).send({ message: "Invalid password" });
      }

      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          name: admin.name
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).send({
        message: "Admin login successful",
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    });
  }
};

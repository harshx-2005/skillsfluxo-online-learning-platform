const cron = require("node-cron");
const db = require("../config/db");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { generatePDF } = require("../utils/pdfGenerator");
require("dotenv").config();

// MAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS
  },
  tls: { rejectUnauthorized: false }
});


// Convert logo to base64 once
const logoBase64 = fs.readFileSync(
  path.join(__dirname, "../assets/aft.png"),
  { encoding: "base64" }
);


// RUN DAILY AT 9 AM
cron.schedule("0 9 * * *", () => {
  console.log("📨 Running Daily Pending Report...");

  // QUERIES
  const q1 = `
    SELECT u.id, u.name, u.email, u.phone, u.created_at
    FROM users u
    JOIN user_courses uc ON uc.user_id = u.id
    WHERE u.role='student'
    AND u.id NOT IN (SELECT user_id FROM user_course_batch)
  `;

  const q2 = `
    SELECT id, name, email, phone, created_at
    FROM users 
    WHERE role='student'
    AND id NOT IN (SELECT user_id FROM user_courses)
    AND id NOT IN (SELECT user_id FROM user_course_batch)
  `;

  const q3 = `
    SELECT u.id, u.name, u.email, u.phone, u.created_at
    FROM users u
    JOIN user_courses uc ON uc.user_id = u.id
    WHERE u.role='trainer'
    AND u.id NOT IN (SELECT user_id FROM user_course_batch)
  `;

  const q4 = `
    SELECT id, name, email, phone, created_at
    FROM users 
    WHERE role='trainer'
    AND id NOT IN (SELECT user_id FROM user_courses)
    AND id NOT IN (SELECT user_id FROM user_course_batch)
  `;

  // EXECUTION
  db.query(q1, (err1, scnb) => {
    if (err1) return console.log("Q1 Error:", err1);

    db.query(q2, (err2, sncnb) => {
      if (err2) return console.log("Q2 Error:", err2);

      db.query(q3, (err3, tcnb) => {
        if (err3) return console.log("Q3 Error:", err3);

        db.query(q4, async (err4, tncnb) => {
          if (err4) return console.log("Q4 Error:", err4);

          try {
            // SUMMARY BLOCK
            const summaryBlock = `
              <div style="border:1px solid #eee; padding:12px; margin-bottom:20px;">
                <h3 style="margin-top:0; color:#d35400;">Summary</h3>
                <p>Students (Course but NO Batch): <b>${scnb.length}</b></p>
                <p>Students (No Course & No Batch): <b>${sncnb.length}</b></p>
                <p>Trainers (Course but NO Batch): <b>${tcnb.length}</b></p>
                <p>Trainers (No Course & No Batch): <b>${tncnb.length}</b></p>
              </div>
            `;

            // TABLE BUILDER
            const makeTable = (title, data) => {
              if (data.length === 0) {
                return `<h3 style="color:#d35400;">${title}</h3><p>None 🎉</p>`;
              }

              const rows = data
                .map(
                  d => `
                  <tr>
                    <td>${d.id}</td>
                    <td>${d.name}</td>
                    <td>${d.email}</td>
                    <td>${d.phone}</td>
                    <td>${d.created_at}</td>
                  </tr>
                `
                )
                .join("");

              return `
                <h3 style="color:#d35400;">${title}</h3>
                <table cellpadding="6" cellspacing="0" width="100%" style="border-collapse:collapse; font-size:12px;">
                  <thead>
                    <tr style="background:#d35400; color:white;">
                      <th align="left">ID</th>
                      <th align="left">Name</th>
                      <th align="left">Email</th>
                      <th align="left">Phone</th>
                      <th align="left">Joined</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
                <br>
              `;
            };

            // --------------------------
            // 📌 PROFESSIONAL EMAIL HTML
            // --------------------------
            const emailHTML = `
              <div style="font-family:Arial; background:#f6f6f6; padding:20px;">
                <div style="background:white; padding:20px; border-radius:12px; text-align:center;">
                  <img src="cid:autoflowLogo" style="width:130px; height:auto;" />
                  <h1 style="margin:8px 0; font-size:20px;">AutoFlow Technologies</h1>
                  <p style="margin:0; color:#d35400;">Think Automation</p>
                </div>

                <br>

                <div style="background:white; padding:20px; border-radius:12px;">
                  <p>Hello Admin,</p>
                  <p>Your updated daily LMS assignment report is attached as a PDF.</p>

                  <ul style="font-size:13px; color:#555;">
                    <li>Students pending batch: <b>${scnb.length}</b></li>
                    <li>Students with no course & batch: <b>${sncnb.length}</b></li>
                    <li>Trainers pending batch: <b>${tcnb.length}</b></li>
                    <li>Trainers with no course & batch: <b>${tncnb.length}</b></li>
                  </ul>

                  <p style="font-size:12px; color:#999;">Please refer to the PDF for the detailed list.</p>
                </div>

                <br>

                <div style="text-align:center; color:#777; font-size:11px;">
                  © 2025 AutoFlow Technologies — Empowering Automation
                </div>
              </div>
            `;

            // --------------------------
            // 📌 FULL PDF HTML
            // --------------------------
            const pdfHTML = `
              <html>
              <body style="font-family:Arial; font-size:12px;">
                <div style="display:flex; align-items:center;">
                  <img src="data:image/png;base64,${logoBase64}" style="width:90px; margin-right:25px;" />
                  <div>
                    <h1 style="margin:0;">AutoFlow Technologies</h1>
                    <p style="margin:2px 0; color:#d35400;">Think Automation</p>
                  </div>
                </div>

                <hr>

                <h2>Daily LMS Assignment Report</h2>
                <p style="color:#777;">Generated: ${new Date().toLocaleString()}</p>

                ${summaryBlock}

                ${makeTable("Students Assigned to Course but Not Batch", scnb)}
                ${makeTable("Students With No Course & No Batch", sncnb)}
                ${makeTable("Trainers Assigned to Course but Not Batch", tcnb)}
                ${makeTable("Trainers With No Course & No Batch", tncnb)}

                <hr>
                <p style="text-align:center; font-size:10px; color:#aaa;">
                  © 2025 AutoFlow Technologies
                </p>
              </body>
              </html>
            `;

            const pdfBuffer = await generatePDF(pdfHTML);

            // --------------------------
            // SEND EMAIL
            // --------------------------
            transporter.sendMail(
              {
                to: process.env.ADMIN2_EMAIL,
                subject: "AutoFlow LMS — Daily Assignment Report",
                html: emailHTML,
                attachments: [
                  {
                    filename: "autoflow-logo.png",
                    path: path.join(__dirname, "../assets/aft.png"),
                    cid: "autoflowLogo",
                    contentType: "image/png"
                  },
                  {
                    filename: "Daily_LMS_Assignment_Report.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf"
                  }
                ]
              },
              err => {
                if (err) console.log("Email Error:", err);
                else console.log("📩 Daily Report Email + PDF sent successfully!");
              }
            );
          } catch (e) {
            console.log("Scheduler / PDF Error:", e);
          }
        });
      });
    });
  });
});

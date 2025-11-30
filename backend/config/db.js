// config/db.js
const mysql = require("mysql2");
require("dotenv").config();

// Create MySQL pool instead of single connection
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,        // IMPORTANT for PM2 cluster
    queueLimit: 0
});

// Test one connection on startup
connection.getConnection((err, connection) => {
    if (err) {
        console.error("❌ MySQL Connection Failed:", err);
    } else {
        console.log("✅ Connected Successfully to MySQL Database");
        connection.release();
    }
});

module.exports = connection;

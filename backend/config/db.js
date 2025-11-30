// config/db.js
require("dotenv").config();
const mysql = require("mysql2");


// Create MySQL pool instead of single connection
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,        // IMPORTANT for PM2 cluster
    queueLimit: 0
});

// Test one connection on startup
connection.getConnection((err, connection) => {
    if (err) {
        console.log("❌ MySQL Connection Failed:");
        console.log("Host:", process.env.DB_HOST);
        console.log("User:", process.env.DB_USER);
        console.log("DB:", process.env.DB_NAME);
        console.log("Port:", process.env.DB_PORT);
        console.log(err);

    } else {
        console.log("✅ Connected Successfully to MySQL Database");
        connection.release();
    }
});



module.exports = connection;

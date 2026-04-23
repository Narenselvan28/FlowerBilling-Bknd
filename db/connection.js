const mysql = require('mysql2');

// pulling from env or fallback to local dev settings
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '0000',
  database: process.env.DB_NAME || 'flower_billing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// quick check to see if we can actually talk to the db
pool.getConnection((err, conn) => {
  if (err) {
    console.log('SQL connection failed:', err.message);
  } else {
    console.log('SQL database connected');
    conn.release();
  }
});

module.exports = pool.promise();

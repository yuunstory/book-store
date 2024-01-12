const mariadb = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (err) {
    console.error("Database Connection Error: ", err);
    throw err; // 오류를 다시 던져 상위 스코프에서 처리할 수 있도록 함
  }
};

module.exports = { getConnection };

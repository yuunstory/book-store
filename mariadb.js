// const mariadb = require("mysql2/promise");
// const dotenv = require("dotenv");
// dotenv.config();

// const connection = mariadb.createConnection({
//   host: "localhost",
//   user: "root",
//   password: process.env.DB_PASSWORD,
//   database: "Bookstore",
//   dateStrings: true,
// });

// module.exports = connection;

const mariadb = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "Bookstore",
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const getConnection = async () => {
  return await pool.getConnection();
};

module.exports = { getConnection };

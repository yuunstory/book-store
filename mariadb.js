const mariadb = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const connection = mariadb.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "Bookstore",
});

module.exports = connection;

const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const getAllCategory = (req, res) => {
    const sql = "SELECT * FROM category";
    conn.query(sql, (err, results) => {
        if (err) {
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

module.exports = { getAllCategory };

const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

// (카테고리별, 신간 여부별) 전체 도서 조회
const getAllBooks = (req, res) => {
    let { categoryId, newBook, limit, currentPage } = req.query;
    const offset = (currentPage - 1) * limit;

    let sql = "SELECT * FROM books";
    let values = [];
    if (categoryId && newBook) {
        sql += " WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 3 MONTH) AND NOW()";
        values = [categoryId];
    } else if (categoryId) {
        sql += " WHERE category_id = ?";
        values = [categoryId];
    } else if (newBook) {
        sql += " WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
    }

    sql += " LIMIT ? OFFSET ?";
    values = [...values, parseInt(limit), offset];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        if (results.length) {
            return res.status(StatusCodes.OK).json(results);
        } else {
            return res.status(StatusCodes.NOT_FOUND).end();
        }
    });
};

// 개별 도서 조회
const getBookById = (req, res) => {
    let { id } = req.params;
    id = parseInt(id);

    const sql = `SELECT * FROM books LEFT JOIN category 
                ON books.category_id = category.id 
                WHERE books.id = ?;`;
    conn.query(sql, id, (err, results) => {
        if (err) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "존재하지 않는 도서입니다.",
            });
        }

        if (results[0]) {
            return res.status(StatusCodes.OK).json(results[0]);
        } else {
            return res.status(StatusCodes.NOT_FOUND).end();
        }
    });
};

module.exports = { getAllBooks, getBookById };

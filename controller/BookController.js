const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

// (요약된) 전체 도서 조회
const getAllBooks = (req, res) => {
    const { categoryId } = req.query;

    if (categoryId) {
        // 카테고리별 도서 조회
        const sql = "SELECT * FROM books WHERE category_id = ?";
        conn.query(sql, categoryId, (err, results) => {
            if (err) {
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if (results.length) {
                return res.status(StatusCodes.OK).json(results);
            } else {
                return res.status(StatusCodes.NOT_FOUND).end();
            }
        });
    } else {
        // 전체 도서 조회
        const sql = "SELECT * FROM books";
        conn.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            return res.status(StatusCodes.OK).json(results);
        });
    }
};

// 개별 도서 조회
const getBookById = (req, res) => {
    let { id } = req.params;
    id = parseInt(id);

    const sql = "SELECT * FROM books WHERE id=?";
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

//카테고리별 도서 조회

module.exports = { getAllBooks, getBookById };

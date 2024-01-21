const checkAuthorization = require("../middlewares/auth");
const jwt = require("jsonwebtoken");
const pool = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

/** (카테고리별, 신간 여부별) 전체 도서 조회  */
const getAllBooks = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        let { categoryId, newBook, limit, currentPage } = req.query;

        const offset = (currentPage - 1) * limit;

        let sql = `SELECT *,
                  (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes
              FROM books`;
        let values;

        if (categoryId) {
            sql += " WHERE category_id = :categoryId";
            values = { categoryId: categoryId };
        }
        if (newBook) {
            sql += " WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
        }

        sql += " LIMIT :limit OFFSET :offset";
        values[limit] = parseInt(limit);
        values[offset] = offset;

        const [results] = await connection.query(sql, values);

        if (results.length) {
            return res.status(StatusCodes.OK).json(results);
        } else {
            return res.status(StatusCodes.NOT_FOUND).end();
        }
    } catch (err) {
        console.log(err);
    }
};

/** 개별 도서 조회 */
const getIndividualBook = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const bookId = req.params.id;

        //로그인 상태 아니면 => liked 빼고 보내줌
        //로그인 상태 => liked 추가해서 보내줌
        const authorization = checkAuthorization(req, res);

        if (authorization instanceof jwt.TokenExpiredError) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "로그인 토큰이 만료되었습니다. 다시 로그인하세요.",
            });
        } else if (authorization instanceof jwt.JsonWebTokenError) {
            console.log(jwt.JsonWebTokenError);
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "잘못된 토큰입니다.",
            });
        } else {
            let sql, values;
            if (authorization instanceof ReferenceError) {
                sql = `SELECT * , 
                (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes
                FROM books 
                LEFT JOIN category 
                ON books.category_id = category.category_id  
                WHERE books.id = :bookId`;
                values = { bookId: bookId };
            } else {
                sql = `SELECT * , 
              (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes, 
              (SELECT EXISTS (SELECT * FROM likes WHERE user_id = :userId AND liked_book_id = :likedBookId)) AS liked 
              FROM books 
              LEFT JOIN category 
              ON books.category_id = category.category_id  
              WHERE books.id = :bookId`;
                values = { userId: authorization.id, likedBookId: bookId, bookId: bookId };
            }

            const [results] = await connection.query(sql, values);

            if (results[0]) {
                return res.status(StatusCodes.OK).json(results[0]);
            } else {
                return res.status(StatusCodes.NOT_FOUND).end();
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(StatusCodes.NOT_FOUND).json({
            message: "존재하지 않는 도서입니다.",
        });
    }
};

module.exports = { getAllBooks, getIndividualBook };

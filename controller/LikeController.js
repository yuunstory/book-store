const checkAuthorization = require("../middlewares/auth");
const pool = require("../mariadb");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

/** 좋아요 추가 */
const addLike = async (req, res) => {
    const connection = await pool.getConnection();

    const bookId = req.params.id; //bookId

    const authorization = checkAuthorization(req, res);
    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 토큰이 만료되었습니다. 다시 로그인하세요.",
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다.",
        });
    } else {
        const sql = "INSERT INTO likes (user_id, liked_book_id) VALUES (:userId, :bookId);";
        const values = { userId: authorization.id, bookId: bookId };
        const [results] = await connection.query(sql, values);

        return res.status(StatusCodes.OK).json(results);
    }
};

/** 좋아요 삭제 */
const removeLike = async (req, res) => {
    const connection = await pool.getConnection();

    const bookId = req.params.id;

    const authorization = checkAuthorization(req, res);
    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 토큰이 만료되었습니다. 다시 로그인하세요.",
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다.",
        });
    } else {
        const sql = "DELETE FROM likes WHERE user_id = :userId AND liked_book_id = :bookId";
        const values = { userId: authorization.id, bookId: bookId };
        const [results] = await connection.query(sql, values);
        return res.status(StatusCodes.OK).json(results);
    }
};

module.exports = { addLike, removeLike };

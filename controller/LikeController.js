const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

// 좋아요 추가
const addLike = (req, res) => {
    const { id } = req.params; //bookId
    const { userId } = req.body;

    const sql = "INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?);";
    const values = [userId, id];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).send("잘못된 요청입니다.");
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

const removeLike = (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    const sql = "DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?";
    const values = [userId, id];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).send("잘못된 요청입니다.");
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

module.exports = { addLike, removeLike };

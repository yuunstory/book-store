const checkAuthorization = require("../middlewares/auth");
const pool = require("../mariadb");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

/** 장바구니 담기
 *- bookId, quantity를 받아와 DB에 저장\
 */
const addToCart = async (req, res) => {
    const connection = await pool.getConnection();
    const { bookId, quantity } = req.body;

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
        const sql = "INSERT INTO cartItems (book_id, quantity, user_id) VALUES (:bookId, :quantity, :userId);";
        let values = { bookId: bookId, userId: authorization.id, quantity: quantity };

        await connection.query(sql, values);
        return res.status(StatusCodes.OK).send("장바구니 담기 완료");
    }
};

/** 장바구니 아이템 목록 조회 / 선택한 장바구니 아이템 목록 조회
 *- 로그인한 유저의 장바구니 목록만 보여준다.\
 */

const listCartItems = async (req, res) => {
    const connection = await pool.getConnection();
    const { selected } = req.body;

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
        let listCartItemsSql = `SELECT cartItems.id, book_id, title, summary,quantity, price 
        FROM cartItems LEFT JOIN books 
        ON cartItems.book_id = books.id 
        WHERE user_id = :userId`;
        let values = { userId: authorization.id };

        if (selected.length) {
            //주문서 작성 시, 선택한 장바구니 목록 조회
            listCartItemsSql += ` AND cartItems.id IN (:selected)`;
            values.selected = selected;
        }

        const [results] = await connection.query(listCartItemsSql, values);

        if (results.length > 0) {
            // 장바구니에 아이템이 담겨있으면
            return res.status(StatusCodes.OK).json(results);
        } else {
            // 장바구니가 비었으면
            return res.status(StatusCodes.NOT_FOUND).send("장바구니가 비었습니다.");
        }
    }
};

/** 장바구니에서 아이템 삭제 */
const removeItemFromCart = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const cartItemId = req.params.id;

        const sql = "DELETE FROM cartItems WHERE id = :id";
        const [result] = await connection.query(sql, { id: cartItemId });

        if (result.affectedRows === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "삭제할 아이템이 없습니다.",
            });
        }
        return res.status(StatusCodes.OK).send("삭제 완료");
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "장바구니 아이템 삭제 중 오류 발생",
        });
    }
};

module.exports = { addToCart, removeItemFromCart, listCartItems };

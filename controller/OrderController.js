const checkAuthorization = require("../middlewares/auth");
const pool = require("../mariadb");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

/** 주문하기 */
const placeOrder = async (req, res) => {
    const connection = await pool.getConnection();
    const { items, delivery, totalQuantity, totalPrice, userId, firstBookTitle } = req.body;
    let deliveryId, orderId;

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
        //delivery 테이블 삽입
        let sql = "INSERT INTO delivery (address, receiver, contact) VALUES (:address, :receiver, :contact)";

        let [results] = await connection.query(sql, {
            address: delivery.address,
            receiver: delivery.receiver,
            contact: delivery.contact,
        });
        deliveryId = results.insertId;

        //orders 테이블 삽입
        sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
        VALUES(:firstBookTitle, :totalQuantity, :totalPrice, :userId, :deliveryId)`;
        [results] = await connection.query(sql, {
            firstBookTitle: firstBookTitle,
            totalQuantity: totalQuantity,
            totalPrice: totalPrice,
            userId: userId,
            deliveryId: deliveryId,
        });

        orderId = results.insertId;

        // items를 가지고 장바구니에서 book_id, quantity 조회
        sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?)`;
        let [orderItems, fields] = await connection.query(sql, [items]);

        //orderedBook 테이블 삽입
        sql = "INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?";
        let values = [];
        orderItems.forEach((item) => {
            values.push([orderId, item.book_id, item.quantity]);
        });
        [results] = await connection.query(sql, [values]);

        //주문 완료하면 장바구니에서 삭제
        [results] = await deleteCartItems(connection, items);

        return res.status(StatusCodes.CREATED).json(results);
    }
};

/** 주문 완료 시 장바구니에서 삭제 */
const deleteCartItems = async (connection, items) => {
    let sql = `DELETE FROM cartItems WHERE id IN (:cartItemsId)`;
    const results = await connection.query(sql, { cartItemsId: items });
    return results;
};

/** 주문 목록 조회 */
const getOrders = async (req, res) => {
    try {
        const connection = await pool.getConnection();

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
            const sql = `SELECT orders.id, created_at, address, receiver, contact, book_title, total_quantity, total_price 
      FROM orders LEFT JOIN delivery 
      ON orders.delivery_id = delivery.id`;
            const [rows, fields] = await connection.query(sql);

            return res.status(StatusCodes.OK).json(rows);
        }
    } catch (err) {
        console.log(err);
        return res.statsu(StatusCodes.BAD_REQUEST).end();
    }
};

/** 주문 상세 조회 */
const getOrderDetail = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const { id } = req.params;
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
            const sql = `SELECT book_id, title AS book_title, author, price, quantity
          FROM orderedBook LEFT JOIN books 
          ON orderedBook.book_id = books.id
          WHERE order_id = :id`;
            const [rows, fields] = await connection.query(sql, { id: id });

            return res.status(StatusCodes.OK).json(rows);
        }
    } catch (err) {
        console.log(err);
        return res.statsu(StatusCodes.BAD_REQUEST).end();
    }
};

module.exports = { placeOrder, getOrders, getOrderDetail };

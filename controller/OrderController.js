const checkAuthorization = require('../middlewares/auth');
const orderModel = require('../models/order');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

/** 주문하기 */
const placeOrder = async (req, res) => {
    const { items, delivery, totalQuantity, totalPrice, userId, firstBookTitle } = req.body;
    // console.log(items);

    const authorization = checkAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: '로그인 토큰이 만료되었습니다. 다시 로그인하세요.',
        });
    }

    if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: '잘못된 토큰입니다.',
        });
    }

    if (authorization == null) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: '로그인이 필요합니다.',
        });
    }

    const orderSuccess = await orderModel.placeOrder(
        items,
        delivery,
        totalQuantity,
        totalPrice,
        userId,
        firstBookTitle
    );

    if (orderSuccess) {
        return res.status(StatusCodes.CREATED).json(orderSuccess);
    } else {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: '주문 처리 중 오류 발생',
        });
    }
};

/** 주문 목록 조회 */
const getOrderList = async (req, res) => {
    try {
        const authorization = checkAuthorization(req, res);

        if (authorization instanceof jwt.TokenExpiredError) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: '로그인 토큰이 만료되었습니다. 다시 로그인하세요.',
            });
        }

        if (authorization instanceof jwt.JsonWebTokenError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: '잘못된 토큰입니다.',
            });
        }

        if (authorization == null) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: '로그인이 필요합니다.',
            });
        }

        const rows = await orderModel.getOrderList(authorization);
        return res.status(StatusCodes.OK).json(rows);
    } catch (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).send('주문 목록 조회 중 오류');
    }
};

/** 주문 상세 조회 */
const getOrderDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const authorization = checkAuthorization(req, res);

        if (authorization instanceof jwt.TokenExpiredError) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: '로그인 토큰이 만료되었습니다. 다시 로그인하세요.',
            });
        }

        if (authorization instanceof jwt.JsonWebTokenError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: '잘못된 토큰입니다.',
            });
        }

        const result = await orderModel.getOrderDetail(id);
        if (result) {
            return res.status(StatusCodes.OK).json(result);
        } else {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: '주문 상세 정보를 찾을 수 없습니다.',
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: '주문 상세 조회 중 오류 발생',
        });
    }
};

module.exports = { placeOrder, getOrderList, getOrderDetail };

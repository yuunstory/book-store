const checkAuthorization = require('../middlewares/auth');
const orderModel = require('../models/order');
const jwt = require('jsonwebtoken');

const { StatusCodes } = require('http-status-codes');

/** 주문하기 */
const placeOrder = async (req, res) => {
  const { items, delivery, totalQuantity, totalPrice, firstBookTitle } = req.body;
  const userId = req.user.id;

  const orderSuccess = await orderModel.placeOrder(items, delivery, totalQuantity, totalPrice, userId, firstBookTitle);

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
    const userId = req.user.id;
    const rows = await orderModel.getOrderList(userId);

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
    checkAuthorization(req, res);

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
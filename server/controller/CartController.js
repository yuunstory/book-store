const checkAuthorization = require('../middlewares/auth');
const cartModel = require('../models/cart');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

/** 장바구니 담기
 *- bookId, quantity를 받아와 DB에 저장\
 */
const addToCart = async (req, res) => {
  try {
    const { book_id, quantity } = req.body;
    const userId = req.user.id;

    // 장바구니에 아이템 추가
    const insertedItemResults = await cartModel.addToCart({ userId, book_id, quantity });

    return res.status(StatusCodes.OK).json(insertedItemResults);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('장바구니 담기 중 오류');
    }
  }
};

/** 장바구니 아이템 목록 조회 / 선택한 장바구니 아이템 목록 조회
 *- 로그인한 유저의 장바구니 목록만 보여준다.\
 */

const listCartItems = async (req, res) => {
  try {
    let { selected } = req.body;
    const userId = req.user.id;

    selected = selected ? selected : [];

    const cartItemList = await cartModel.listCartItems({ userId, selected });

    return res.status(StatusCodes.OK).json(cartItemList);
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('장바구니 아이템 목록 조회 중 오류');
  }
};

/** 장바구니에서 아이템 삭제 */
const removeItemFromCart = async (req, res) => {
  try {
    const cartItemId = parseInt(req.params.id);
    console.log(cartItemId);

    const removedResult = await cartModel.removeCartItem(cartItemId);

    if (removedResult === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: '삭제할 아이템이 없습니다.',
      });
    }

    return res.status(StatusCodes.OK).send('삭제 완료');
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '장바구니 아이템 삭제 중 오류 발생',
    });
  }
};

module.exports = { addToCart, removeItemFromCart, listCartItems };

const checkAuthorization = require("../middlewares/auth");
const cartModel = require("../models/cart");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

/** 장바구니 담기
 *- bookId, quantity를 받아와 DB에 저장\
 */
const addToCart = async (req, res) => {
    try {
        const { bookId, quantity } = req.body;

        const authorization = checkAuthorization(req, res);

        if (authorization instanceof jwt.TokenExpiredError) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "로그인 토큰이 만료되었습니다. 다시 로그인하세요.",
            });
        }

        if (authorization instanceof jwt.JsonWebTokenError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "잘못된 토큰입니다.",
            });
        }

        if (authorization == null) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "로그인이 필요합니다.",
            });
        }

        // 장바구니에 아이템 추가
        const insertedItemResults = await cartModel.addToCart({ authorization, bookId, quantity });
        return res.status(StatusCodes.OK).json(insertedItemResults);
    } catch (err) {
        console.log(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("장바구니 담기 중 오류");
    }
};

/** 장바구니 아이템 목록 조회 / 선택한 장바구니 아이템 목록 조회
 *- 로그인한 유저의 장바구니 목록만 보여준다.\
 */

const listCartItems = async (req, res) => {
    try {
        const { selected } = req.body;
        const authorization = checkAuthorization(req, res);

        if (authorization instanceof jwt.TokenExpiredError) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "로그인 토큰이 만료되었습니다. 다시 로그인하세요.",
            });
        }

        if (authorization instanceof jwt.JsonWebTokenError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "잘못된 토큰입니다.",
            });
        }

        if (authorization == null) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "로그인이 필요합니다.",
            });
        }

        const cartItemList = await cartModel.listCartItems({ authorization, selected });

        if (cartItemList.length > 0) {
            return res.status(StatusCodes.OK).json(cartItemList);
        } else {
            return res.status(StatusCodes.NOT_FOUND).send("장바구니에 존재하지 않는 상품");
        }
    } catch (err) {
        console.log(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("장바구니 아이템 목록 조회 중 오류");
    }
};

/** 장바구니에서 아이템 삭제 */
const removeItemFromCart = async (req, res) => {
    try {
        const cartItemId = parseInt(req.params.id);
        const authorization = checkAuthorization(req, res);

        if (authorization instanceof jwt.TokenExpiredError) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "로그인 토큰이 만료되었습니다. 다시 로그인하세요.",
            });
        }

        if (authorization instanceof jwt.JsonWebTokenError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "잘못된 토큰입니다.",
            });
        }

        if (authorization == null) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "로그인이 필요합니다.",
            });
        }

        const removedResult = await cartModel.removeItemFromCart(cartItemId);

        if (removedResult === 0) {
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

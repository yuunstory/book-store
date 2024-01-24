const checkAuthorization = require("../middlewares/auth");
const { addLikeToDB, removeLikeFromDB } = require("../models/like");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

/** 좋아요 추가 */
const addLike = async (req, res) => {
    const bookId = req.params.id;

    const authorization = checkAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 토큰이 만료되었습니다. 다시 로그인하세요.",
        });
    }

    if (authorization instanceof jwt.JsonWebTokenError) {
        console.log(jwt.JsonWebTokenError);
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다.",
        });
    }

    if (authorization == null) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인이 필요합니다.",
        });
    }

    const insertedResults = await addLikeToDB({ bookId, authorization });

    return res.status(StatusCodes.OK).json(insertedResults);
};

/** 좋아요 삭제 */
const removeLike = async (req, res) => {
    const bookId = req.params.id;

    const authorization = checkAuthorization(req, res);
    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인 토큰이 만료되었습니다. 다시 로그인하세요.",
        });
    }

    if (authorization instanceof jwt.JsonWebTokenError) {
        console.log(jwt.JsonWebTokenError);
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "잘못된 토큰입니다.",
        });
    }

    if (authorization == null) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "로그인이 필요합니다.",
        });
    }

    const removedResults = await removeLikeFromDB({ bookId, authorization });
    return res.status(StatusCodes.OK).json(removedResults);
};

module.exports = { addLike, removeLike };

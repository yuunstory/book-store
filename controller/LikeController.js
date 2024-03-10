const checkAuthorization = require('../middlewares/auth');
const { addLikeToDB, removeLikeFromDB } = require('../models/like');
const { StatusCodes } = require('http-status-codes');

/** 좋아요 추가 */
const addLike = async (req, res) => {
  const bookId = req.params.id;
  const userId = req.user.id; // 미들웨어에서 추가된 사용자 정보 사용

  const insertedResults = await addLikeToDB({ bookId, userId });

  return res.status(StatusCodes.OK).json(insertedResults);
};

/** 좋아요 삭제 */
const removeLike = async (req, res) => {
  const bookId = req.params.id;
  const userId = req.user.id; // 미들웨어에서 추가된 사용자 정보 사용

  const removedResults = await removeLikeFromDB({ bookId, userId });
  return res.status(StatusCodes.OK).json(removedResults);
};

module.exports = { addLike, removeLike };

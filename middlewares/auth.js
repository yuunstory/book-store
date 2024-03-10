const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const checkAuthorization = (necessaryLogin = true) => {
  return async (req, res, next) => {
    try {
      const receivedJwt = req.headers['authorization'];
      console.log(`receivedJwt : ${receivedJwt}`);

      if (!receivedJwt) {
        console.log('실행');
        if (necessaryLogin) {
          return res.status(StatusCodes.UNAUTHORIZED).json({ message: '로그인이 필요합니다.' });
        }
        return next();
      }

      const decodedJWT = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);

      req.user = decodedJWT;
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: '로그인 토큰이 만료되었습니다. 다시 로그인하세요.' });
      }

      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: '잘못된 토큰입니다.' });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.' });
    }
  };
};

module.exports = checkAuthorization;

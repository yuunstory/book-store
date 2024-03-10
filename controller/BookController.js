const checkAuthorization = require('../middlewares/auth');
const bookModel = require('../models/book');
const { StatusCodes } = require('http-status-codes');

/** (카테고리별, 신간 여부별) 전체 도서 조회  */
const getAllBooks = async (req, res) => {
  try {
    let { categoryId, news, limit, currentPage } = req.query;
    const offset = (currentPage - 1) * limit;

    const { books, pagination } = await bookModel.getBooks({ categoryId, news, limit, offset, currentPage });

    return res.status(StatusCodes.OK).json({ books, pagination });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '서버 오류 발생',
    });
  }
};

/** 개별 도서 조회 */
const getIndividualBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // 로그인 여부 확인 이유는 도서를 좋아요했는지를 표시하기 위해서이다
    const necessaryLogin = false;
    const authorization = checkAuthorization({ req, res, necessaryLogin });

    const book = await bookModel.getBookById({ bookId, authorization });

    if (book) {
      return res.status(StatusCodes.OK).json(book);
    } else {
      return res.status(StatusCodes.NOT_FOUND).send('존재하지 않는 도서');
    }
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '서버 오류 발생',
    });
  }
};

module.exports = { getAllBooks, getIndividualBook };

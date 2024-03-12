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
    const userId = req.user?.id;

    const book = await bookModel.getBookById({ bookId, userId });

    if (book) {
      return res.status(StatusCodes.OK).json(book);
    } else {
      return res.status(StatusCodes.NOT_FOUND).send('존재하지 않는 도서');
    }
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '서버 오류 발생',
    });
  }
};

module.exports = { getAllBooks, getIndividualBook };

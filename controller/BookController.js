const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

// (카테고리별, 신간 여부별) 전체 도서 조회
const getAllBooks = (req, res) => {
  let { categoryId, newBook, limit, currentPage } = req.query;
  // let { category_id : categoryId, newBook, limit, current_page : currentPage } = req.query;
  // let { category_id : categoryId, newBook, limit, current_page : currentPage } = req.query;
  const offset = (currentPage - 1) * limit;

  // const basicSql = ''

  let sql = `SELECT *,
                (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes
            FROM books`;
  let values = [];
  if (categoryId && newBook) {
    // const categoryFilteredSql = basicSql + ``;
    sql += " WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 3 MONTH) AND NOW()";
    values = [categoryId];
  } else if (categoryId) {
    sql += " WHERE category_id = ?";
    values = [categoryId];
  } else if (newBook) {
    sql += " WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
  }

  sql += " LIMIT ? OFFSET ?";
  values = [...values, parseInt(limit), offset];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

// 개별 도서 조회
const getBookById = (req, res) => {
  const { userId } = req.body;
  const bookId = req.params.id;

  const sql = `SELECT * , 
                    (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes, 
                    (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?)) AS liked 
                FROM books 
                LEFT JOIN category 
                ON books.category_id = category.category_id  
                WHERE books.id =?`;
  const values = [userId, bookId, bookId];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "존재하지 않는 도서입니다.",
      });
    }

    if (results[0]) {
      return res.status(StatusCodes.OK).json(results[0]);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

module.exports = { getAllBooks, getBookById };

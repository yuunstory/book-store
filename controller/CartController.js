const conn = require("../mariadb");
const { getConnection } = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

/** 장바구니 담기 */
/*
로그인 여부는 jwt로 확인
로그인 한 유저가 아니라면 -> 로그인 화면으로 넘어간다
로그인 한 유저라면 -> bookId, quantity를 받아와 DB에 저장
같은 유저가 같은 책을 장바구니 담기 하면 quantity +1
*/
const addToCart = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();
    const { bookId, quantity, userId } = req.body; //userId는 임시로 body통해 받아옴

    const checkCartSql = "SELECT * FROM cartItems WHERE book_id = ? AND user_id = ?";
    let values = [bookId, userId];
    const [existingItemInCart] = await connection.query(checkCartSql, values);

    let sql;
    if (existingItemInCart.length > 0) {
      // 장바구니에 이미 존재하는 경우, 수량 업데이트
      sql = "UPDATE cartItems set quantity = quantity + 1 WHERE book_id = ? AND user_id = ?";
    } else {
      // 장바구니에 존재하지 않는 경우, 새로 추가
      sql = "INSERT INTO cartItems (id, book_id, quantity, user_id) VALUES ( ?, ?, ?);";
      values = [bookId, quantity, userId];
    }

    await connection.query(sql, values);
    return res.status(StatusCodes.OK).send("장바구니 담기 완료");
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "장바구니 담기 중 오류 발생",
    });
  } finally {
    if (connection) {
      connection.release(); //연결 해제
    }
  }
};

/** 장바구니 아이템 목록 조회 */
/*
로그인한 유저의 장바구니 목록만 보여준다.
*/
const listCartItems = async (req, res) => {
  const connection = await getConnection();
  try {
    const { userId } = req.body;
    const sql = `SELECT cartItems.id, book_id, title, summary,quantity, price 
                FROM cartItems LEFT JOIN books 
                ON cartItems.book_id = books.id 
                WHERE user_id = ? `;
    const [results] = await connection.query(sql, userId);

    if (results > 0) {
      // 장바구니에 아이템이 담겨있으면
      return res.status(StatusCodes.OK).json(results);
    } else {
      // 장바구니가 비었으면
      return res.status(StatusCodes.NOT_FOUND).send("장바구니가 비었습니다.");
    }
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "장바구니 목록 조회 중 오류 발생",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/** 장바구니에서 아이템 삭제 */
const removeFromCart = (req, res) => {
  res.status(200).json("장바구니 삭제");
};

/** 장바구니에서 선택한 아이템 */
const getSelectedCartItems = (req, res) => {
  res.status(200).json("장바구니에서 선택한 상품");
};
module.exports = { addToCart, removeFromCart, listCartItems, getSelectedCartItems };
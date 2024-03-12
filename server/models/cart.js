const pool = require('../mariadb');

const addToCart = async ({ book_id, userId, quantity }) => {
  const connection = await pool.getConnection();

  const insertItemToCart = 'INSERT INTO cartItems (book_id, quantity, user_id) VALUES (:bookId, :quantity, :userId);';
  const values = { bookId: book_id, quantity, userId };

  const [results] = await connection.query(insertItemToCart, values);
  return results;
};

const listCartItems = async ({ userId, selected }) => {
  const connection = await pool.getConnection();

  let selectCartItemsSql = `SELECT cartItems.id, book_id, title, summary, quantity, price 
        FROM cartItems LEFT JOIN books 
        ON cartItems.book_id = books.id 
        WHERE user_id = :userId`;

  if (selected.length) {
    //주문서 작성 시, 선택한 장바구니 목록 조회
    selectCartItemsSql += ` AND cartItems.id IN (:selected)`;
  }
  const values = { userId, selected };

  const [results] = await connection.query(selectCartItemsSql, values);
  console.log(results);
  return results;
};

const removeCartItem = async (cartItemId) => {
  const connection = await pool.getConnection();

  const removeItemSql = 'DELETE FROM cartItems WHERE id = :cartItemId';

  const [result] = await connection.query(removeItemSql, { cartItemId });
  console.log(result);

  return result.affectedRows;
};

module.exports = { addToCart, listCartItems, removeCartItem };

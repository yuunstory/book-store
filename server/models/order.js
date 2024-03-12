const pool = require('../mariadb');

const insertDelivery = async (connection, delivery) => {
  const insertDeliverySql = 'INSERT INTO delivery (address, receiver, contact) VALUES (:address, :receiver, :contact)';
  const values = {
    address: delivery.address,
    receiver: delivery.receiver,
    contact: delivery.contact,
  };

  const [results] = await connection.query(insertDeliverySql, values);

  return results.insertId;
};

const insertOrder = async (connection, orderValues) => {
  const insertOrdersSql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
        VALUES(:firstBookTitle, :totalQuantity, :totalPrice, :userId, :deliveryId)`;

  const [results] = await connection.query(insertOrdersSql, orderValues);

  return results.insertId;
};

const getOrderItems = async (connection, items) => {
  const selectCartItemsSql = `SELECT book_id, quantity FROM cartItems WHERE id IN (:items)`;

  const values = { items };

  const [orderItems] = await connection.query(selectCartItemsSql, values);

  if (!orderItems) {
    throw new Error('선택한 상품이 장바구니에 없습니다.');
  }

  return orderItems;
};

const insertOrderedBook = async (connection, orderId, orderItems) => {
  const insertOrderedBookSql = 'INSERT INTO orderedBook (order_id, book_id, quantity) VALUES :orderedBookValues';

  const orderedBookValues = orderItems.map((item) => [orderId, item.book_id, item.quantity]);

  await connection.query(insertOrderedBookSql, { orderedBookValues });
};

const deleteCartItems = async (connection, items) => {
  const deleteItemsSql = `DELETE FROM cartItems WHERE id IN (:cartItemsId)`;

  const results = await connection.query(deleteItemsSql, { cartItemsId: items });

  return results;
};

const placeOrder = async (items, delivery, totalQuantity, totalPrice, userId, firstBookTitle) => {
  const connection = await pool.getConnection();
  //delivery 테이블 삽입
  const deliveryId = await insertDelivery(connection, delivery);

  //orders 테이블 삽입
  const orderValues = {
    firstBookTitle,
    totalQuantity,
    totalPrice,
    userId,
    deliveryId,
  };
  const orderId = await insertOrder(connection, orderValues);

  // items를 가지고 장바구니에서 book_id, quantity 조회
  const orderItems = await getOrderItems(connection, items);

  //orderedBook 테이블 삽입
  await insertOrderedBook(connection, orderId, orderItems);

  //주문 완료하면 장바구니에서 삭제
  const [results] = await deleteCartItems(connection, items);

  return results;
};

const getOrderList = async (userId) => {
  const connection = await pool.getConnection();

  const selectOrderListSql = `SELECT orders.id, created_at, address, receiver, contact, book_title, total_quantity, total_price 
      FROM orders LEFT JOIN delivery 
      ON orders.delivery_id = delivery.id
      WHERE user_id = :userId`;

  const [rows] = await connection.query(selectOrderListSql, { userId });

  return rows;
};

const getOrderDetail = async (orderId) => {
  const connection = await pool.getConnection();

  const sql = `SELECT book_id, title AS book_title, author, price, quantity
    FROM orderedBook LEFT JOIN books 
    ON orderedBook.book_id = books.id
    WHERE order_id = :id`;
  const values = { id: orderId };

  const [rows] = await connection.query(sql, values);

  return rows;
};

module.exports = { placeOrder, getOrderList, getOrderDetail };

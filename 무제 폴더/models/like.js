const pool = require('../mariadb');

const addLikeToDB = async ({ bookId, userId }) => {
  const connection = await pool.getConnection();

  const insertLikeSql = 'INSERT INTO likes (user_id, liked_book_id) VALUES (:userId, :bookId);';
  const values = { bookId, userId };

  const [results] = await connection.query(insertLikeSql, values);

  return results;
};

const removeLikeFromDB = async ({ bookId, userId }) => {
  const connection = await pool.getConnection();

  const deleteLikeSql = 'DELETE FROM likes WHERE user_id = :userId AND liked_book_id = :bookId';
  const values = { userId, bookId };

  const [results] = await connection.query(deleteLikeSql, values);
  return results;
};

module.exports = { addLikeToDB, removeLikeFromDB };

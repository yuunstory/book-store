const pool = require("../mariadb");

/** 이메일 중복 체크 */
const checkEmailDuplicate = async (email) => {
    const connection = await pool.getConnection();

    const selectEmailQuery = "SELECT email FROM users WHERE email = :email";
    const [existingUser] = await connection.query(selectEmailQuery, { email });
    return existingUser;
};

/** 회원 등록 */
const createUser = async ({ email, name, hashedPw, salt }) => {
    const connection = await pool.getConnection();
    const insertUserQuery = "INSERT INTO users (email, name, password, salt) VALUES (:email, :name, :hashedPw, :salt)";
    const values = { email, name, hashedPw, salt };

    const [results] = await connection.query(insertUserQuery, values);
    return results;
};

/** 사용자 조회 */
const getUser = async (email) => {
    const connection = await pool.getConnection();

    const [results] = await connection.query("SELECT * FROM users WHERE email = :email", { email });
    return results[0];
};

/** 비밀번호 수정 */
const updateUserPassword = async ({ email, hashedPw, salt }) => {
    const connection = await pool.getConnection();
    const sql = "UPDATE users SET password = :hashedPw, salt = :salt WHERE email = :email";
    const values = { hashedPw, salt, email };

    const [results] = await connection.query(sql, values);

    return results.affectedRows > 0;
};

module.exports = { checkEmailDuplicate, createUser, getUser, updateUserPassword };

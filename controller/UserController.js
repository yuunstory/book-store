const { getConnection } = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); //암호화
const dotenv = require("dotenv");
dotenv.config();

/** 회원가입 */
const join = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const { email, password } = req.body;

    // 이메일 중복 체크
    const checkEmailSql = "SELECT email FROM users WHERE email = ?";
    const [existingUser] = await connection.query(checkEmailSql, [email]);
    if (existingUser.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "이미 존재하는 이메일입니다.",
      });
    }

    // 비밀번호 해싱
    const salt = crypto.randomBytes(16).toString("base64"); // 더 긴 salt 사용
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, "sha512").toString("base64");

    // 사용자 정보 저장
    const sql = "INSERT INTO users (email, password, salt) VALUES(?, ?, ?)";
    const values = [email, hashedPassword, salt];
    await connection.query(sql, values);

    res.status(StatusCodes.CREATED).json({
      message: "회원가입 성공",
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "서버 오류 발생",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**  로그인 */
const login = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email=?";
    const [user] = await connection.query(sql, email);

    const loginUser = user[0];
    if (!loginUser) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "사용자를 찾을 수 없습니다.",
      });
    }
    // 로그인 시, 이메일 & 비밀번호(날 것) => salt값 꺼내서 비밀번호 암호화 해보고
    const hashedPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512").toString("base64");
    //=> DB에 저장된 비밀번호와 비교
    if (loginUser.password === hashedPassword) {
      const token = jwt.sign({ email: loginUser.email }, process.env.PRIVATE_KEY, {
        expiresIn: "5m",
        issuer: "jiwon",
      });

      res.cookie("token", token, { httpOnly: true });
      res.status(StatusCodes.OK).json({
        token,
        user: loginUser,
      });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "이메일 또는 비밀번호가 틀렸습니다.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "서버 오류 발생",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**  비밀번호 수정 요청 */
const passwordRequestReset = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const { email } = req.body;
    const sql = "SELECT * FROM users WHERE email=?";
    const [results] = await connection.query(sql, email);

    const user = results[0];
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "해당 이메일을 가진 사용자를 찾을 수 없습니다.",
      });
    }

    res.status(StatusCodes.OK).json({ email: email });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "서버 오류 발생",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/** 비밀번호 수정 */
const passwordReset = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const { email, password } = req.body;

    const salt = crypto.randomBytes(10).toString("base64");
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, "sha512").toString("base64");

    const sql = "UPDATE users SET password=?, salt=? WHERE email=?";
    const values = [hashedPassword, salt, email];
    const [result] = await connection.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "해당 이메일을 가진 사용자를 찾을 수 없습니다.",
      });
    }
    res.status(StatusCodes.OK).json({
      message: "비밀번호가 성공적으로 변경되었습니다.",
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "서버 오류 발생",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = { join, login, passwordRequestReset, passwordReset };

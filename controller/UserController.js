const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); //암호화
const dotenv = require("dotenv");
dotenv.config();

const join = (req, res) => {
    const { email, password } = req.body;
    const sql = "INSERT INTO users (email, password, salt) VALUES(?, ?, ?)";

    // 회원가입 시 비밀번호를 암호화해서 암호화된 비밀번호와 salt 값을 DB에 같이 저장
    const salt = crypto.randomBytes(10).toString("base64");
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, "sha512").toString("base64");

    const values = [email, hashPassword, salt];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
        return res.status(StatusCodes.CREATED).json({
            result: results,
            message: "회원가입 되셨습니다.",
        });
    });
};

const login = (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email=?";
    conn.query(sql, email, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        const loginUser = results[0];

        // 로그인 시, 이메일 & 비밀번호(날 것) => salt값 꺼내서 비밀번호 암호화 해보고
        const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512").toString("base64");
        //=> DB에 저장된 비밀번호와 비교
        if (loginUser && loginUser.password === hashPassword) {
            const token = jwt.sign(
                {
                    email: loginUser.email,
                },
                process.env.PRIVATE_KEY,
                {
                    expiresIn: "5m",
                    issuer: "jiwon",
                }
            );

            res.cookie("token", token, { httpOnly: true });
            console.log(token);
            res.status(StatusCodes.OK).json({
                message: `${loginUser.email}님 로그인되셨습니다.`,
                token,
                results,
            });
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({
                message: "이메일 또는 비밀번호가 틀렸습니다.",
            });
        }
    });
};

const passwordRequestReset = (req, res) => {
    const { email } = req.body;

    const sql = "SELECT * FROM users WHERE email=?";
    conn.query(sql, email, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        const isUser = results[0];
        if (isUser) {
            return res.status(StatusCodes.OK).json({
                email: email,
            });
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).end();
        }
    });
};

const passwordReset = (req, res) => {
    const { email, password } = req.body;

    const sql = "UPDATE users SET password=? WHERE email=?";
    const values = [password, email];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        if (results.affectedRows === 0) {
            return res.status(StatusCodes.BAD_REQUEST).end();
        } else {
            return res.status(StatusCodes.OK).json(results);
        }
    });
};

module.exports = { join, login, passwordRequestReset, passwordReset };

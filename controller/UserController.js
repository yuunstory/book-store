const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const join = (req, res) => {
    const { email, password } = req.body;

    const sql = "INSERT INTO users (email, password) VALUES(?, ?)";
    const values = [email, password];
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
    res.json("로그인");
};

const passwordRequestReset = (req, res) => {
    res.json("비밀번호 초기화 요청");
};

const passwordReset = (req, res) => {
    res.json("비밀번호 초기화");
};

module.exports = { join, login, passwordRequestReset, passwordReset };

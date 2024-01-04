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
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email=?";
    conn.query(sql, email, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        const loginUser = results[0];
        if (loginUser && loginUser.password === password) {
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
            });
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({
                message: "이메일 또는 비밀번호가 틀렸습니다.",
            });
        }
    });
};

const passwordRequestReset = (req, res) => {
    res.json("비밀번호 초기화 요청");
};

const passwordReset = (req, res) => {
    res.json("비밀번호 초기화");

};

module.exports = { join, login, passwordRequestReset, passwordReset };

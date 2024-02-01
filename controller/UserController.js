const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); //암호화
const { checkEmailDuplicate, createUser, getUser, updateUserPassword } = require("../models/user");

const hashPassword = ({ password, salt = null }) => {
    try {
        if (!salt) {
            salt = crypto.randomBytes(16).toString("base64"); // 새로운 salt 생성
        }
        const hashedPw = crypto.pbkdf2Sync(password, salt, 10000, 10, "sha512").toString("base64");
        return { salt, hashedPw };
    } catch (err) {
        console.log(err);
        throw new Error("비밀번호 암호화 중 오류");
    }
};

/** 회원가입 */
const join = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        // 이메일 중복 체크
        const isDuplicate = await checkEmailDuplicate(email);
        if (isDuplicate.length > 0) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "이미 존재하는 이메일입니다.",
            });
        }

        // 비밀번호 해싱
        const { salt, hashedPw } = hashPassword({ password });

        // 회원 등록
        const insertedUserData = await createUser({ email, name, hashedPw, salt });

        if (insertedUserData.affectedRows) {
            res.status(StatusCodes.CREATED).json({
                message: "회원가입 성공",
            });
        } else {
            res.status(StatusCodes.BAD_REQUEST).send("회원가입 실패");
        }
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "서버 오류 발생",
        });
    }
};

/**  로그인 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 사용자 조회
        const loginUser = await getUser(email);
        if (!loginUser) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "사용자를 찾을 수 없습니다.",
            });
        }

        // 로그인 시, 이메일 & 비밀번호(날 것) => salt값 꺼내서 비밀번호 암호화 해보고
        const salt = loginUser.salt;
        const { hashedPw } = hashPassword({ salt, password });

        // DB에 저장된 비밀번호와 비교
        if (loginUser.password === hashedPw) {
            const token = jwt.sign({ id: loginUser.id, email: loginUser.email }, process.env.PRIVATE_KEY, {
                expiresIn: "5m",
                issuer: "jiwon",
            });

            //토큰 쿠키에 담기
            res.cookie("token", token, { httpOnly: true });
            res.status(StatusCodes.OK).json({
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
    }
};

/**  비밀번호 수정 요청 */
const passwordRequestReset = async (req, res) => {
    try {
        const { email } = req.body;

        // 사용자 조회
        const user = await getUser(email);
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
    }
};

/** 비밀번호 수정 */
const passwordReset = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { salt, hashedPw } = hashPassword({ password });

        const passwordUpdated = await updateUserPassword({ email, hashedPw, salt });

        if (passwordUpdated) {
            res.status(StatusCodes.OK).json({
                message: "비밀번호가 성공적으로 변경되었습니다.",
            });
        } else {
            res.status(StatusCodes.NOT_FOUND).json({
                message: "사용자를 찾을 수 없습니다.",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "서버 오류 발생",
        });
    }
};

module.exports = { join, login, passwordRequestReset, passwordReset };

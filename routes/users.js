const express = require("express");
const router = express.Router();
const { StatusCodes } = require("http-status-codes");
const { join, login, passwordRequestReset, passwordReset } = require("../controller/UserController");

const { body, validationResult } = require("express-validator");

router.use(express.json());

const validate = (req, res, next) => {
    const err = validationResult(req);

    if (err.isEmpty()) {
        return next();
    }
    return res.status(StatusCodes.BAD_REQUEST).json(err.array());
};
router.post(
    "/join",
    [
        body("email").notEmpty().isEmail().withMessage("이메일 확인 필요"),
        body("password").notEmpty().isString().withMessage("비밀번호 확인 필요"),
        validate,
    ],
    join
);

router.post(
    "/login",
    [
        body("email").notEmpty().isEmail().withMessage("이메일 확인 필요"),
        body("password").notEmpty().isString().withMessage("비밀번호 확인 필요"),
        validate,
    ],
    login
);
router.post("/reset", passwordRequestReset);
router.put("/reset", passwordReset);

module.exports = router;

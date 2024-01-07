const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

//프론트엔드에서 카테고리 id와 카테고리 이름을 확인할 수 있도록 카테고리 테이블 데이터를 화면에 뿌려준다
const getAllCategory = (req, res) => {
    const sql = "SELECT * FROM category";
    conn.query(sql, (err, results) => {
        if (err) {
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        return res.status(StatusCodes.OK).json(results);
    });
};

module.exports = { getAllCategory };

const categoryModel = require("../models/category");
const { StatusCodes } = require("http-status-codes");

/** 도서 카테고리 목록 전체 조회
 * - 프론트엔드에서 카테고리 id와 카테고리 이름을 확인할 수 있도록 카테고리 테이블 데이터를 화면에 뿌려준다
 */
const getAllCategory = async (req, res) => {
    try {
        const results = await categoryModel.getAllCategories();
        return res.status(StatusCodes.OK).json(results);
    } catch (err) {
        return res.status(StatusCodes.BAD_REQUEST).send("카테고리 목록 조회 중 오류");
    }
};

module.exports = { getAllCategory };

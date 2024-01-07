const express = require("express");
const router = express.Router();

const { getAllCategory } = require("../controller/CategoryController");

router.use(express.json());

router.get("/", getAllCategory); // 카테고리 전체 목록 조회

module.exports = router;

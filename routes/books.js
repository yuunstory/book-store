const express = require("express");
const router = express.Router();

const { getAllBooks, getBookById } = require("../controller/BookController");

router.use(express.json());

router.get("/", getAllBooks); //전체조회 & 카테고리별 조회
router.get("/:id", getBookById);

module.exports = router;

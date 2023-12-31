const express = require("express");
const router = express.Router();

router.get("/books", (req, res) => {
    res.json("전체 도서 조회");
});

router.get("/books/:bookId", (req, res) => {
    res.json("개별 도서 조회");
});

router.get("/books?category=category&new=boolean", (req, res) => {
    res.json("카테고리별 도서 조회");
});

module.exports = router;

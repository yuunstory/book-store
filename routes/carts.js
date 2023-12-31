const express = require("express");
const router = express.Router();

router.use(express.json());
router.post("/carts", (req, res) => {
    res.status(201).json("장바구니 담기");
});

router.get("/carts", (req, res) => {
    res.status(200).json("장바구니 조회");
});

router.delete("/carts/:id", (req, res) => {
    res.status(200).json("장바구니 삭제");
});

router.get("/carts", (req, res) => {
    res.status(200).json("장바구니에서 선택한 상품");
});

module.exports = router;

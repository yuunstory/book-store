const express = require("express");
const router = express.Router();

router.use(express.json());
router.post("/orders", (req, res) => {
    res.status(200).json("주문하기 요청");
});

router.get("/orders/:orderId", (req, res) => {
    res.status(200).json("주문 목록 조회");
});

router.get("/orders", (req, res) => {
    res.status(200).json("주문 상세 상품 조회");
});

module.exports = router;

const express = require("express");
const router = express.Router();

router.use(express.json());
router.post("/likes/:id", (req, res) => {
    res.json("좋아요 추가");
});

router.delete("/likes/:id", (req, res) => {
    res.json("좋아요 취소");
});

module.exports = router;

const express = require("express");
const { order, getOrders, getOrderDetail } = require("../controller/OrderController");
const router = express.Router();

router.post("/", order);
router.get("/:orderId", getOrders);
router.get("/:id", getOrderDetail);

module.exports = router;

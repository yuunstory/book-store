const express = require("express");
const { placeOrder, getOrders, getOrderDetail } = require("../controller/OrderController");
const router = express.Router();

router.post("/", placeOrder);
router.get("/", getOrders);
router.get("/:id", getOrderDetail);

module.exports = router;

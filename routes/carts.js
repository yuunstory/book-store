const express = require("express");
const router = express.Router();
const { addToCart, removeItemFromCart, listCartItems } = require("../controller/CartController");

router.post("/", addToCart);
router.get("/", listCartItems);
router.delete("/:id", removeItemFromCart);

module.exports = router;

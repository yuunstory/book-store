const express = require("express");
const router = express.Router();
const { addToCart, removeItemFromCart, listCartItems } = require("../controller/CartController");

router.use(express.json());
router.post("/", addToCart);
router.get("/", listCartItems);
router.delete("/:id", removeItemFromCart);

module.exports = router;

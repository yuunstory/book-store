const express = require("express");
const router = express.Router();
const { addToCart, removeFromCart, listCartItems, getSelectedCartItems } = require("../controller/CartController");

router.use(express.json());
router.post("/", addToCart);
router.get("/", listCartItems);
router.delete("/:id", removeFromCart);
router.get("/", getSelectedCartItems);

module.exports = router;

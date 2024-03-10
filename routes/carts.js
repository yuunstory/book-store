const express = require('express');
const router = express.Router();
const checkAuthorization = require('../middlewares/auth');
const { addToCart, removeItemFromCart, listCartItems } = require('../controller/CartController');

router.post('/', checkAuthorization(), addToCart);
router.get('/', checkAuthorization(), listCartItems);
router.delete('/:id', checkAuthorization(), removeItemFromCart);

module.exports = router;

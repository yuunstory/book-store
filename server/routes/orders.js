const express = require('express');
const { placeOrder, getOrderList, getOrderDetail } = require('../controller/OrderController');
const checkAuthorization = require('../middlewares/auth');
const router = express.Router();

router.post('/', checkAuthorization(), placeOrder);
router.get('/', checkAuthorization(), getOrderList);
router.get('/:id', checkAuthorization(), getOrderDetail);

module.exports = router;

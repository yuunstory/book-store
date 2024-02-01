const express = require('express');
const { placeOrder, getOrderList, getOrderDetail } = require('../controller/OrderController');
const router = express.Router();

router.post('/', placeOrder);
router.get('/', getOrderList);
router.get('/:id', getOrderDetail);

module.exports = router;

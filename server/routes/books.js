const express = require('express');
const router = express.Router();

const { getAllBooks, getIndividualBook } = require('../controller/BookController');
const checkAuthorization = require('../middlewares/auth');

router.get('/', checkAuthorization(false), getAllBooks); //전체조회 & 카테고리별 조회
router.get('/:id', checkAuthorization(false), getIndividualBook);

module.exports = router;

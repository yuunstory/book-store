const express = require('express');
const router = express.Router();
const { addLike, removeLike } = require('../controller/LikeController');
const checkAuthorization = require('../middlewares/auth');

router.post('/:id', checkAuthorization(), addLike);

router.delete('/:id', checkAuthorization(), removeLike);

module.exports = router;

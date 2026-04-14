const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/auth');

router.post('/spin', authMiddleware, gameController.doSpin);
router.get('/config', gameController.getConfig);

module.exports = router;

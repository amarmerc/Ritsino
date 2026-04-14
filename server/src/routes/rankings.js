const express = require('express');
const router = express.Router();
const rankingsController = require('../controllers/rankingsController');
const authMiddleware = require('../middleware/auth');

router.get('/my-university', authMiddleware, rankingsController.myUniversityRanking);
router.get('/university/:id', rankingsController.universityRanking);
router.get('/global', rankingsController.globalRanking);
router.get('/universities', rankingsController.universitiesRanking);

module.exports = router;

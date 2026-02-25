const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', userController.home);
router.get('/blogs', userController.blogs);
router.get('/seasons', userController.seasons);
router.get('/seasons/:year/matches', userController.seasonMatches);
router.get('/matches/:id/scorecard', userController.matchScorecard);
router.get('/players/stats', requireAuth, userController.playerStats);

module.exports = router;

const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../config/upload');

const router = express.Router();

router.use(requireAdmin);

router.get('/dashboard', adminController.dashboard);

router.get('/teams', adminController.getTeams);
router.post('/teams', adminController.createTeam);
router.put('/teams/:id', adminController.updateTeam);
router.delete('/teams/:id', adminController.deleteTeam);

router.get('/players', adminController.getPlayers);
router.post('/players', adminController.createPlayer);
router.put('/players/:id', adminController.updatePlayer);
router.delete('/players/:id', adminController.deletePlayer);

router.get('/matches', adminController.getMatches);
router.post('/matches', adminController.createMatch);
router.post('/matches/scorecard', adminController.saveScorecard);
router.post('/matches/:id/complete', adminController.markMatchCompleted);

router.get('/blogs', adminController.getBlogs);
router.post('/blogs', upload.single('image'), adminController.createBlog);
router.delete('/blogs/:id', adminController.deleteBlog);

module.exports = router;

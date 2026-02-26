const Blog = require('../models/Blog');
const Match = require('../models/Match');
const Player = require('../models/Player');
const Scorecard = require('../models/Scorecard');

const home = async (req, res) => {
  const recentMatches = await Match.find().populate('teamA teamB winner').sort({ date: -1 }).limit(5);
  res.render('user/home', { title: 'GBPL Home', recentMatches });
};

const blogs = async (req, res) => {
  const allBlogs = await Blog.find().sort({ createdAt: -1 });
  res.render('blogs/list', { title: 'GBPL Blogs', blogs: allBlogs });
};

const seasons = async (req, res) => {
  const seasonYears = await Match.distinct('seasonYear');
  res.render('matches/seasons', { title: 'Season-wise Matches', seasonYears: seasonYears.sort((a, b) => b - a) });
};

const seasonMatches = async (req, res) => {
  const matches = await Match.find({ seasonYear: Number(req.params.year) }).populate('teamA teamB winner').sort({ date: -1 });
  res.render('matches/seasonMatches', { title: `Season ${req.params.year}`, matches, year: req.params.year });
};

const matchScorecard = async (req, res) => {
  const match = await Match.findById(req.params.id).populate('teamA teamB winner');
  const scorecard = await Scorecard.findOne({ match: req.params.id }).populate('teamScores.team firstBattingTeam secondBattingTeam firstInningsBatting.player firstInningsBowling.player secondInningsBatting.player secondInningsBowling.player batting.player bowling.player');
  res.render('matches/scorecard', { title: 'Match Scorecard', match, scorecard });
};

const playerStats = async (req, res) => {
  const players = await Player.find().populate('team').sort({ 'stats.runs': -1 });
  res.render('players/stats', { title: 'Player Stats', players });
};

module.exports = { home, blogs, seasons, seasonMatches, matchScorecard, playerStats };

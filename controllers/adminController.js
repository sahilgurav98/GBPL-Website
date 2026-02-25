const Team = require('../models/Team');
const Player = require('../models/Player');
const Match = require('../models/Match');
const Blog = require('../models/Blog');
const Scorecard = require('../models/Scorecard');

const dashboard = async (req, res) => {
  const [teamCount, playerCount, matchCount, blogCount] = await Promise.all([
    Team.countDocuments(),
    Player.countDocuments(),
    Match.countDocuments(),
    Blog.countDocuments()
  ]);
  res.render('admin/dashboard', { title: 'Admin Dashboard', teamCount, playerCount, matchCount, blogCount });
};

const getTeams = async (req, res) => {
  const teams = await Team.find().sort('name');
  res.render('admin/teams', { title: 'Manage Teams', teams });
};

const createTeam = async (req, res) => {
  await Team.create({ name: req.body.name, city: req.body.city });
  res.redirect('/admin/teams');
};

const updateTeam = async (req, res) => {
  await Team.findByIdAndUpdate(req.params.id, { name: req.body.name, city: req.body.city });
  res.redirect('/admin/teams');
};

const deleteTeam = async (req, res) => {
  await Team.findByIdAndDelete(req.params.id);
  res.redirect('/admin/teams');
};

const getPlayers = async (req, res) => {
  const [players, teams] = await Promise.all([Player.find().populate('team').sort('name'), Team.find().sort('name')]);
  res.render('admin/players', { title: 'Manage Players', players, teams });
};

const createPlayer = async (req, res) => {
  const { name, age, role, team } = req.body;
  await Player.create({ name, age, role, team });
  res.redirect('/admin/players');
};

const updatePlayer = async (req, res) => {
  const { name, age, role, team } = req.body;
  await Player.findByIdAndUpdate(req.params.id, { name, age, role, team });
  res.redirect('/admin/players');
};

const deletePlayer = async (req, res) => {
  await Player.findByIdAndDelete(req.params.id);
  res.redirect('/admin/players');
};

const getMatches = async (req, res) => {
  const [matches, teams, players] = await Promise.all([
    Match.find().populate('teamA teamB winner').sort({ date: -1 }),
    Team.find().sort('name'),
    Player.find().populate('team').sort('name')
  ]);
  res.render('admin/matches', { title: 'Manage Matches', matches, teams, players });
};

const createMatch = async (req, res) => {
  const { seasonYear, teamA, teamB, date, overs } = req.body;
  await Match.create({ seasonYear, teamA, teamB, date, overs });
  res.redirect('/admin/matches');
};

const markMatchCompleted = async (req, res) => {
  const { winner } = req.body;
  await Match.findByIdAndUpdate(req.params.id, { status: 'completed', winner });
  res.redirect('/admin/matches');
};

const saveScorecard = async (req, res) => {
  const { matchId, teamARuns, teamAWickets, teamAOvers, teamBRuns, teamBWickets, teamBOvers, battingPlayer, battingRuns, battingBalls, bowlingPlayer, bowlingOvers, bowlingWickets } = req.body;

  const match = await Match.findById(matchId);
  if (!match) return res.redirect('/admin/matches');

  const battingEntries = (Array.isArray(battingPlayer) ? battingPlayer : [battingPlayer]).map((player, idx) => ({
    player,
    runs: Number(Array.isArray(battingRuns) ? battingRuns[idx] : battingRuns),
    balls: Number(Array.isArray(battingBalls) ? battingBalls[idx] : battingBalls)
  })).filter((item) => item.player);

  const bowlingEntries = (Array.isArray(bowlingPlayer) ? bowlingPlayer : [bowlingPlayer]).map((player, idx) => ({
    player,
    overs: Number(Array.isArray(bowlingOvers) ? bowlingOvers[idx] : bowlingOvers),
    wickets: Number(Array.isArray(bowlingWickets) ? bowlingWickets[idx] : bowlingWickets)
  })).filter((item) => item.player);

  let scorecard = await Scorecard.findOne({ match: matchId });
  const payload = {
    match: matchId,
    teamScores: [
      { team: match.teamA, runs: Number(teamARuns), wickets: Number(teamAWickets), overs: Number(teamAOvers) },
      { team: match.teamB, runs: Number(teamBRuns), wickets: Number(teamBWickets), overs: Number(teamBOvers) }
    ],
    batting: battingEntries,
    bowling: bowlingEntries
  };

  if (scorecard) scorecard = await Scorecard.findByIdAndUpdate(scorecard._id, payload, { new: true });
  else scorecard = await Scorecard.create(payload);

  match.scorecard = scorecard._id;
  await match.save();

  // Update player aggregate stats after score entry.
  for (const bat of battingEntries) {
    const player = await Player.findById(bat.player);
    if (!player) continue;
    player.stats.matchesPlayed += 1;
    player.stats.runs += bat.runs;
    player.stats.balls += bat.balls;
    player.stats.strikeRate = player.stats.balls ? Number(((player.stats.runs / player.stats.balls) * 100).toFixed(2)) : 0;
    await player.save();
  }

  for (const bowl of bowlingEntries) {
    const player = await Player.findById(bowl.player);
    if (!player) continue;
    player.stats.matchesPlayed += 1;
    player.stats.wickets += bowl.wickets;
    await player.save();
  }

  res.redirect('/admin/matches');
};

const getBlogs = async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.render('admin/blogs', { title: 'Manage Blogs', blogs });
};

const createBlog = async (req, res) => {
  await Blog.create({
    title: req.body.title,
    description: req.body.description,
    language: req.body.language,
    image: req.file ? `/uploads/${req.file.filename}` : '',
    author: req.session.userId
  });
  res.redirect('/admin/blogs');
};

const deleteBlog = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect('/admin/blogs');
};

module.exports = {
  dashboard,
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getMatches,
  createMatch,
  saveScorecard,
  markMatchCompleted,
  getBlogs,
  createBlog,
  deleteBlog
};

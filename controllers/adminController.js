const Team = require('../models/Team');
const Player = require('../models/Player');
const Match = require('../models/Match');
const Blog = require('../models/Blog');
const Scorecard = require('../models/Scorecard');

const normalizeName = (name = '') => name.trim().toLowerCase();

const toNumber = (value) => Number(value || 0);

const aggregatePlayerStats = async () => {
  const players = await Player.find();
  const playerStatsMap = new Map();

  players.forEach((player) => {
    playerStatsMap.set(String(player._id), {
      player,
      runs: 0,
      balls: 0,
      wickets: 0,
      matches: new Set()
    });
  });

  const scorecards = await Scorecard.find();

  for (const card of scorecards) {
    const battingCollections = [card.firstInningsBatting || [], card.secondInningsBatting || [], card.batting || []];
    const bowlingCollections = [card.firstInningsBowling || [], card.secondInningsBowling || [], card.bowling || []];

    battingCollections.forEach((entries) => {
      entries.forEach((entry) => {
        const key = String(entry.player);
        const bucket = playerStatsMap.get(key);
        if (!bucket) return;
        bucket.runs += toNumber(entry.runs);
        bucket.balls += toNumber(entry.balls);
        bucket.matches.add(String(card.match));
      });
    });

    bowlingCollections.forEach((entries) => {
      entries.forEach((entry) => {
        const key = String(entry.player);
        const bucket = playerStatsMap.get(key);
        if (!bucket) return;
        bucket.wickets += toNumber(entry.wickets);
        bucket.matches.add(String(card.match));
      });
    });
  }

  for (const { player, runs, balls, wickets, matches } of playerStatsMap.values()) {
    player.stats.matchesPlayed = matches.size;
    player.stats.runs = runs;
    player.stats.balls = balls;
    player.stats.wickets = wickets;
    player.stats.strikeRate = balls ? Number(((runs / balls) * 100).toFixed(2)) : 0;
    await player.save();
  }
};

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
  const cleanedName = (name || '').trim();

  const existing = await Player.findOne({ name: new RegExp(`^${cleanedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });

  if (existing) {
    existing.name = cleanedName;
    existing.age = age;
    existing.role = role;
    existing.team = team;
    await existing.save();
  } else {
    await Player.create({ name: cleanedName, age, role, team });
  }

  res.redirect('/admin/players');
};

const updatePlayer = async (req, res) => {
  const { name, age, role, team } = req.body;
  await Player.findByIdAndUpdate(req.params.id, { name: (name || '').trim(), age, role, team });
  res.redirect('/admin/players');
};

const deletePlayer = async (req, res) => {
  await Player.findByIdAndDelete(req.params.id);
  res.redirect('/admin/players');
};

const getMatches = async (req, res) => {
  const [matches, teams] = await Promise.all([
    Match.find().populate('teamA teamB winner').sort({ date: -1 }),
    Team.find().sort('name')
  ]);
  res.render('admin/matches', { title: 'Manage Matches', matches, teams });
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

const getScorecardEditor = async (req, res) => {
  const match = await Match.findById(req.params.id).populate('teamA teamB');
  if (!match) return res.redirect('/admin/matches');

  const [teamAPlayers, teamBPlayers, scorecard] = await Promise.all([
    Player.find({ team: match.teamA._id }).sort('name'),
    Player.find({ team: match.teamB._id }).sort('name'),
    Scorecard.findOne({ match: match._id })
  ]);

  res.render('admin/scorecardEditor', {
    title: 'Scorecard Editor',
    match,
    teamAPlayers,
    teamBPlayers,
    scorecard
  });
};

const buildBattingEntries = (players, teamId, runsPayload = {}, ballsPayload = {}) => players.map((player) => ({
  player: player._id,
  team: teamId,
  runs: toNumber(runsPayload[String(player._id)]),
  balls: toNumber(ballsPayload[String(player._id)])
}));

const buildBowlingEntries = (players, teamId, oversPayload = {}, wicketsPayload = {}) => players.map((player) => ({
  player: player._id,
  team: teamId,
  overs: toNumber(oversPayload[String(player._id)]),
  wickets: toNumber(wicketsPayload[String(player._id)])
}));

const saveScorecard = async (req, res) => {
  const { matchId, teamARuns, teamAWickets, teamAOvers, teamBRuns, teamBWickets, teamBOvers } = req.body;

  const match = await Match.findById(matchId).populate('teamA teamB');
  if (!match) return res.redirect('/admin/matches');

  const firstBatting = match.teamA;
  const secondBatting = match.teamB;

  const [teamAPlayers, teamBPlayers] = await Promise.all([
    Player.find({ team: match.teamA._id }),
    Player.find({ team: match.teamB._id })
  ]);

  const playersByTeam = {
    [String(match.teamA._id)]: teamAPlayers,
    [String(match.teamB._id)]: teamBPlayers
  };

  const firstInningsBattingPlayers = playersByTeam[String(firstBatting._id)] || [];
  const firstInningsBowlingPlayers = playersByTeam[String(secondBatting._id)] || [];
  const secondInningsBattingPlayers = playersByTeam[String(secondBatting._id)] || [];
  const secondInningsBowlingPlayers = playersByTeam[String(firstBatting._id)] || [];

  const payload = {
    match: match._id,
    teamScores: [
      { team: match.teamA._id, runs: toNumber(teamARuns), wickets: toNumber(teamAWickets), overs: toNumber(teamAOvers) },
      { team: match.teamB._id, runs: toNumber(teamBRuns), wickets: toNumber(teamBWickets), overs: toNumber(teamBOvers) }
    ],
    firstBattingTeam: firstBatting._id,
    secondBattingTeam: secondBatting._id,
    firstInningsBatting: buildBattingEntries(firstInningsBattingPlayers, firstBatting._id, req.body.firstBattingRuns, req.body.firstBattingBalls),
    firstInningsBowling: buildBowlingEntries(firstInningsBowlingPlayers, secondBatting._id, req.body.firstBowlingOvers, req.body.firstBowlingWickets),
    secondInningsBatting: buildBattingEntries(secondInningsBattingPlayers, secondBatting._id, req.body.secondBattingRuns, req.body.secondBattingBalls),
    secondInningsBowling: buildBowlingEntries(secondInningsBowlingPlayers, firstBatting._id, req.body.secondBowlingOvers, req.body.secondBowlingWickets)
  };

  const existing = await Scorecard.findOne({ match: match._id });
  const scorecard = existing
    ? await Scorecard.findByIdAndUpdate(existing._id, payload, { new: true })
    : await Scorecard.create(payload);

  match.scorecard = scorecard._id;
  await match.save();

  await aggregatePlayerStats();

  res.redirect(`/admin/matches/${match._id}/scorecard`);
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
  getScorecardEditor,
  saveScorecard,
  markMatchCompleted,
  getBlogs,
  createBlog,
  deleteBlog
};

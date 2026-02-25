const mongoose = require('mongoose');

const scorecardSchema = new mongoose.Schema(
  {
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
    teamScores: [
      {
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        runs: { type: Number, required: true },
        wickets: { type: Number, required: true },
        overs: { type: Number, required: true }
      }
    ],
    batting: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        runs: { type: Number, required: true },
        balls: { type: Number, required: true }
      }
    ],
    bowling: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
        overs: { type: Number, required: true },
        wickets: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scorecard', scorecardSchema);

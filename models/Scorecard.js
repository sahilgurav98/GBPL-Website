const mongoose = require('mongoose');

const battingEntrySchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 }
  },
  { _id: false }
);

const bowlingEntrySchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    overs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 }
  },
  { _id: false }
);

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
    firstBattingTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    secondBattingTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    firstInningsBatting: [battingEntrySchema],
    firstInningsBowling: [bowlingEntrySchema],
    secondInningsBatting: [battingEntrySchema],
    secondInningsBowling: [bowlingEntrySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scorecard', scorecardSchema);

const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 10 },
    role: { type: String, enum: ['batsman', 'bowler', 'all-rounder', 'keeper'], required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);

const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    seasonYear: { type: Number, required: true },
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    date: { type: Date, required: true },
    overs: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['scheduled', 'completed'], default: 'scheduled' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    scorecard: { type: mongoose.Schema.Types.ObjectId, ref: 'Scorecard' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);

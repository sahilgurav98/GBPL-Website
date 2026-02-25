require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Match = require('../models/Match');
const Scorecard = require('../models/Scorecard');
const Blog = require('../models/Blog');

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const seed = async () => {
  try {
    await connectDB();

    // Clean old data to keep seed deterministic.
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Player.deleteMany({}),
      Match.deleteMany({}),
      Scorecard.deleteMany({}),
      Blog.deleteMany({})
    ]);

    const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@gbpl.com');
    const adminPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();

    // Create admin and sample user.
    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    await User.create({
      name: 'Demo User',
      email: 'user@gbpl.com',
      password: 'user123',
      role: 'user'
    });

    const [team1, team2, team3] = await Team.create([
      { name: 'Gurav Strikers', city: 'Guravwadi' },
      { name: 'Bandhu Blasters', city: 'Bandhu Nagar' },
      { name: 'Premiere Panthers', city: 'Premiere Gaon' }
    ]);

    await Player.create([
      { name: 'Rohit Gurav', age: 24, role: 'batsman', team: team1._id },
      { name: 'Sagar Bandhu', age: 22, role: 'bowler', team: team2._id },
      { name: 'Vikas Patil', age: 26, role: 'all-rounder', team: team3._id },
      { name: 'Omkar K', age: 23, role: 'keeper', team: team1._id }
    ]);

    await Match.create([
      { seasonYear: 2024, teamA: team1._id, teamB: team2._id, date: new Date('2024-05-01'), overs: 10 },
      { seasonYear: 2024, teamA: team2._id, teamB: team3._id, date: new Date('2024-05-03'), overs: 10 },
      { seasonYear: 2025, teamA: team1._id, teamB: team3._id, date: new Date('2025-04-28'), overs: 12 }
    ]);

    await Blog.create([
      {
        title: 'GBPL 2024 उद्घाटन सोहळा',
        description: 'गावात उत्साहात GBPL स्पर्धेला सुरुवात झाली. सर्व संघांनी जोशात तयारी केली आहे.',
        language: 'Marathi',
        author: admin._id
      },
      {
        title: 'Top 5 Moments from GBPL Opening Weekend',
        description: 'From last-over thrillers to brilliant catches, here are the best moments from week one.',
        language: 'English',
        author: admin._id
      }
    ]);

    console.log('Seed data created successfully');
    console.log(`Admin login email: ${adminEmail}`);
    console.log(`Admin login password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();

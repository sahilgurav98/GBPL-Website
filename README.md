# GBPL Website

A lightweight Cricbuzz-style website for **Gurav Bandhu Premiere League (GBPL)** using Node.js, Express, EJS, MongoDB, and Mongoose.

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed sample data:
   ```bash
   npm run seed
   ```
4. Start server:
   ```bash
   npm start
   ```

## Features

- User signup/login and secure admin login
- Admin CRUD for teams, players, matches, blogs
- Scorecards and match completion with winner
- Automatic player stat updates from scorecards
- Season-wise history, scorecards, player stats, and blogs for users
- MVC structure with server-side rendering only

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

## Admin Login (Important)

After running `npm run seed`, an admin user is created with:
- `email = ADMIN_EMAIL` from `.env` (default: `admin@gbpl.com`)
- `password = ADMIN_PASSWORD` from `.env` (default: `admin123`)

Then:
1. Open `http://localhost:3000/auth/login`
2. Login with the admin credentials
3. You will be redirected to `http://localhost:3000/admin/dashboard`

### If you still get "Invalid credentials"

- Make sure you **re-ran** `npm run seed` after changing `.env`
- Use lowercase email (login now normalizes case automatically)
- Check the terminal output from seed; it prints the exact admin email/password inserted

## Features

- User signup/login and secure admin login
- Admin CRUD for teams, players, matches, blogs
- Scorecards and match completion with winner
- Automatic player stat updates from scorecards
- Season-wise history, scorecards, player stats, and blogs for users
- MVC structure with server-side rendering only


## Scorecard Workflow (Admin)

1. Go to `Admin -> Manage Matches`.
2. Click **Create / Edit** on a match.
3. You will get 4 ready tables:
   - 1st innings batting
   - 1st innings bowling
   - 2nd innings batting
   - 2nd innings bowling
4. Enter runs/balls or overs/wickets and save.

Player stats are recalculated from saved scorecards to avoid duplicate counting on edits.

## Player Identity Rule

Players are treated as the same person by name in admin add-player flow.
If you add the same name in a new season with a different team, the existing player is updated instead of creating a duplicate profile.

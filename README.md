# IronTrack - Gym & Workout Tracker 🏋️‍♂️

A modern, responsive React web app built for gym lifters to track sets, reps, weights, and consistency.

## Features

- 📅 **Interactive Gym Calendar**: Visual calendar highlighting all days you went to the gym, with current workout streak, total gym days, total sets, and monthly volume.
- 🔢 **Sets & Reps Tracking**:
  - Track Set #, Weight, Reps, and Set Type (Normal, Warmup, Drop Set, Failure).
  - Quick 1-click "Duplicate Set" button to quickly log repeated sets.
  - Check off sets as you finish them with satisfying completion sounds.
  - Progressive overload helper: Shows previous session's sets and all-time Personal Record (PR).
- ➕ **Custom Exercise Management**:
  - Pre-populated with 35+ standard gym movements categorized by muscle groups (Chest, Back, Legs, Shoulders, Arms, Core, Cardio).
  - **Add New Exercises**: Easily create custom exercises with custom muscle target, equipment type (Barbell, Dumbbell, Machine, Cable, etc.), and form cues.
  - Search and filter exercises by muscle group or name.
- ⏱️ **Collapsible Rest Timer**:
  - Built-in rest timer with 60s, 90s, 120s, 180s presets and +/- adjustment.
  - Web Audio API chimes when rest period is complete.
  - Can be minimized to a floating pill while logging sets.
- ⚙️ **Customization & Data Safety**:
  - Switch between **kg** and **lbs**.
- Per-account cloud storage for workouts, custom exercises, and training preferences in Neon Postgres.
  - JSON Data Export and Import / Backup & Restore.

## Getting Started

1. Install dependencies with `npm install`.
2. Configure the server environment in `.env`:
   ```env
   NEON_DATABASE_URL=your-Neon-Postgres-connection-string
   NEON_AUTH_URL=your-Neon-Auth-base-URL
   ```
   Keep this file private. It is ignored by Git. The server uses the database URL; the browser reaches Neon Auth through the local API proxy.
3. Start the app and API together:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173/](http://localhost:5173/).

The API creates the `workout_user_data` table on startup. Each request verifies the Neon Auth JWT and uses the signed-in user's ID for database reads and writes. No user ID supplied by the browser is trusted. Auth routes are limited to 20 attempts per 15 minutes per client IP; API routes are limited to 120 requests per minute per client IP. The limiter uses in-memory counters for a single API process. If deploying behind a trusted reverse proxy, set `TRUST_PROXY=true` so client IP limits use the forwarded address.

For production, build and run the same Node server:

```bash
npm run build
npm start
```

Set `NODE_ENV=production`, `NEON_DATABASE_URL`, and `NEON_AUTH_URL` in the host environment. Configure the Neon Auth app's allowed origins and email delivery settings for the deployment domain to enable registration, verification, and password reset links.

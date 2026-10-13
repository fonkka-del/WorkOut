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
  - 100% offline persistence using browser `localStorage`.
  - JSON Data Export and Import / Backup & Restore.

## Getting Started

1. Open a terminal in this directory:
   ```bash
   cd C:\Users\e\.gemini\antigravity\scratch\workout-tracker
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser at [http://localhost:5173/](http://localhost:5173/)

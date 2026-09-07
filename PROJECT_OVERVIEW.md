# Fitness Tracker - Project Overview

## What You Now Have

A complete, production-ready fitness tracking web app built with React + Vite that works on mobile and desktop.

### Core Features Implemented

✅ **Exercise Library** (db.js)
- 150+ pre-loaded exercises across 14 muscle groups
- Users can create unlimited custom exercises
- Each exercise tagged with primary/secondary muscle groups

✅ **Workout Templates** (WorkoutManager.jsx)
- Create reusable workout plans
- Define sets, reps, weight, rest time per exercise
- Mark sets as warmup or working sets
- Duplicate templates for quick variations

✅ **Session Logging** (SessionLogger.jsx)
- Start workout from any template
- Modify weight/reps on-the-fly during session
- Visual countdown rest timer (no audio, pure CSS)
- Real-time 1RM estimation as you log
- Auto-progress to next set after logging
- Optional notes field at end

✅ **Exercise History & Analytics** (ExerciseBrowser.jsx)
- View all logged sets for any exercise
- Highest 1RM calculation per exercise
- Full history with timestamps
- Per-exercise progress tracking

✅ **Recovery Dashboard** (RecoveryDashboard.jsx)
- Weekly/biweekly/monthly muscle fatigue tracking
- Volume-based calculations (Sets × Reps × Weight)
- 5-tier fatigue system (Ready → Overworked)
- Days since last trained per muscle
- CSV export for external analysis

✅ **Data Persistence** (db.js - Dexie)
- Offline-first design with IndexedDB
- All data stored locally in browser
- No account needed, no data leaves device
- Survives browser restarts

## Architecture

### File Structure

```
fitness-app/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Build config
├── README.md               # Full documentation
├── QUICK_START.md          # 5-minute setup
├── PROJECT_OVERVIEW.md     # This file
├── .gitignore              # Git ignore rules
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages auto-deploy
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main component + routing
│   ├── App.css             # Global styles + dark theme
│   ├── db.js               # Database setup + exercise library
│   ├── utils.js            # Calculations (1RM, volume, fatigue)
│   └── components/
│       ├── RecoveryDashboard.jsx/.css
│       ├── SessionLogger.jsx/.css
│       ├── WorkoutManager.jsx/.css
│       └── ExerciseBrowser.jsx/.css
```

### Database Schema (IndexedDB)

```
Stores:
├── exercises (id)
│   ├── id: string
│   ├── name: string
│   ├── muscleGroups: array
│   └── category: string
├── customExercises (id) - Same structure as exercises
├── workouts (id, createdAt)
│   ├── id: string
│   ├── name: string
│   ├── exercises: array
│   │   └── [{ exerciseId, sets, reps, weight, rest, isWarmup }]
│   └── createdAt: Date
├── sessions (id, workoutId, createdAt)
│   └── Tracks workout execution (optional for future)
└── sets (id, sessionId)
    ├── id: string
    ├── exerciseId: string
    ├── weight: number
    ├── reps: number
    ├── workoutId: string
    └── createdAt: Date
```

### Key Calculations

#### 1RM Estimation (Epley Formula)
```javascript
1RM = Weight × (1 + Reps / 30)

Examples:
- 25 lbs × 15 reps = 37.5 lbs
- 60 lbs × 15 reps = 90 lbs
- 225 lbs × 5 reps = 256 lbs
```

#### Muscle Volume
```javascript
Volume per set = Reps × Weight
Weekly Volume = Sum of all volumes for that muscle in 7 days
Fatigue % = (Weekly Volume / Baseline) × 100
```

#### Fatigue Status
```
0-60%        = Ready ✅ (can train hard)
60-100%      = Moderate ⚠️ (can train, not ideal)
100-150%     = Fatigued 🔴 (ease off)
150%+        = Overworked 🛑 (rest or light work)
```

### Component Hierarchy

```
App (main container)
├── Navigation (4 main views)
└── Content Area
    ├── RecoveryDashboard
    │   └── Muscle fatigue cards
    ├── SessionLogger
    │   ├── Workout selection
    │   ├── Set logging interface
    │   └── Rest timer overlay
    ├── WorkoutManager
    │   ├── Workout list
    │   └── Create/edit form
    └── ExerciseBrowser
        ├── Exercise list (left)
        └── Exercise detail (right)
```

### Styling Approach

- **Dark theme** designed for gym use
- **CSS Grid/Flexbox** for responsive layouts
- **Color palette**:
  - Primary: #2563eb (Blue accent)
  - Background: #0a0a0a to #2a2a2a
  - Text: #f5f5f5 (light)
  - Status: Green (ready), Yellow (moderate), Red (fatigued)
- **Responsive**: Mobile-first, works on phones and desktops

### Data Flow

```
User Creates Workout
    ↓
Saves to db.workouts

User Starts Session
    ↓
Loads workout template

User Logs Set
    ↓
Save to db.sets → Calculate 1RM → Display

User Checks Recovery
    ↓
Query all sets from past 7 days
    ↓
Group by muscle
    ↓
Calculate volume per muscle
    ↓
Compare to baseline
    ↓
Display fatigue status
```

## Key Features Explained

### 1. Session Logger Rest Timer
- No audio (just visual countdown)
- Starts automatically after each set logged
- 1-minute precision counting
- Skip option if you're ready early
- Automatically moves to next set when complete

### 2. Dynamic 1RM Calculation
- Calculated per set as you input weight/reps
- Shows real-time in session logger
- Stored with every logged set
- Highest 1RM shown in Exercise detail

### 3. Muscle Recovery Tracking
- Tracks volume loaded on each muscle
- Weekly rolling window (7/14/30 day options)
- Takes into account:
  - Days since last trained
  - Total volume per muscle
  - Recovery percentage vs. baseline
- Helps prevent overtraining injuries

### 4. Custom Exercises
- Users can create exercises not in library
- Select multiple muscle groups
- Marked with "Custom" badge
- Deletable
- Appear in workout builder and exercise browser

## How to Deploy

### Development
```bash
npm install
npm run dev
```

### Production (GitHub Pages)
```bash
npm run build
git push  # GitHub Actions auto-deploys via .github/workflows/deploy.yml
```

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to any static host (Netlify, Vercel, etc.)
```

## Browser Compatibility

- **Chrome/Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Mobile**: iOS Safari 14+, Chrome Mobile
- Requires: IndexedDB support (all modern browsers)

## Performance Optimizations

- 📦 Lightweight (Vite bundler)
- 🔄 No server requests (all local)
- ⚡ Fast initial load
- 💾 Efficient IndexedDB queries
- 📱 PWA-ready for mobile install

## Future Enhancement Ideas

**Phase 2 Potential**
- Sync between devices (manual JSON export/import)
- Superset/dropset support
- Photo/video form check uploads
- Progress charts (line graphs of weight over time)
- Workout history calendar view
- Personal records (PRs) leaderboard
- Plate calculator
- Rest day tracking with active recovery
- Nutrition logging integration
- Mobile app version (React Native)

## Troubleshooting Guide

**"My data disappeared"**
- IndexedDB is per-browser/device
- Chrome ≠ Firefox ≠ Safari (separate databases)
- Solution: Export CSV to backup regularly

**"Rest timer won't work"**
- Check browser supports Service Workers (PWA)
- Clear cache and reload
- Try different browser

**"Exercise not appearing"**
- Custom exercises stored separately
- Search/filter both built-in and custom
- Check muscle group filter

**"Not seeing updated app online"**
- Run `npm run build` again
- Wait 2-5 min for GitHub Pages to rebuild
- Hard refresh (Ctrl+Shift+R)

## Development Notes

- **No external backend** - Fully self-contained
- **No user accounts** - Data is per-browser
- **No ads** - Clean, focused experience
- **Open source ready** - Could be shared freely
- **Themeable** - CSS variables make recoloring easy

## Summary

You now have a **complete, deployable fitness tracking application** that:
- ✅ Runs on any device
- ✅ Works offline
- ✅ Stores data privately
- ✅ Requires no backend
- ✅ Can be deployed for free on GitHub Pages
- ✅ Is fully customizable

Ready to start tracking! 💪

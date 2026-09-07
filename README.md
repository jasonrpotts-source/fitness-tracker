# Fitness Tracker

A progressive web app (PWA) for tracking workouts, exercises, and muscle recovery. Built with React + Vite, stores all data locally in your browser using IndexedDB.

## Features

✅ **Pre-loaded Exercise Library** - 100+ exercises across all muscle groups  
✅ **Workout Templates** - Create custom workout plans  
✅ **Session Logging** - Log actual workouts with weight, reps, and rest timers  
✅ **Visual Rest Timer** - Countdown timer between sets (no audio)  
✅ **Exercise History** - Track all logged sets with 1RM calculations  
✅ **Recovery Dashboard** - Monitor muscle fatigue and recovery status  
✅ **Custom Exercises** - Create and track custom exercises  
✅ **Data Export** - Export all data to CSV for analysis  
✅ **Muscle Volume Tracking** - See which muscles have been worked and recovery status  
✅ **Offline First** - All data stored locally in your browser  

## Tech Stack

- **Frontend**: React 18 + Vite
- **Database**: IndexedDB (via Dexie)
- **Styling**: CSS Grid/Flexbox with dark theme
- **Deployment**: GitHub Pages (static hosting)

## Setup & Development

### Prerequisites

- Node.js 16+ installed
- npm or yarn

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

3. **Build for production**
   ```bash
   npm run build
   ```
   Creates optimized files in `dist/` folder

## Deployment to GitHub Pages

### One-Time Setup

1. **Create GitHub repository**
   - Go to GitHub and create a new repository (e.g., `fitness-tracker`)
   - Make it public

2. **Clone and navigate to project**
   ```bash
   git clone <your-repo-url>
   cd fitness-tracker
   ```

3. **Copy all files from this project into the repo**
   ```bash
   # Copy all files (maintain directory structure)
   ```

4. **Update package.json**
   - If deploying to `https://username.github.io/fitness-tracker/`, add to package.json:
   ```json
   "homepage": "https://username.github.io/fitness-tracker"
   ```
   - If deploying to `https://username.github.io/` (user repo), use:
   ```json
   "homepage": "https://username.github.io"
   ```

   Then update `vite.config.js`:
   ```javascript
   base: '/fitness-tracker/'  // or just '/'
   ```

### Deploy

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Initialize git and commit**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository → Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: /root
   - Wait ~2 minutes for deployment

4. **Access your app**
   - Visit `https://username.github.io/fitness-tracker` (or your configured URL)

## Usage Guide

### Getting Started

1. **Create Workouts** (Plans tab)
   - Click "+ New Plan"
   - Name your workout (e.g., "Upper Body Push")
   - Add exercises, sets, reps, weight, rest time
   - Save

2. **Log a Workout** (Workout tab)
   - Select a workout plan
   - For each set:
     - Enter weight and reps
     - View estimated 1RM
     - Click "Log Set"
     - Rest timer starts automatically
   - Add optional notes at end

3. **Track Recovery** (Recovery tab)
   - View muscle fatigue for last 7/14/30 days
   - Green = Ready, Yellow = Moderate, Red = Fatigued
   - Days since last trained shown
   - Export all data to CSV

4. **Browse Exercises** (Exercises tab)
   - Search by name or filter by muscle group
   - View exercise history and highest 1RM
   - Create custom exercises with selected muscle groups

## Data Storage

- **All data stored locally** in browser's IndexedDB
- **No server, no account needed**
- **Private** - your data never leaves your device
- **Persistent** - survives browser restarts
- **Exportable** - download as CSV anytime

## Calculations

### Estimated 1RM
Uses Epley formula: `1RM = Weight × (1 + Reps/30)`

Example:
- 25 lbs × 15 reps = 37.5 lbs 1RM
- 60 lbs × 10 reps = 80 lbs 1RM

### Muscle Fatigue
Based on weekly volume:
- 0-60% → Recovered ✅
- 60-100% → Moderate ⚠️
- 100-150% → Fatigued 🔴
- 150%+ → Overworked 🛑

Volume = Sets × Reps × Weight (lbs)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires IndexedDB support

## Notes

- Data is stored per browser/device - create backups via CSV export
- Works offline after first load
- Can be installed as app on mobile (Add to Home Screen)

## License

MIT

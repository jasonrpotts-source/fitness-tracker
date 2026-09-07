# Quick Start Guide

Get your Fitness Tracker running in 5 minutes!

## Step 1: Download & Install

```bash
# Make sure you have Node.js installed (download from nodejs.org)
# Then run:

npm install
```

## Step 2: Run Locally

```bash
npm run dev
```

Open your browser to `http://localhost:5173` - your app is running!

## Step 3: Test It Out

1. **Create a Workout Plan** (Plans tab)
   - Click "+ New Plan"
   - Name: "Test Workout"
   - Add Exercise:
     - Select "Barbell Bench Press"
     - Sets: 3, Reps: 10, Weight: 185 lbs, Rest: 90s
   - Click "Create Workout"

2. **Log a Workout** (Workout tab)
   - Click "Start" on your test workout
   - Enter weight: 185, reps: 10
   - Click "Log Set" 
   - See the rest timer count down
   - Repeat for remaining sets

3. **Check Recovery** (Recovery tab)
   - See your chest & triceps fatigue levels
   - Check the muscle status dashboard

4. **Browse Exercises** (Exercises tab)
   - Search "bench" to find exercises
   - Filter by "chest" muscle group
   - View your logged history

## Step 4: Deploy to GitHub Pages

### Pre-requisites
- GitHub account (free)
- Command line basics

### Deploy in 2 minutes

1. **Build your app**
   ```bash
   npm run build
   ```

2. **Create GitHub repo**
   - Go to github.com/new
   - Name: `fitness-tracker`
   - Make it Public
   - Create

3. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fitness-tracker.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to your repo → Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/root" folder
   - Click Save
   - Wait 1-2 minutes

5. **Your app is live!**
   - Visit: `https://YOUR_USERNAME.github.io/fitness-tracker`
   - Bookmark it or add to home screen

## Features to Explore

### 💪 Workout Tab
- Log workouts with visual rest timers
- Modify weight/reps on the fly
- See estimated 1RM for each set
- Add notes about how the workout felt

### 📊 Recovery Tab
- View muscle fatigue levels (7/14/30 day rolling window)
- See which muscles need recovery
- Export all data as CSV
- Track volume per muscle group

### 📖 Exercises Tab
- Browse 100+ pre-loaded exercises
- Create custom exercises (e.g., cable machine variations)
- View full history for any exercise
- See highest recorded 1RM

### 📋 Plans Tab
- Build reusable workout templates
- Copy existing plans for variations
- Organize exercises with sets/reps/weight
- Mark warmup sets

## Tips

✨ **Pro Tips**
- Create 3-4 workout plans (Upper/Lower, Push/Pull/Legs, etc.)
- Review your Recovery dashboard weekly to avoid overtraining
- Export CSV monthly to track long-term progress
- Add custom exercises for machines specific to your gym

🔄 **Data Backup**
- Export data regularly (Recovery tab → Export CSV)
- Save file to cloud or email
- All data stored locally in your browser

📱 **Mobile Use**
- Open in mobile browser
- iOS: Tap Share → Add to Home Screen
- Android: Menu → Install app
- Works offline after first visit

## Troubleshooting

**"Port 5173 already in use"**
```bash
# Use different port:
npm run dev -- --port 3000
```

**"I lost my data"**
- Data stored per browser/device
- Use different browser = fresh install
- Export CSV regularly for backups

**App not updating on GitHub**
- Clear browser cache (Ctrl+Shift+Del)
- Rebuild and push again
- GitHub can take 2-5 min to update

## Next Steps

1. Create your first workout plan
2. Log a complete session
3. Check your recovery dashboard
4. Share feedback!

---

Questions? Check README.md for full documentation

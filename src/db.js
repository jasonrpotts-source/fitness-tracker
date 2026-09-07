import Dexie from 'dexie';

export const db = new Dexie('FitnessTracker');

db.version(1).stores({
  exercises: 'id',
  workouts: 'id, createdAt',
  sessions: 'id, workoutId, createdAt',
  sets: 'id, sessionId',
  customExercises: 'id'
});

// Initialize with pre-loaded exercises on first load
export async function initializeDatabase() {
  const count = await db.exercises.count();
  if (count === 0) {
    await db.exercises.bulkAdd(EXERCISE_LIBRARY);
  }
}

export const EXERCISE_LIBRARY = [
  // Chest
  { id: 'barbell-bench-press', name: 'Barbell Bench Press', muscleGroups: ['chest', 'triceps', 'shoulders'], category: 'compound' },
  { id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', muscleGroups: ['chest', 'triceps', 'shoulders'], category: 'compound' },
  { id: 'incline-barbell-bench', name: 'Incline Barbell Bench Press', muscleGroups: ['chest', 'shoulders', 'triceps'], category: 'compound' },
  { id: 'incline-dumbbell-bench', name: 'Incline Dumbbell Bench Press', muscleGroups: ['chest', 'shoulders', 'triceps'], category: 'compound' },
  { id: 'decline-barbell-bench', name: 'Decline Barbell Bench Press', muscleGroups: ['chest', 'triceps'], category: 'compound' },
  { id: 'dumbbell-fly', name: 'Dumbbell Fly', muscleGroups: ['chest'], category: 'isolation' },
  { id: 'cable-fly', name: 'Cable Fly', muscleGroups: ['chest'], category: 'isolation' },
  { id: 'machine-chest-press', name: 'Machine Chest Press', muscleGroups: ['chest', 'triceps'], category: 'compound' },
  { id: 'push-up', name: 'Push Up', muscleGroups: ['chest', 'triceps', 'shoulders'], category: 'bodyweight' },
  { id: 'cable-chest-press', name: 'Cable Chest Press', muscleGroups: ['chest', 'triceps', 'shoulders'], category: 'compound' },

  // Back
  { id: 'barbell-deadlift', name: 'Barbell Deadlift', muscleGroups: ['back', 'glutes', 'hamstrings'], category: 'compound' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroups: ['back', 'biceps'], category: 'compound' },
  { id: 'dumbbell-row', name: 'Dumbbell Row', muscleGroups: ['back', 'biceps'], category: 'compound' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroups: ['back', 'biceps'], category: 'compound' },
  { id: 'pull-up', name: 'Pull Up', muscleGroups: ['back', 'biceps'], category: 'bodyweight' },
  { id: 'chin-up', name: 'Chin Up', muscleGroups: ['back', 'biceps'], category: 'bodyweight' },
  { id: 'assisted-pull-up', name: 'Assisted Pull Up', muscleGroups: ['back', 'biceps'], category: 'compound' },
  { id: 'machine-row', name: 'Machine Row', muscleGroups: ['back', 'biceps'], category: 'compound' },
  { id: 'cable-row', name: 'Cable Row', muscleGroups: ['back', 'biceps'], category: 'compound' },
  { id: 't-bar-row', name: 'T-Bar Row', muscleGroups: ['back', 'biceps'], category: 'compound' },
  { id: 'reverse-fly', name: 'Reverse Fly', muscleGroups: ['back', 'shoulders'], category: 'isolation' },
  { id: 'face-pull', name: 'Face Pull', muscleGroups: ['back', 'shoulders'], category: 'isolation' },

  // Shoulders
  { id: 'barbell-shoulder-press', name: 'Barbell Shoulder Press', muscleGroups: ['shoulders', 'triceps', 'chest'], category: 'compound' },
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroups: ['shoulders', 'triceps', 'chest'], category: 'compound' },
  { id: 'machine-shoulder-press', name: 'Machine Shoulder Press', muscleGroups: ['shoulders', 'triceps'], category: 'compound' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroups: ['shoulders'], category: 'isolation' },
  { id: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroups: ['shoulders'], category: 'isolation' },
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscleGroups: ['shoulders'], category: 'isolation' },
  { id: 'front-raise', name: 'Front Raise', muscleGroups: ['shoulders'], category: 'isolation' },
  { id: 'shrug', name: 'Barbell Shrug', muscleGroups: ['shoulders', 'traps'], category: 'isolation' },
  { id: 'dumbbell-shrug', name: 'Dumbbell Shrug', muscleGroups: ['shoulders', 'traps'], category: 'isolation' },
  { id: 'upright-row', name: 'Upright Row', muscleGroups: ['shoulders', 'biceps'], category: 'compound' },

  // Biceps
  { id: 'barbell-curl', name: 'Barbell Curl', muscleGroups: ['biceps'], category: 'isolation' },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', muscleGroups: ['biceps'], category: 'isolation' },
  { id: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', muscleGroups: ['biceps'], category: 'isolation' },
  { id: 'cable-curl', name: 'Cable Curl', muscleGroups: ['biceps'], category: 'isolation' },
  { id: 'ez-bar-curl', name: 'EZ Bar Curl', muscleGroups: ['biceps'], category: 'isolation' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroups: ['biceps', 'forearms'], category: 'isolation' },
  { id: 'preacher-curl', name: 'Preacher Curl', muscleGroups: ['biceps'], category: 'isolation' },
  { id: 'machine-curl', name: 'Machine Curl', muscleGroups: ['biceps'], category: 'isolation' },
  { id: 'cable-rope-curl', name: 'Cable Rope Curl', muscleGroups: ['biceps'], category: 'isolation' },

  // Triceps
  { id: 'barbell-tricep-extension', name: 'Barbell Tricep Extension', muscleGroups: ['triceps'], category: 'isolation' },
  { id: 'dumbbell-tricep-extension', name: 'Dumbbell Tricep Extension', muscleGroups: ['triceps'], category: 'isolation' },
  { id: 'cable-tricep-pushdown', name: 'Cable Tricep Pushdown', muscleGroups: ['triceps'], category: 'isolation' },
  { id: 'rope-pushdown', name: 'Rope Pushdown', muscleGroups: ['triceps'], category: 'isolation' },
  { id: 'v-bar-pushdown', name: 'V-Bar Pushdown', muscleGroups: ['triceps'], category: 'isolation' },
  { id: 'overhead-tricep-extension', name: 'Overhead Tricep Extension', muscleGroups: ['triceps'], category: 'isolation' },
  { id: 'skull-crushers', name: 'Skull Crushers', muscleGroups: ['triceps'], category: 'isolation' },
  { id: 'dips', name: 'Dips', muscleGroups: ['triceps', 'chest', 'shoulders'], category: 'bodyweight' },
  { id: 'assisted-dips', name: 'Assisted Dips', muscleGroups: ['triceps', 'chest', 'shoulders'], category: 'compound' },
  { id: 'machine-dips', name: 'Machine Dips', muscleGroups: ['triceps', 'chest'], category: 'compound' },

  // Legs - Quads
  { id: 'barbell-squat', name: 'Barbell Back Squat', muscleGroups: ['quads', 'glutes', 'hamstrings'], category: 'compound' },
  { id: 'front-squat', name: 'Front Squat', muscleGroups: ['quads', 'glutes'], category: 'compound' },
  { id: 'goblet-squat', name: 'Goblet Squat', muscleGroups: ['quads', 'glutes'], category: 'compound' },
  { id: 'leg-press', name: 'Leg Press', muscleGroups: ['quads', 'glutes', 'hamstrings'], category: 'compound' },
  { id: 'smith-machine-squat', name: 'Smith Machine Squat', muscleGroups: ['quads', 'glutes'], category: 'compound' },
  { id: 'hack-squat', name: 'Hack Squat', muscleGroups: ['quads', 'glutes'], category: 'compound' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroups: ['quads'], category: 'isolation' },
  { id: 'machine-leg-extension', name: 'Machine Leg Extension', muscleGroups: ['quads'], category: 'isolation' },
  { id: 'sissy-squat', name: 'Sissy Squat', muscleGroups: ['quads'], category: 'isolation' },

  // Legs - Hamstrings
  { id: 'leg-curl', name: 'Leg Curl', muscleGroups: ['hamstrings'], category: 'isolation' },
  { id: 'lying-leg-curl', name: 'Lying Leg Curl', muscleGroups: ['hamstrings'], category: 'isolation' },
  { id: 'seated-leg-curl', name: 'Seated Leg Curl', muscleGroups: ['hamstrings'], category: 'isolation' },
  { id: 'nordic-curl', name: 'Nordic Curl', muscleGroups: ['hamstrings'], category: 'isolation' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroups: ['hamstrings', 'glutes', 'back'], category: 'compound' },
  { id: 'stiff-leg-deadlift', name: 'Stiff Leg Deadlift', muscleGroups: ['hamstrings', 'glutes', 'back'], category: 'compound' },
  { id: 'good-morning', name: 'Good Morning', muscleGroups: ['hamstrings', 'glutes', 'back'], category: 'compound' },

  // Legs - Glutes
  { id: 'barbell-hip-thrust', name: 'Barbell Hip Thrust', muscleGroups: ['glutes', 'hamstrings'], category: 'compound' },
  { id: 'dumbbell-hip-thrust', name: 'Dumbbell Hip Thrust', muscleGroups: ['glutes', 'hamstrings'], category: 'compound' },
  { id: 'machine-hip-thrust', name: 'Machine Hip Thrust', muscleGroups: ['glutes'], category: 'compound' },
  { id: 'cable-kickback', name: 'Cable Kickback', muscleGroups: ['glutes'], category: 'isolation' },
  { id: 'smith-machine-hip-thrust', name: 'Smith Machine Hip Thrust', muscleGroups: ['glutes', 'hamstrings'], category: 'compound' },
  { id: 'belt-squat', name: 'Belt Squat', muscleGroups: ['glutes', 'quads'], category: 'compound' },

  // Forearms
  { id: 'barbell-wrist-curl', name: 'Barbell Wrist Curl', muscleGroups: ['forearms'], category: 'isolation' },
  { id: 'dumbbell-wrist-curl', name: 'Dumbbell Wrist Curl', muscleGroups: ['forearms'], category: 'isolation' },
  { id: 'reverse-wrist-curl', name: 'Reverse Wrist Curl', muscleGroups: ['forearms'], category: 'isolation' },
  { id: 'wrist-roller', name: 'Wrist Roller', muscleGroups: ['forearms'], category: 'isolation' },

  // Abs
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroups: ['abs'], category: 'isolation' },
  { id: 'machine-crunch', name: 'Machine Crunch', muscleGroups: ['abs'], category: 'isolation' },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', muscleGroups: ['abs'], category: 'isolation' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroups: ['abs', 'hip-flexors'], category: 'isolation' },
  { id: 'cable-woodchop', name: 'Cable Woodchop', muscleGroups: ['abs', 'obliques'], category: 'isolation' },
  { id: 'decline-sit-up', name: 'Decline Sit Up', muscleGroups: ['abs'], category: 'isolation' },
  { id: 'weighted-dip-belt-crunch', name: 'Weighted Dip Belt Crunch', muscleGroups: ['abs'], category: 'isolation' },

  // Calves
  { id: 'standing-calf-raise', name: 'Standing Calf Raise', muscleGroups: ['calves'], category: 'isolation' },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', muscleGroups: ['calves'], category: 'isolation' },
  { id: 'machine-calf-raise', name: 'Machine Calf Raise', muscleGroups: ['calves'], category: 'isolation' },
  { id: 'leg-press-calf-raise', name: 'Leg Press Calf Raise', muscleGroups: ['calves'], category: 'isolation' },

  // Compound/Functional
  { id: 'power-clean', name: 'Power Clean', muscleGroups: ['back', 'shoulders', 'quads', 'glutes'], category: 'compound' },
  { id: 'clean-jerk', name: 'Clean & Jerk', muscleGroups: ['back', 'shoulders', 'quads', 'triceps'], category: 'compound' },
  { id: 'snatch', name: 'Snatch', muscleGroups: ['back', 'shoulders', 'quads', 'hamstrings'], category: 'compound' },
];

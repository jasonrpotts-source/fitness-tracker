// Epley Formula for 1RM calculation
export const calculate1RM = (weight, reps) => {
  if (reps === 1) return weight;
  return Math.round((weight * (1 + reps / 30)) * 100) / 100;
};

// Get all sets for an exercise from all sessions
export const getExerciseHistory = async (exerciseId, db) => {
  const sets = await db.sets
    .where('exerciseId')
    .equals(exerciseId)
    .reverse()
    .sortBy('createdAt');
  return sets;
};

// Calculate 1RM for each set and return history
export const getExerciseHistoryWith1RM = async (exerciseId, db) => {
  const sets = await getExerciseHistory(exerciseId, db);
  return sets.map(set => ({
    ...set,
    estimatedOneRM: calculate1RM(set.weight, set.reps)
  }));
};

// Get highest 1RM for an exercise
export const getHighest1RM = async (exerciseId, db) => {
  const history = await getExerciseHistoryWith1RM(exerciseId, db);
  if (history.length === 0) return 0;
  return Math.max(...history.map(h => h.estimatedOneRM));
};

// Calculate volume (sets * reps * weight)
export const calculateVolume = (sets, reps, weight) => {
  return sets * reps * weight;
};

// Get muscle usage for a date range (default: last 7 days)
export const getMuscleUsage = async (db, daysBack = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const sets = await db.sets
    .where('createdAt')
    .above(cutoffDate)
    .toArray();

  const exercises = await db.exercises.toArray();
  const customExercises = await db.customExercises.toArray();
  const allExercises = [...exercises, ...customExercises];

  const muscleVolume = {};
  const muscleDays = {};

  // Initialize
  const muscleGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'forearms', 'abs', 'calves', 'traps', 'obliques', 'hip-flexors'];
  muscleGroups.forEach(mg => {
    muscleVolume[mg] = 0;
    muscleDays[mg] = new Set();
  });

  // Calculate volume per muscle
  sets.forEach(set => {
    const exercise = allExercises.find(ex => ex.id === set.exerciseId);
    if (exercise && exercise.muscleGroups) {
      const volume = calculateVolume(1, set.reps, set.weight);
      const day = set.createdAt.toDateString();
      
      exercise.muscleGroups.forEach(mg => {
        muscleVolume[mg] += volume;
        muscleDays[mg].add(day);
      });
    }
  });

  return { muscleVolume, muscleDays };
};

// Calculate muscle fatigue based on volume
export const calculateMuscleFatigue = async (db, daysBack = 7) => {
  const { muscleVolume, muscleDays } = await getMuscleUsage(db, daysBack);

  // Simple baseline: assume 15,000 lbs is normal weekly chest volume
  // This can be made more sophisticated based on user's history
  const baselineVolume = {
    chest: 15000,
    back: 18000,
    shoulders: 10000,
    biceps: 8000,
    triceps: 8000,
    quads: 20000,
    hamstrings: 15000,
    glutes: 15000,
    forearms: 5000,
    abs: 5000,
    calves: 8000,
    traps: 5000,
    obliques: 3000,
    'hip-flexors': 3000
  };

  const fatigueLevels = {};
  Object.keys(muscleVolume).forEach(muscle => {
    const volume = muscleVolume[muscle];
    const baseline = baselineVolume[muscle] || 10000;
    const percentage = Math.round((volume / baseline) * 100);
    const daysSinceWorked = getDaysSinceWorked(muscleDays[muscle]);

    if (volume === 0) {
      fatigueLevels[muscle] = {
        percentage: 0,
        status: 'ready',
        daysSinceWorked: daysSinceWorked,
        volume: volume
      };
    } else if (percentage <= 60) {
      fatigueLevels[muscle] = {
        percentage,
        status: 'recovered',
        daysSinceWorked: daysSinceWorked,
        volume: volume
      };
    } else if (percentage <= 100) {
      fatigueLevels[muscle] = {
        percentage,
        status: 'moderate',
        daysSinceWorked: daysSinceWorked,
        volume: volume
      };
    } else if (percentage <= 150) {
      fatigueLevels[muscle] = {
        percentage,
        status: 'fatigued',
        daysSinceWorked: daysSinceWorked,
        volume: volume
      };
    } else {
      fatigueLevels[muscle] = {
        percentage,
        status: 'overworked',
        daysSinceWorked: daysSinceWorked,
        volume: volume
      };
    }
  });

  return fatigueLevels;
};

// Get days since muscle was worked
const getDaysSinceWorked = (daysSet) => {
  if (daysSet.size === 0) return null;
  const today = new Date().toDateString();
  const sortedDays = Array.from(daysSet).sort().reverse();
  const lastWorkDay = new Date(sortedDays[0]);
  const today_date = new Date();
  const diffTime = Math.abs(today_date - lastWorkDay);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Export data to CSV
export const exportToCSV = (sets, exercises) => {
  const headers = ['Date', 'Exercise', 'Weight (lbs)', 'Reps', 'Muscle Groups', 'Estimated 1RM', 'Volume (lbs)'];
  const rows = sets.map(set => {
    const exercise = exercises.find(ex => ex.id === set.exerciseId);
    const oneRM = calculate1RM(set.weight, set.reps);
    const volume = calculateVolume(1, set.reps, set.weight);
    return [
      formatDate(set.createdAt),
      exercise?.name || 'Unknown',
      set.weight,
      set.reps,
      exercise?.muscleGroups?.join(', ') || '',
      oneRM.toFixed(2),
      volume.toFixed(0)
    ];
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
};

// Export all data to JSON for backup
export const exportToJSON = async (db) => {
  const sets = await db.sets.toArray();
  const workouts = await db.workouts.toArray();
  const customExercises = await db.customExercises.toArray();
  
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      sets,
      workouts,
      customExercises
    }
  };
  
  return JSON.stringify(backup, null, 2);
};

// Import data from JSON backup
export const importFromJSON = async (db, jsonData) => {
  try {
    const backup = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    if (!backup.data) {
      throw new Error('Invalid backup format');
    }

    const { sets, workouts, customExercises } = backup.data;

    // Clear existing data (optional - user should confirm)
    // await db.sets.clear();
    // await db.workouts.clear();
    // await db.customExercises.clear();

    // Import new data
    if (sets && sets.length > 0) {
      await db.sets.bulkAdd(sets.map(s => ({
        ...s,
        createdAt: new Date(s.createdAt)
      })));
    }

    if (workouts && workouts.length > 0) {
      await db.workouts.bulkAdd(workouts.map(w => ({
        ...w,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt)
      })));
    }

    if (customExercises && customExercises.length > 0) {
      await db.customExercises.bulkAdd(customExercises);
    }

    return { success: true, message: 'Data imported successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

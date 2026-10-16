import { DEFAULT_EXERCISES } from '../constants/exercises';

const STORAGE_KEYS = {
  WORKOUTS: 'gym_tracker_workouts_v1',
  CUSTOM_EXERCISES: 'gym_tracker_custom_exercises_v1',
  SETTINGS: 'gym_tracker_settings_v1',
  INITIALIZED: 'gym_tracker_initialized_v1',
};

// Return YYYY-MM-DD from Date object
export function formatDateKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Display date string nicely: e.g. "Wednesday, Oct 7, 2026"
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Get all workouts map: { [dateStr]: workoutObject }
export function getStoredWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load workouts from localStorage:', err);
    return {};
  }
}

export function saveStoredWorkouts(workouts) {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  } catch (err) {
    console.error('Failed to save workouts to localStorage:', err);
  }
}

// Custom exercises
export function getCustomExercises() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load custom exercises:', err);
    return [];
  }
}

export function saveCustomExercises(customExercises) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customExercises));
  } catch (err) {
    console.error('Failed to save custom exercises:', err);
  }
}

export function getAllExercises() {
  const custom = getCustomExercises();
  return [...DEFAULT_EXERCISES, ...custom];
}

// Settings (e.g. default unit 'kg' or 'lbs')
export function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { unit: 'kg', restTimerSeconds: 90, autoTimer: true };
    return { unit: 'kg', restTimerSeconds: 90, autoTimer: true, ...JSON.parse(raw) };
  } catch {
    return { unit: 'kg', restTimerSeconds: 90, autoTimer: true };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// Compute personal record (PR) and previous performance for an exercise
export function getExerciseHistory(exerciseId, allWorkouts, currentDateKey = null) {
  let maxWeight = 0;
  let maxVolume = 0;
  let lastSessionSets = null;
  let lastSessionDate = null;

  const sortedDates = Object.keys(allWorkouts)
    .filter(d => (!currentDateKey || d < currentDateKey))
    .sort((a, b) => b.localeCompare(a)); // newest first

  for (const dateKey of Object.keys(allWorkouts)) {
    const session = allWorkouts[dateKey];
    if (!session || !session.exercises) continue;
    
    for (const ex of session.exercises) {
      if (ex.exerciseId === exerciseId) {
        for (const s of ex.sets || []) {
          const w = parseFloat(s.weight) || 0;
          const r = parseInt(s.reps, 10) || 0;
          if (w > maxWeight) maxWeight = w;
          const vol = w * r;
          if (vol > maxVolume) maxVolume = vol;
        }
      }
    }
  }

  // Find most recent prior session with this exercise
  for (const dateKey of sortedDates) {
    const session = allWorkouts[dateKey];
    if (!session || !session.exercises) continue;
    const match = session.exercises.find(e => e.exerciseId === exerciseId);
    if (match && match.sets && match.sets.length > 0) {
      lastSessionSets = match.sets;
      lastSessionDate = dateKey;
      break;
    }
  }

  return {
    maxWeight,
    maxVolume,
    lastSessionSets,
    lastSessionDate
  };
}

// Compute stats for a given workout day
export function calculateWorkoutStats(workout) {
  if (!workout || !workout.exercises || workout.exercises.length === 0) {
    return { totalExercises: 0, totalSets: 0, totalReps: 0, totalVolume: 0 };
  }

  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;

  workout.exercises.forEach(ex => {
    (ex.sets || []).forEach(set => {
      totalSets += 1;
      const reps = parseInt(set.reps, 10) || 0;
      const weight = parseFloat(set.weight) || 0;
      totalReps += reps;
      totalVolume += weight * reps;
    });
  });

  return {
    totalExercises: workout.exercises.length,
    totalSets,
    totalReps,
    totalVolume: Math.round(totalVolume)
  };
}

// Compute streak and monthly stats
export function calculateMonthlyStats(allWorkouts, year, month) {
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const daysInMonth = Object.keys(allWorkouts).filter(k => k.startsWith(monthPrefix));
  
  let workoutDaysCount = 0;
  let totalSets = 0;
  let totalVolume = 0;
  const muscleGroupCount = {};

  daysInMonth.forEach(dateKey => {
    const workout = allWorkouts[dateKey];
    if (workout && workout.exercises && workout.exercises.length > 0) {
      workoutDaysCount += 1;
      const stats = calculateWorkoutStats(workout);
      totalSets += stats.totalSets;
      totalVolume += stats.totalVolume;

      workout.exercises.forEach(ex => {
        const cat = ex.category || 'Other';
        muscleGroupCount[cat] = (muscleGroupCount[cat] || 0) + (ex.sets?.length || 1);
      });
    }
  });

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  let checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Check today first, if not logged check yesterday
  const todayKey = formatDateKey(checkDate);
  const hasWorkoutToday = allWorkouts[todayKey]?.exercises?.length > 0;
  
  if (!hasWorkoutToday) {
    // If not worked out today, check yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = formatDateKey(checkDate);
    const hasWorkout = allWorkouts[key]?.exercises?.length > 0;
    if (hasWorkout) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    workoutDaysCount,
    totalSets,
    totalVolume,
    muscleGroupCount,
    currentStreak
  };
}

// Seed sample data for first-time user so calendar is immediately informative
export function initSeedDataIfEmpty() {
  const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (isInit) return;

  const today = new Date();
  const makeDate = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return formatDateKey(d);
  };

  const sampleWorkouts = {
    [makeDate(-4)]: {
      id: `workout_${makeDate(-4)}`,
      date: makeDate(-4),
      name: 'Leg Day & Core',
      notes: 'Hit a solid depth on squats. Good energy.',
      exercises: [
        {
          exerciseId: 'ex_barbell_squat',
          exerciseName: 'Barbell Back Squat',
          category: 'Legs',
          sets: [
            { id: 's1', reps: 10, weight: 60, isCompleted: true, type: 'warmup' },
            { id: 's2', reps: 8, weight: 90, isCompleted: true, type: 'normal' },
            { id: 's3', reps: 8, weight: 95, isCompleted: true, type: 'normal' },
            { id: 's4', reps: 6, weight: 100, isCompleted: true, type: 'normal' }
          ]
        },
        {
          exerciseId: 'ex_rdl',
          exerciseName: 'Romanian Deadlift (RDL)',
          category: 'Legs',
          sets: [
            { id: 's1', reps: 10, weight: 70, isCompleted: true, type: 'normal' },
            { id: 's2', reps: 10, weight: 75, isCompleted: true, type: 'normal' },
            { id: 's3', reps: 8, weight: 80, isCompleted: true, type: 'normal' }
          ]
        },
        {
          exerciseId: 'ex_hanging_leg_raise',
          exerciseName: 'Hanging Leg Raise',
          category: 'Core',
          sets: [
            { id: 's1', reps: 15, weight: 0, isCompleted: true, type: 'normal' },
            { id: 's2', reps: 12, weight: 0, isCompleted: true, type: 'normal' },
            { id: 's3', reps: 12, weight: 0, isCompleted: true, type: 'normal' }
          ]
        }
      ]
    },
    [makeDate(-2)]: {
      id: `workout_${makeDate(-2)}`,
      date: makeDate(-2),
      name: 'Push Day (Chest, Shoulders, Triceps)',
      notes: 'Felt great pump on incline press and rope pushdowns.',
      exercises: [
        {
          exerciseId: 'ex_bench_press',
          exerciseName: 'Barbell Bench Press',
          category: 'Chest',
          sets: [
            { id: 's1', reps: 12, weight: 50, isCompleted: true, type: 'warmup' },
            { id: 's2', reps: 8, weight: 80, isCompleted: true, type: 'normal' },
            { id: 's3', reps: 8, weight: 85, isCompleted: true, type: 'normal' },
            { id: 's4', reps: 6, weight: 90, isCompleted: true, type: 'normal' }
          ]
        },
        {
          exerciseId: 'ex_incline_db_press',
          exerciseName: 'Incline Dumbbell Press',
          category: 'Chest',
          sets: [
            { id: 's1', reps: 10, weight: 28, isCompleted: true, type: 'normal' },
            { id: 's2', reps: 10, weight: 30, isCompleted: true, type: 'normal' },
            { id: 's3', reps: 8, weight: 32, isCompleted: true, type: 'normal' }
          ]
        },
        {
          exerciseId: 'ex_lateral_raise',
          exerciseName: 'Dumbbell Lateral Raise',
          category: 'Shoulders',
          sets: [
            { id: 's1', reps: 15, weight: 12, isCompleted: true, type: 'normal' },
            { id: 's2', reps: 14, weight: 12, isCompleted: true, type: 'normal' },
            { id: 's3', reps: 12, weight: 14, isCompleted: true, type: 'drop' }
          ]
        },
        {
          exerciseId: 'ex_tricep_rope_pushdown',
          exerciseName: 'Tricep Rope Pushdown',
          category: 'Arms',
          sets: [
            { id: 's1', reps: 12, weight: 25, isCompleted: true, type: 'normal' },
            { id: 's2', reps: 12, weight: 27.5, isCompleted: true, type: 'normal' },
            { id: 's3', reps: 10, weight: 30, isCompleted: true, type: 'normal' }
          ]
        }
      ]
    },
    [makeDate(0)]: {
      id: `workout_${makeDate(0)}`,
      date: makeDate(0),
      name: 'Pull Day (Back & Biceps)',
      notes: 'Strong deadlifts today! Ready to crush the week.',
      exercises: [
        {
          exerciseId: 'ex_deadlift',
          exerciseName: 'Barbell Deadlift',
          category: 'Back',
          sets: [
            { id: 's1', reps: 8, weight: 80, isCompleted: true, type: 'warmup' },
            { id: 's2', reps: 5, weight: 120, isCompleted: true, type: 'normal' },
            { id: 's3', reps: 5, weight: 130, isCompleted: true, type: 'normal' },
            { id: 's4', reps: 4, weight: 140, isCompleted: true, type: 'normal' }
          ]
        },
        {
          exerciseId: 'ex_pullups',
          exerciseName: 'Pull-Ups / Chin-Ups',
          category: 'Back',
          sets: [
            { id: 's1', reps: 10, weight: 0, isCompleted: true, type: 'normal' },
            { id: 's2', reps: 9, weight: 0, isCompleted: true, type: 'normal' },
            { id: 's3', reps: 8, weight: 0, isCompleted: true, type: 'normal' }
          ]
        },
        {
          exerciseId: 'ex_barbell_curl',
          exerciseName: 'Barbell Bicep Curl',
          category: 'Arms',
          sets: [
            { id: 's1', reps: 12, weight: 30, isCompleted: true, type: 'normal' },
            { id: 's2', reps: 10, weight: 35, isCompleted: true, type: 'normal' },
            { id: 's3', reps: 8, weight: 35, isCompleted: true, type: 'normal' }
          ]
        }
      ]
    }
  };

  saveStoredWorkouts(sampleWorkouts);
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// Reset / Clear / Export
export function exportDataAsJSON() {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    workouts: getStoredWorkouts(),
    customExercises: getCustomExercises(),
    settings: getSettings()
  };
  return JSON.stringify(data, null, 2);
}

export function importDataFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.workouts) saveStoredWorkouts(data.workouts);
    if (data.customExercises) saveCustomExercises(data.customExercises);
    if (data.settings) saveSettings(data.settings);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_EXERCISES);
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

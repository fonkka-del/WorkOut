import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import CalendarView from './components/CalendarView';
import WorkoutDay from './components/WorkoutDay';
import ExerciseLibraryView from './components/ExerciseLibraryView';
import ExerciseSelectorModal from './components/ExerciseSelectorModal';
import AddExerciseModal from './components/AddExerciseModal';
import RestTimer from './components/RestTimer';
import SettingsModal from './components/SettingsModal';
import {
  getStoredWorkouts,
  saveStoredWorkouts,
  getSettings,
  saveSettings,
  formatDateKey,
  initSeedDataIfEmpty,
  calculateMonthlyStats
} from './utils/storage';

export default function App() {
  const [workouts, setWorkouts] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [activeTab, setActiveTab] = useState('workout'); // 'workout' | 'library'
  const [settings, setSettings] = useState(() => getSettings());

  // Modals state
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Initialize sample data on first run
  useEffect(() => {
    initSeedDataIfEmpty();
    const stored = getStoredWorkouts();
    setWorkouts(stored);
  }, []);

  const handleUpdateWorkout = (updatedWorkout) => {
    const updatedMap = {
      ...workouts,
      [updatedWorkout.date]: updatedWorkout
    };
    setWorkouts(updatedMap);
    saveStoredWorkouts(updatedMap);

    // Check if all sets completed
    const allSetsCompleted =
      updatedWorkout.exercises?.length > 0 &&
      updatedWorkout.exercises.every(ex => ex.sets?.length > 0 && ex.sets.every(s => s.isCompleted));
    if (allSetsCompleted) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
  };

  const handleAddExerciseToWorkout = (exercise) => {
    const currentWorkout = workouts[selectedDate] || {
      id: `workout_${selectedDate}`,
      date: selectedDate,
      name: '',
      notes: '',
      exercises: []
    };

    const newExerciseEntry = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      sets: [
        {
          id: `set_${Date.now()}_1`,
          setNumber: 1,
          weight: 0,
          reps: 10,
          isCompleted: false,
          type: 'normal'
        }
      ]
    };

    const updated = {
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, newExerciseEntry]
    };

    handleUpdateWorkout(updated);
  };

  const handleExerciseCreated = (newExercise) => {
    // Automatically offer to add it to current workout if selector was opened from day view
    handleAddExerciseToWorkout(newExercise);
  };

  const handleReloadData = () => {
    setWorkouts(getStoredWorkouts());
    setSettings(getSettings());
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const currentWorkout = workouts[selectedDate];
  const monthlyStats = calculateMonthlyStats(
    workouts,
    new Date(selectedDate).getFullYear(),
    new Date(selectedDate).getMonth()
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenAddExercise={() => setIsAddExerciseOpen(true)}
        streakCount={monthlyStats.currentStreak}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'workout' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Calendar & Monthly Consistency */}
            <div className="lg:col-span-5 space-y-6">
              <CalendarView
                allWorkouts={workouts}
                selectedDate={selectedDate}
                onSelectDate={(newDate) => setSelectedDate(newDate)}
                unit={settings.unit}
              />
            </div>

            {/* Right Column: Workout Day Editor */}
            <div className="lg:col-span-7 space-y-6">
              <WorkoutDay
                dateKey={selectedDate}
                workout={currentWorkout}
                allWorkouts={workouts}
                onUpdateWorkout={handleUpdateWorkout}
                onOpenExerciseSelector={() => setIsExerciseSelectorOpen(true)}
                onStartRestTimer={() => setIsTimerOpen(true)}
                onNavigateDate={(newDate) => setSelectedDate(newDate)}
                unit={settings.unit}
              />
            </div>
          </div>
        ) : (
          /* Exercise Library Tab */
          <ExerciseLibraryView
            allWorkouts={workouts}
            onOpenCreateExercise={() => setIsAddExerciseOpen(true)}
            onAddToToday={(exercise) => {
              handleAddExerciseToWorkout(exercise);
              setActiveTab('workout');
            }}
            unit={settings.unit}
          />
        )}
      </main>

      {/* Floating Rest Timer */}
      <RestTimer
        initialSeconds={settings.restTimerSeconds || 90}
        isOpen={isTimerOpen}
        setIsOpen={setIsTimerOpen}
      />

      {/* Modals */}
      <ExerciseSelectorModal
        isOpen={isExerciseSelectorOpen}
        onClose={() => setIsExerciseSelectorOpen(false)}
        onSelectExercise={handleAddExerciseToWorkout}
        onOpenCreateExercise={() => {
          setIsExerciseSelectorOpen(false);
          setIsAddExerciseOpen(true);
        }}
        alreadyAddedIds={(currentWorkout?.exercises || []).map(e => e.exerciseId)}
      />

      <AddExerciseModal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        onExerciseCreated={handleExerciseCreated}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onReloadData={handleReloadData}
      />
    </div>
  );
}

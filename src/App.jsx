import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CalendarView from './components/CalendarView';
import WorkoutDay from './components/WorkoutDay';
import NotesView from './components/NotesView';
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
  const [activeTab, setActiveTab] = useState('workout'); // 'workout' | 'calendar' | 'notes' | 'exercises'
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

  // Sync theme with document class (light vs dark)
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [settings.theme]);

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    handleUpdateSettings({ ...settings, theme: nextTheme });
  };

  const handleUpdateWorkout = (updatedWorkout) => {
    const updatedMap = {
      ...workouts,
      [updatedWorkout.date]: updatedWorkout
    };
    setWorkouts(updatedMap);
    saveStoredWorkouts(updatedMap);
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

  const handleGoToWorkout = (dateKey) => {
    setSelectedDate(dateKey);
    setActiveTab('workout');
  };

  const handleGoToNotes = (dateKey) => {
    setSelectedDate(dateKey);
    setActiveTab('notes');
  };

  const currentWorkout = workouts[selectedDate];
  const todayKey = formatDateKey(new Date());
  const hasTodayWorkout = workouts[todayKey]?.exercises?.length > 0;

  const monthlyStats = calculateMonthlyStats(
    workouts,
    new Date(selectedDate).getFullYear(),
    new Date(selectedDate).getMonth()
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenAddExercise={() => setIsAddExerciseOpen(true)}
        streakCount={monthlyStats.currentStreak}
        theme={settings.theme || 'dark'}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area - with pb-24 for bottom navbar clearance */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 pb-28">
        {/* Tab 1: Workout Logger */}
        {activeTab === 'workout' && (
          <WorkoutDay
            dateKey={selectedDate}
            workout={currentWorkout}
            allWorkouts={workouts}
            onUpdateWorkout={handleUpdateWorkout}
            onOpenExerciseSelector={() => setIsExerciseSelectorOpen(true)}
            onStartRestTimer={() => setIsTimerOpen(true)}
            onNavigateDate={(newDate) => setSelectedDate(newDate)}
            onGoToNotes={handleGoToNotes}
            unit={settings.unit}
          />
        )}

        {/* Tab 2: Monthly Calendar */}
        {activeTab === 'calendar' && (
          <CalendarView
            allWorkouts={workouts}
            selectedDate={selectedDate}
            onSelectDate={(newDate) => setSelectedDate(newDate)}
            onGoToWorkout={handleGoToWorkout}
            unit={settings.unit}
          />
        )}

        {/* Tab 3: Workout Notes & Journal */}
        {activeTab === 'notes' && (
          <NotesView
            selectedDate={selectedDate}
            onSelectDate={(newDate) => setSelectedDate(newDate)}
            workouts={workouts}
            onUpdateWorkout={handleUpdateWorkout}
            onGoToWorkout={handleGoToWorkout}
          />
        )}

        {/* Tab 4: Exercise Library */}
        {activeTab === 'exercises' && (
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

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasTodayWorkout={hasTodayWorkout}
      />

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

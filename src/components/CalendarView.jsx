import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flame,
  Dumbbell,
  Award,
  TrendingUp,
  ArrowRight,
  Plus
} from 'lucide-react';
import { formatDateKey, formatDisplayDate, calculateMonthlyStats, calculateWorkoutStats } from '../utils/storage';

export default function CalendarView({
  allWorkouts,
  selectedDate,
  onSelectDate,
  onGoToWorkout,
  unit = 'kg'
}) {
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(formatDateKey(today));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6;

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const trailingDays = [];
  for (let i = startDayIndex - 1; i >= 0; i--) {
    trailingDays.push(prevMonthLastDay - i);
  }

  const todayKey = formatDateKey(new Date());
  const monthlyStats = calculateMonthlyStats(allWorkouts, year, month);

  // Selected date workout info for preview
  const selectedWorkout = allWorkouts[selectedDate];
  const hasSelectedWorkout = selectedWorkout && selectedWorkout.exercises && selectedWorkout.exercises.length > 0;
  const selectedWorkoutStats = calculateWorkoutStats(selectedWorkout);

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-6">
      {/* Month Navigation & Stats Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {monthNames[month]} <span className="text-zinc-400 font-normal">{year}</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Tap any day to see details or log a workout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleJumpToday}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-700/80 transition"
            >
              Today
            </button>
            <div className="flex items-center bg-zinc-800/80 rounded-xl border border-zinc-700/80 p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-750 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-750 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80">
          <div className="p-2.5 bg-zinc-850 rounded-xl border border-zinc-800 flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400">Gym Days</div>
              <div className="text-sm font-bold text-white">{monthlyStats.workoutDaysCount} days</div>
            </div>
          </div>

          <div className="p-2.5 bg-zinc-850 rounded-xl border border-zinc-800 flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400">Streak</div>
              <div className="text-sm font-bold text-amber-400">{monthlyStats.currentStreak}d</div>
            </div>
          </div>

          <div className="p-2.5 bg-zinc-850 rounded-xl border border-zinc-800 flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400">Total Sets</div>
              <div className="text-sm font-bold text-white">{monthlyStats.totalSets}</div>
            </div>
          </div>

          <div className="p-2.5 bg-zinc-850 rounded-xl border border-zinc-800 flex items-center gap-2.5">
            <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400">Volume</div>
              <div className="text-sm font-bold text-white truncate">
                {monthlyStats.totalVolume.toLocaleString()} {unit}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/60">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900 text-center py-2 text-xs font-semibold text-zinc-400">
            {daysOfWeek.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 auto-rows-fr text-sm">
            {/* Blanks from previous month */}
            {trailingDays.map((dayNum, i) => (
              <div
                key={`trailing-${i}`}
                className="h-12 sm:h-16 p-1 border-b border-r border-zinc-850/60 opacity-20 bg-zinc-900/30 flex items-center justify-center text-xs text-zinc-500"
              >
                {dayNum}
              </div>
            ))}

            {/* Current month days */}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNum) => {
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const workout = allWorkouts[dateKey];
              const hasWorkout = workout && workout.exercises && workout.exercises.length > 0;
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;

              return (
                <div
                  key={dateKey}
                  onClick={() => onSelectDate(dateKey)}
                  className={`h-12 sm:h-16 p-1 sm:p-1.5 border-b border-r border-zinc-800/60 flex flex-col items-center justify-between cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-emerald-500/20 ring-2 ring-emerald-500 z-10'
                      : hasWorkout
                      ? 'bg-zinc-850/90 hover:bg-zinc-800'
                      : 'bg-zinc-900/40 hover:bg-zinc-850/60'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center text-xs font-bold w-6 h-6 rounded-full transition ${
                      isToday
                        ? 'bg-emerald-400 text-zinc-950 font-extrabold shadow-sm shadow-emerald-400/50'
                        : isSelected
                        ? 'text-emerald-400 font-extrabold'
                        : 'text-zinc-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Workout Dot / Badge */}
                  {hasWorkout ? (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
                      <span className="hidden sm:inline text-[10px] text-emerald-400 font-semibold">
                        {workout.exercises.length}ex
                      </span>
                    </div>
                  ) : (
                    <div className="h-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Preview & Action Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Selected Date
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {formatDisplayDate(selectedDate)}
            </div>
          </div>

          <button
            onClick={() => onGoToWorkout(selectedDate)}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <span>{hasSelectedWorkout ? 'Open / Edit Workout' : 'Start Workout Here'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {hasSelectedWorkout ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-emerald-300">
                {selectedWorkout.name || 'Workout Session'}
              </span>
              <span className="text-xs text-zinc-400">
                • {selectedWorkoutStats.totalExercises} exercises, {selectedWorkoutStats.totalSets} sets, {selectedWorkoutStats.totalVolume.toLocaleString()} {unit}
              </span>
            </div>

            {/* List of exercises */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedWorkout.exercises.map((ex, i) => (
                <div key={i} className="p-2.5 bg-zinc-850 rounded-xl border border-zinc-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{ex.exerciseName}</div>
                    <div className="text-[11px] text-zinc-400">{ex.category}</div>
                  </div>
                  <div className="text-zinc-300 font-mono font-medium">
                    {ex.sets?.length || 0} sets
                  </div>
                </div>
              ))}
            </div>

            {selectedWorkout.notes && (
              <div className="text-xs text-zinc-400 italic bg-zinc-850/50 p-2.5 rounded-xl border border-zinc-800">
                "{selectedWorkout.notes}"
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-zinc-400 text-xs space-y-2">
            <p>No workout logged yet for {formatDisplayDate(selectedDate)}.</p>
            <button
              onClick={() => onGoToWorkout(selectedDate)}
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Tap here to log exercises, sets & reps
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

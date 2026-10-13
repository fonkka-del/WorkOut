import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flame, Dumbbell, Award, TrendingUp } from 'lucide-react';
import { formatDateKey, calculateMonthlyStats } from '../utils/storage';

export default function CalendarView({
  allWorkouts,
  selectedDate,
  onSelectDate,
  unit = 'kg'
}) {
  // Current calendar view year & month
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

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Convert Sunday (0) to 6, Monday (1) to 0
  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6;

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const trailingDays = [];
  for (let i = startDayIndex - 1; i >= 0; i--) {
    trailingDays.push(prevMonthLastDay - i);
  }

  const todayKey = formatDateKey(new Date());
  const monthlyStats = calculateMonthlyStats(allWorkouts, year, month);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {monthNames[month]} <span className="text-zinc-400 font-normal">{year}</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Select any day to view or record gym workouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToday}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-700 transition"
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

      {/* Monthly Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="p-3 bg-zinc-800/60 border border-zinc-800 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-zinc-400">Gym Days</div>
            <div className="text-base font-bold text-white">{monthlyStats.workoutDaysCount} days</div>
          </div>
        </div>

        <div className="p-3 bg-zinc-800/60 border border-zinc-800 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-zinc-400">Streak</div>
            <div className="text-base font-bold text-amber-400">{monthlyStats.currentStreak} days</div>
          </div>
        </div>

        <div className="p-3 bg-zinc-800/60 border border-zinc-800 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-zinc-400">Total Sets</div>
            <div className="text-base font-bold text-white">{monthlyStats.totalSets} sets</div>
          </div>
        </div>

        <div className="p-3 bg-zinc-800/60 border border-zinc-800 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-zinc-400">Volume</div>
            <div className="text-base font-bold text-white">
              {monthlyStats.totalVolume.toLocaleString()} {unit}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-950/40">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-850/50 text-center py-2 text-xs font-semibold text-zinc-400">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr text-sm">
          {/* Previous month leading blanks */}
          {trailingDays.map((dayNum, i) => (
            <div
              key={`trailing-${i}`}
              className="min-h-[72px] sm:min-h-[88px] p-1.5 border-b border-r border-zinc-800/50 opacity-25 bg-zinc-900/30 flex flex-col justify-between"
            >
              <span className="text-xs text-zinc-500">{dayNum}</span>
            </div>
          ))}

          {/* Current month days */}
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNum) => {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const workout = allWorkouts[dateKey];
            const hasWorkout = workout && workout.exercises && workout.exercises.length > 0;
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDate;

            let totalSetsCount = 0;
            if (hasWorkout) {
              workout.exercises.forEach(e => {
                totalSetsCount += (e.sets?.length || 0);
              });
            }

            return (
              <div
                key={dateKey}
                onClick={() => onSelectDate(dateKey)}
                className={`min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 border-b border-r border-zinc-800/60 flex flex-col justify-between cursor-pointer transition relative group ${
                  isSelected
                    ? 'bg-emerald-500/15 ring-2 ring-emerald-500 z-10'
                    : hasWorkout
                    ? 'bg-zinc-850/80 hover:bg-zinc-800'
                    : 'bg-zinc-900/40 hover:bg-zinc-850/60'
                }`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-bold w-6 h-6 rounded-full ${
                      isToday
                        ? 'bg-emerald-400 text-zinc-950 font-extrabold shadow-sm shadow-emerald-400/50'
                        : isSelected
                        ? 'text-emerald-400 font-extrabold'
                        : 'text-zinc-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {hasWorkout && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                {/* Workout Indicators */}
                {hasWorkout ? (
                  <div className="mt-1">
                    <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-400 truncate">
                      {workout.name || `${workout.exercises.length} Exercises`}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-400 flex items-center gap-1">
                      <Dumbbell className="w-2.5 h-2.5 text-zinc-500" />
                      <span>{workout.exercises.length} ex • {totalSetsCount} sets</span>
                    </div>
                  </div>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 transition text-[10px] text-zinc-500 text-center py-1">
                    + Log
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

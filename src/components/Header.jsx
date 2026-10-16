import React from 'react';
import { Dumbbell, Settings, Flame, Timer, Plus } from 'lucide-react';

export default function Header({
  onOpenSettings,
  onOpenTimer,
  onOpenAddExercise,
  streakCount = 0
}) {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 shadow-md shadow-emerald-500/20">
            <Dumbbell className="w-4 h-4 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                Iron<span className="text-emerald-400">Track</span>
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">Workout & Gym Tracker</span>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Streak pill */}
          {streakCount > 0 && (
            <div
              title={`${streakCount} consecutive gym days!`}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-bold"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{streakCount}d</span>
            </div>
          )}

          {/* Quick Create Custom Exercise */}
          <button
            onClick={onOpenAddExercise}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-semibold transition"
            title="Create Custom Exercise"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Exercise</span>
          </button>

          {/* Rest Timer */}
          <button
            onClick={onOpenTimer}
            className="p-2 bg-zinc-850 hover:bg-zinc-800 text-amber-400 border border-zinc-750 rounded-xl transition"
            title="Open Rest Timer"
          >
            <Timer className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-750 rounded-xl transition"
            title="Settings & Data"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

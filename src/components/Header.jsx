import React from 'react';
import { Dumbbell, Calendar, BookOpen, Settings, Flame, Timer, Plus } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenTimer,
  onOpenAddExercise,
  streakCount = 0,
  isTimerActive = false
}) {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/25">
            <Dumbbell className="w-5 h-5 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white uppercase">
                Iron<span className="text-emerald-400">Track</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-zinc-400 -mt-0.5">
              Sets • Reps • Progressive Overload
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('workout')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'workout'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar & Log</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'library'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exercise</span> Library
          </button>
        </div>

        {/* Right tools: Streak, Timer, Add Exercise, Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Streak pill */}
          {streakCount > 0 && (
            <div
              title={`${streakCount} consecutive gym days!`}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-bold"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{streakCount}d Streak</span>
            </div>
          )}

          {/* New Exercise Button */}
          <button
            onClick={onOpenAddExercise}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-semibold transition"
            title="Create Custom Exercise"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Exercise</span>
          </button>

          {/* Timer Trigger */}
          <button
            onClick={onOpenTimer}
            className="p-2 bg-zinc-850 hover:bg-zinc-800 text-amber-400 border border-zinc-750 rounded-xl transition shadow-sm"
            title="Open Rest Timer"
          >
            <Timer className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-750 rounded-xl transition"
            title="Settings & Data Export"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Dumbbell,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { formatDisplayDate, formatDateKey } from '../utils/storage';

export default function NotesView({
  selectedDate,
  onSelectDate,
  workouts,
  onUpdateWorkout,
  onGoToWorkout
}) {
  const [search, setSearch] = useState('');
  const [savedBadge, setSavedBadge] = useState(false);

  const currentWorkout = workouts[selectedDate] || {
    id: `workout_${selectedDate}`,
    date: selectedDate,
    name: '',
    notes: '',
    exercises: []
  };

  const currentNotes = currentWorkout.notes || '';

  const handleNotesChange = (text) => {
    onUpdateWorkout({
      ...currentWorkout,
      notes: text
    });
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const handleAppendTag = (tag) => {
    const updated = currentNotes ? `${currentNotes}\n• ${tag}` : `• ${tag}`;
    handleNotesChange(updated);
  };

  // Shift selected date
  const shiftDate = (offsetDays) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offsetDays);
    onSelectDate(formatDateKey(date));
  };

  const isToday = selectedDate === formatDateKey(new Date());

  // Collect all dates that have notes or workouts
  const datesWithNotes = Object.keys(workouts)
    .filter((k) => {
      const w = workouts[k];
      const hasNote = w && w.notes && w.notes.trim().length > 0;
      if (!hasNote) return false;
      if (!search.trim()) return true;
      return (
        w.notes.toLowerCase().includes(search.toLowerCase()) ||
        (w.name && w.name.toLowerCase().includes(search.toLowerCase())) ||
        k.includes(search)
      );
    })
    .sort((a, b) => b.localeCompare(a)); // newest first

  const quickTags = [
    'Great pump & high energy 💪',
    'Hit new PR today 🏆',
    'Felt fatigued / low sleep 😴',
    'Good focus, controlled tempo 🎯',
    'Joints feeling good & warm ⚡',
    'Shoulder felt a bit tight ⚠️'
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-6">
      {/* View Title */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Workout Notes</h2>
            <p className="text-xs text-zinc-400">Log workout reflections, cues, and journal entries</p>
          </div>
        </div>

        {savedBadge && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      {/* Active Day Notes Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Date Selector Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftDate(-1)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-white">
                  {formatDisplayDate(selectedDate)}
                </span>
                {isToday && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Today
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-400">
                {currentWorkout.name || (currentWorkout.exercises?.length > 0 ? `${currentWorkout.exercises.length} Exercises Logged` : 'No workout name yet')}
              </span>
            </div>
            <button
              onClick={() => shiftDate(1)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                onClick={() => onSelectDate(formatDateKey(new Date()))}
                className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded-xl border border-zinc-700/80 transition"
              >
                Today
              </button>
            )}
            <button
              onClick={() => onGoToWorkout(selectedDate)}
              className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View</span> Workout
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Notes for {formatDisplayDate(selectedDate)}
          </label>
          <textarea
            rows={5}
            value={currentNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Write your notes here... (How did your sets feel? Any shoulder pain? Energy levels? Progressive overload goals for next week?)"
            className="w-full p-3.5 bg-zinc-850 border border-zinc-750 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
          />
        </div>

        {/* Quick Tags */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Quick Insert Cues:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAppendTag(tag)}
                className="px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white rounded-lg border border-zinc-750 transition"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Past Notes History */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Past Journal Entries ({datesWithNotes.length})</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search past notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {datesWithNotes.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs space-y-1">
            <FileText className="w-8 h-8 mx-auto opacity-30 text-zinc-400 mb-2" />
            <p className="font-semibold text-zinc-400">No notes found</p>
            <p>Write notes above for any workout date to start building your training journal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {datesWithNotes.map((dateKey) => {
              const item = workouts[dateKey];
              const isItemActive = dateKey === selectedDate;

              return (
                <div
                  key={dateKey}
                  onClick={() => onSelectDate(dateKey)}
                  className={`p-4 bg-zinc-900 border rounded-2xl shadow-md transition cursor-pointer group ${
                    isItemActive
                      ? 'border-emerald-500/80 bg-zinc-850'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                        {formatDisplayDate(dateKey)}
                      </span>
                      {item.name && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-zinc-800 text-zinc-300">
                          {item.name}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGoToWorkout(dateKey);
                      }}
                      className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition"
                    >
                      <span>Open Workout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 whitespace-pre-line mt-2.5 leading-relaxed">
                    {item.notes}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

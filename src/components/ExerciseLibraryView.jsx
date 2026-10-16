import React, { useState } from 'react';
import { Search, Plus, Dumbbell, Trophy, Trash2, Tag, Calendar, ArrowRight, Filter } from 'lucide-react';
import { MUSCLE_GROUPS } from '../constants/exercises';
import { getAllExercises, getCustomExercises, saveCustomExercises, getExerciseHistory, formatDateKey } from '../utils/storage';

export default function ExerciseLibraryView({
  allWorkouts,
  onOpenCreateExercise,
  onAddToToday,
  unit = 'kg'
}) {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [refreshKey, setRefreshKey] = useState(0);

  const allExercises = getAllExercises();

  const filtered = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment?.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || ex.category === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleDeleteCustom = (exId) => {
    if (confirm('Delete this custom exercise from your library?')) {
      const customs = getCustomExercises().filter(e => e.id !== exId);
      saveCustomExercises(customs);
      setRefreshKey(prev => prev + 1);
    }
  };

  // Group exercises count
  const customCount = allExercises.filter(e => e.isCustom).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Exercise Library</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {allExercises.length} movements available • {customCount} custom exercises created
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateExercise}
          className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Custom Exercise
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search exercises by name or equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Muscle group filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium whitespace-nowrap transition ${
                selectedGroup === group
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500 space-y-3">
            <Dumbbell className="w-12 h-12 mx-auto opacity-30 text-zinc-400" />
            <p className="text-sm">No exercises found.</p>
            <button
              onClick={onOpenCreateExercise}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-500/30"
            >
              <Plus className="w-4 h-4" /> Create New Exercise
            </button>
          </div>
        ) : (
          filtered.map((exercise) => {
            const history = getExerciseHistory(exercise.id, allWorkouts);

            return (
              <div
                key={exercise.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg hover:border-zinc-700 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-zinc-800 text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 rounded-xl transition">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                          {exercise.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                          <span className="text-emerald-400 font-medium">{exercise.category}</span>
                          <span>•</span>
                          <span>{exercise.equipment || 'Gym'}</span>
                        </div>
                      </div>
                    </div>

                    {exercise.isCustom && (
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Custom
                        </span>
                        <button
                          onClick={() => handleDeleteCustom(exercise.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-red-500/10 transition"
                          title="Delete custom exercise"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {exercise.notes && (
                    <p className="mt-2 text-xs text-zinc-400 italic bg-zinc-800/40 p-2 rounded-lg">
                      "{exercise.notes}"
                    </p>
                  )}

                  {/* History & PR snippet */}
                  <div className="mt-3 pt-3 border-t border-zinc-800/80 text-xs flex items-center justify-between">
                    <div className="text-zinc-400">
                      {history.maxWeight > 0 ? (
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Trophy className="w-3 h-3" /> PR: {history.maxWeight} {unit}
                        </span>
                      ) : (
                        <span className="text-zinc-500">Not logged yet</span>
                      )}
                    </div>

                    {history.lastSessionDate && (
                      <span className="text-[11px] text-zinc-500">
                        Last: {history.lastSessionDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to today button */}
                <div className="mt-4 pt-2">
                  <button
                    onClick={() => onAddToToday(exercise)}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98"
                  >
                    <span>Add to Selected Workout</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Plus, X, Dumbbell, Tag, Trash2, Check } from 'lucide-react';
import { MUSCLE_GROUPS } from '../constants/exercises';
import { getAllExercises, saveCustomExercises, getCustomExercises } from '../utils/storage';

export default function ExerciseSelectorModal({
  isOpen,
  onClose,
  onSelectExercise,
  onOpenCreateExercise,
  alreadyAddedIds = []
}) {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isOpen) return null;

  const allExercises = getAllExercises();

  const filteredExercises = allExercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment?.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || ex.category === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleDeleteCustom = (e, exId) => {
    e.stopPropagation();
    if (confirm('Delete this custom exercise from your library?')) {
      const customs = getCustomExercises().filter(ex => ex.id !== exId);
      saveCustomExercises(customs);
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Select Exercise</h2>
              <p className="text-xs text-zinc-400">Choose a movement to add to your workout</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateExercise}
              className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Exercise</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Muscle Filters */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search exercises by name or equipment (e.g. Bench, Dumbbell)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Group pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MUSCLE_GROUPS.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition ${
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

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredExercises.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-3">
              <Dumbbell className="w-10 h-10 mx-auto opacity-30 text-zinc-400" />
              <p className="text-sm">No exercises found matching "{search}"</p>
              <button
                onClick={onOpenCreateExercise}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl text-xs font-semibold border border-emerald-500/30 transition"
              >
                <Plus className="w-4 h-4" /> Add "{search || 'New Exercise'}" to Library
              </button>
            </div>
          ) : (
            filteredExercises.map((exercise) => {
              const isAlreadyAdded = alreadyAddedIds.includes(exercise.id);
              return (
                <div
                  key={exercise.id}
                  onClick={() => {
                    onSelectExercise(exercise);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer group ${
                    isAlreadyAdded
                      ? 'bg-zinc-800/40 border-zinc-800/80 hover:border-emerald-500/40'
                      : 'bg-zinc-800/80 border-zinc-700/60 hover:bg-zinc-800 hover:border-emerald-500/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-700/50 group-hover:bg-emerald-500/10 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition">
                          {exercise.name}
                        </span>
                        {exercise.isCustom && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Custom
                          </span>
                        )}
                        {isAlreadyAdded && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-700 text-zinc-400">
                            Added today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                        <span className="text-emerald-400 font-medium">{exercise.category}</span>
                        <span>•</span>
                        <span>{exercise.equipment || 'Gym'}</span>
                        {exercise.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-zinc-400 truncate max-w-[200px]">{exercise.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {exercise.isCustom && (
                      <button
                        onClick={(e) => handleDeleteCustom(e, exercise.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                        title="Delete custom exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="w-7 h-7 rounded-lg bg-zinc-700/50 group-hover:bg-emerald-500 group-hover:text-zinc-950 flex items-center justify-center text-zinc-400 transition">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/90 text-xs text-zinc-400 flex items-center justify-between">
          <span>{filteredExercises.length} movements available</span>
          <button
            onClick={onOpenCreateExercise}
            className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Can't find your exercise? Create it
          </button>
        </div>
      </div>
    </div>
  );
}

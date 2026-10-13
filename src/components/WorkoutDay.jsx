import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Circle,
  Dumbbell,
  Clock,
  Sparkles,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Info,
  Flame,
  FileText,
  Timer
} from 'lucide-react';
import { formatDisplayDate, formatDateKey, getExerciseHistory, calculateWorkoutStats } from '../utils/storage';
import { sound } from '../utils/audio';

export default function WorkoutDay({
  dateKey,
  workout,
  allWorkouts,
  onUpdateWorkout,
  onOpenExerciseSelector,
  onStartRestTimer,
  onNavigateDate,
  unit = 'kg'
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Initialize empty workout structure if not present
  const currentWorkout = workout || {
    id: `workout_${dateKey}`,
    date: dateKey,
    name: '',
    notes: '',
    exercises: []
  };

  const handleTitleChange = (newName) => {
    onUpdateWorkout({
      ...currentWorkout,
      name: newName
    });
  };

  const handleNotesChange = (newNotes) => {
    onUpdateWorkout({
      ...currentWorkout,
      notes: newNotes
    });
  };

  // Add a new set to an exercise
  const handleAddSet = (exerciseIndex) => {
    const ex = currentWorkout.exercises[exerciseIndex];
    const sets = ex.sets || [];
    const lastSet = sets[sets.length - 1];

    const newSet = {
      id: `set_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      setNumber: sets.length + 1,
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 10,
      isCompleted: false,
      type: 'normal'
    };

    const updatedExercises = [...currentWorkout.exercises];
    updatedExercises[exerciseIndex] = {
      ...ex,
      sets: [...sets, newSet]
    };

    onUpdateWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    });
  };

  // Duplicate set
  const handleDuplicateSet = (exerciseIndex, setIndex) => {
    const ex = currentWorkout.exercises[exerciseIndex];
    const sourceSet = ex.sets[setIndex];
    const newSet = {
      ...sourceSet,
      id: `set_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      setNumber: ex.sets.length + 1,
      isCompleted: false
    };

    const updatedExercises = [...currentWorkout.exercises];
    updatedExercises[exerciseIndex] = {
      ...ex,
      sets: [...ex.sets, newSet]
    };

    onUpdateWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    });
  };

  // Update a single set field
  const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...currentWorkout.exercises];
    const ex = updatedExercises[exerciseIndex];
    const sets = [...ex.sets];
    sets[setIndex] = {
      ...sets[setIndex],
      [field]: value
    };
    updatedExercises[exerciseIndex] = {
      ...ex,
      sets
    };

    onUpdateWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    });
  };

  // Toggle set completed with optional rest timer trigger & sound
  const handleToggleComplete = (exerciseIndex, setIndex) => {
    const ex = currentWorkout.exercises[exerciseIndex];
    const currentSet = ex.sets[setIndex];
    const willBeCompleted = !currentSet.isCompleted;

    if (willBeCompleted) {
      sound.playSetComplete();
      // Check PR
      const history = getExerciseHistory(ex.exerciseId, allWorkouts, dateKey);
      const w = parseFloat(currentSet.weight) || 0;
      if (w > history.maxWeight && history.maxWeight > 0) {
        sound.playPRCelebration();
      }
      if (onStartRestTimer) {
        onStartRestTimer();
      }
    }

    handleUpdateSet(exerciseIndex, setIndex, 'isCompleted', willBeCompleted);
  };

  // Remove set
  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...currentWorkout.exercises];
    const ex = updatedExercises[exerciseIndex];
    const sets = ex.sets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
      ...s,
      setNumber: idx + 1
    }));
    updatedExercises[exerciseIndex] = {
      ...ex,
      sets
    };

    onUpdateWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    });
  };

  // Remove entire exercise
  const handleRemoveExercise = (exerciseIndex) => {
    if (confirm('Remove this exercise and all its sets?')) {
      const updatedExercises = currentWorkout.exercises.filter((_, idx) => idx !== exerciseIndex);
      onUpdateWorkout({
        ...currentWorkout,
        exercises: updatedExercises
      });
    }
  };

  // Day navigation helpers
  const shiftDate = (offsetDays) => {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offsetDays);
    onNavigateDate(formatDateKey(date));
  };

  const isToday = dateKey === formatDateKey(new Date());
  const stats = calculateWorkoutStats(currentWorkout);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col space-y-6">
      {/* Top Day Header & Date Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                {formatDisplayDate(dateKey)}
              </h2>
              {isToday && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {stats.totalExercises === 0
                ? 'No exercises logged for this date'
                : `${stats.totalExercises} exercises • ${stats.completedSets}/${stats.totalSets} sets done • ${stats.totalVolume.toLocaleString()} ${unit} total volume`}
            </p>
          </div>

          <button
            onClick={() => shiftDate(1)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!isToday && (
            <button
              onClick={() => onNavigateDate(formatDateKey(new Date()))}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium rounded-xl border border-zinc-700 transition"
            >
              Jump to Today
            </button>
          )}

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition flex items-center gap-1.5 ${
              showNotes || currentWorkout.notes
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-zinc-800 border-zinc-700/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>

          <button
            onClick={onOpenExerciseSelector}
            className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
        </div>
      </div>

      {/* Optional Workout Name & Notes */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Workout Name (e.g. Leg Day, Push Day, Heavy Bench)..."
          value={currentWorkout.name || ''}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3.5 py-2 bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 rounded-xl text-sm font-semibold text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:bg-zinc-800 transition"
        />

        {(showNotes || currentWorkout.notes) && (
          <textarea
            rows={2}
            placeholder="Session notes (energy level, sleep, aches, pump, motivation)..."
            value={currentWorkout.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="w-full px-3.5 py-2 bg-zinc-800/40 border border-zinc-800 rounded-xl text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition resize-none"
          />
        )}
      </div>

      {/* Exercises Container */}
      {currentWorkout.exercises.length === 0 ? (
        <div className="py-14 text-center border-2 border-dashed border-zinc-800/80 rounded-2xl p-8 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-400">
            <Dumbbell className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Exercises Logged Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Ready to hit the gym? Add your first exercise to start recording sets, reps, and weights.
            </p>
          </div>
          <button
            onClick={onOpenExerciseSelector}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Exercise to {formatDisplayDate(dateKey)}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {currentWorkout.exercises.map((exercise, exIdx) => {
            const history = getExerciseHistory(exercise.exerciseId, allWorkouts, dateKey);
            const sets = exercise.sets || [];

            return (
              <div
                key={exercise.exerciseId + '_' + exIdx}
                className="bg-zinc-850/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 transition hover:border-zinc-750"
              >
                {/* Exercise Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-zinc-800 text-emerald-400 rounded-xl">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          {exercise.exerciseName}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-zinc-800 text-zinc-400">
                          {exercise.category}
                        </span>
                      </div>

                      {/* Previous session stats & PR info */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                        {history.maxWeight > 0 && (
                          <span className="flex items-center gap-1 text-amber-400 font-medium">
                            <Trophy className="w-3 h-3" /> All-time PR: {history.maxWeight} {unit}
                          </span>
                        )}
                        {history.lastSessionSets && (
                          <span className="text-zinc-400">
                            Last session ({history.lastSessionDate}):{' '}
                            {history.lastSessionSets.map(s => `${s.weight}${unit}×${s.reps}`).slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Remove exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-zinc-500 uppercase tracking-wider border-b border-zinc-800/80 pb-2">
                        <th className="py-2 px-2 w-12 text-center">Set</th>
                        <th className="py-2 px-2 w-28">Type</th>
                        <th className="py-2 px-2 w-28">Weight ({unit})</th>
                        <th className="py-2 px-2 w-24">Reps</th>
                        <th className="py-2 px-2 w-16 text-center">Done</th>
                        <th className="py-2 px-2 w-16 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {sets.map((set, setIdx) => {
                        const isPRWeight = history.maxWeight > 0 && parseFloat(set.weight) > history.maxWeight;

                        return (
                          <tr
                            key={set.id || setIdx}
                            className={`group transition ${
                              set.isCompleted ? 'bg-emerald-950/15' : 'hover:bg-zinc-800/30'
                            }`}
                          >
                            {/* Set Number */}
                            <td className="py-2.5 px-2 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                                  set.isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {setIdx + 1}
                              </span>
                            </td>

                            {/* Set Type */}
                            <td className="py-2.5 px-2">
                              <select
                                value={set.type || 'normal'}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'type', e.target.value)}
                                className="px-2 py-1.5 bg-zinc-800 border border-zinc-700/60 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                              >
                                <option value="normal">Normal</option>
                                <option value="warmup">Warmup</option>
                                <option value="drop">Drop Set</option>
                                <option value="failure">Failure</option>
                              </select>
                            </td>

                            {/* Weight */}
                            <td className="py-2.5 px-2">
                              <div className="relative flex items-center">
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  placeholder="0"
                                  value={set.weight === 0 ? '0' : (set.weight || '')}
                                  onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', e.target.value)}
                                  className={`w-24 px-2.5 py-1.5 bg-zinc-800 border rounded-lg text-xs font-semibold text-white focus:outline-none transition ${
                                    isPRWeight
                                      ? 'border-amber-500/80 ring-1 ring-amber-500/50 bg-amber-500/10'
                                      : 'border-zinc-700/60 focus:border-emerald-500'
                                  }`}
                                />
                                {isPRWeight && (
                                  <span
                                    title="New Personal Record!"
                                    className="ml-1.5 text-amber-400 font-bold text-[10px] flex items-center gap-0.5"
                                  >
                                    <Sparkles className="w-3 h-3" /> PR
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Reps */}
                            <td className="py-2.5 px-2">
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={set.reps === 0 ? '0' : (set.reps || '')}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                                className="w-20 px-2.5 py-1.5 bg-zinc-800 border border-zinc-700/60 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                              />
                            </td>

                            {/* Complete Checkbox */}
                            <td className="py-2.5 px-2 text-center">
                              <button
                                onClick={() => handleToggleComplete(exIdx, setIdx)}
                                className={`p-1 rounded-lg transition ${
                                  set.isCompleted
                                    ? 'text-emerald-400 hover:text-emerald-300'
                                    : 'text-zinc-600 hover:text-zinc-400'
                                }`}
                                title={set.isCompleted ? 'Completed' : 'Mark done & rest'}
                              >
                                {set.isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-2 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => handleDuplicateSet(exIdx, setIdx)}
                                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                                  title="Duplicate Set"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveSet(exIdx, setIdx)}
                                  className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-red-500/10"
                                  title="Delete Set"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Set Button */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleAddSet(exIdx)}
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-750 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add Set</span>
                  </button>

                  <div className="text-xs text-zinc-400">
                    Volume:{' '}
                    <span className="font-semibold text-zinc-200">
                      {sets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0), 0)}{' '}
                      {unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Another Exercise Button at bottom */}
          <div className="text-center pt-2">
            <button
              onClick={onOpenExerciseSelector}
              className="px-5 py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/80 text-emerald-400 text-xs font-bold rounded-xl shadow transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Another Exercise
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

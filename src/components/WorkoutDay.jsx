import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Circle,
  Dumbbell,
  Sparkles,
  Trophy,
  ChevronLeft,
  ChevronRight,
  FileText
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
  onGoToNotes,
  unit = 'kg'
}) {
  const [showNotes, setShowNotes] = useState(false);

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

  const handleToggleComplete = (exerciseIndex, setIndex) => {
    const ex = currentWorkout.exercises[exerciseIndex];
    const currentSet = ex.sets[setIndex];
    const willBeCompleted = !currentSet.isCompleted;

    if (willBeCompleted) {
      sound.playSetComplete();
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

  const handleRemoveExercise = (exerciseIndex) => {
    if (confirm('Remove this exercise?')) {
      const updatedExercises = currentWorkout.exercises.filter((_, idx) => idx !== exerciseIndex);
      onUpdateWorkout({
        ...currentWorkout,
        exercises: updatedExercises
      });
    }
  };

  const shiftDate = (offsetDays) => {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offsetDays);
    onNavigateDate(formatDateKey(date));
  };

  const isToday = dateKey === formatDateKey(new Date());
  const stats = calculateWorkoutStats(currentWorkout);

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-6">
      {/* Date Header & Quick Navigation */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          {/* Previous Day */}
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition flex-shrink-0"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Date Center */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                {formatDisplayDate(dateKey)}
              </h2>
              {isToday && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Today
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {stats.totalExercises === 0
                ? 'No exercises logged'
                : `${stats.totalExercises} exercises • ${stats.completedSets}/${stats.totalSets} sets done • ${stats.totalVolume.toLocaleString()} ${unit}`}
            </p>
          </div>

          {/* Next Day */}
          <button
            onClick={() => shiftDate(1)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition flex-shrink-0"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Action pills under date */}
        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-zinc-800/80">
          <input
            type="text"
            placeholder="Workout Title (e.g. Push Day, Leg Day)..."
            value={currentWorkout.name || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="flex-1 min-w-0 px-3 py-1.5 bg-zinc-850 border border-zinc-750 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />

          {!isToday && (
            <button
              onClick={() => onNavigateDate(formatDateKey(new Date()))}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium rounded-xl border border-zinc-750 transition flex-shrink-0"
            >
              Today
            </button>
          )}

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-xl border transition flex items-center gap-1.5 flex-shrink-0 ${
              showNotes || currentWorkout.notes
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-zinc-800 border-zinc-750 text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notes</span>
          </button>
        </div>

        {/* Collapsible notes */}
        {(showNotes || currentWorkout.notes) && (
          <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Session Notes</span>
              {onGoToNotes && (
                <button
                  onClick={() => onGoToNotes(dateKey)}
                  className="text-amber-400 hover:underline text-[11px]"
                >
                  Open in Notes tab →
                </button>
              )}
            </div>
            <textarea
              rows={2}
              placeholder="Session notes (energy level, aches, motivation)..."
              value={currentWorkout.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-850 border border-zinc-750 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>
        )}
      </div>

      {/* Exercises List */}
      {currentWorkout.exercises.length === 0 ? (
        <div className="py-12 px-4 text-center bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-2xl shadow-xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-850 border border-zinc-750 flex items-center justify-center text-emerald-400">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Exercises Logged Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              Tap the button below to add your first exercise and record your sets & reps.
            </p>
          </div>
          <button
            onClick={onOpenExerciseSelector}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentWorkout.exercises.map((exercise, exIdx) => {
            const history = getExerciseHistory(exercise.exerciseId, allWorkouts, dateKey);
            const sets = exercise.sets || [];

            return (
              <div
                key={exercise.exerciseId + '_' + exIdx}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3"
              >
                {/* Exercise Header */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl flex-shrink-0">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">
                          {exercise.exerciseName}
                        </h3>
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-zinc-800 text-zinc-400">
                          {exercise.category}
                        </span>
                      </div>
                      {history.maxWeight > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium mt-0.5">
                          <Trophy className="w-3 h-3" /> PR: {history.maxWeight} {unit}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveExercise(exIdx)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Remove exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sets Table - Mobile Friendly */}
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                  <table className="w-full text-left text-xs min-w-[280px]">
                    <thead>
                      <tr className="text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-800/80">
                        <th className="py-1.5 px-2 w-10 text-center">Set</th>
                        <th className="py-1.5 px-2 w-24">Type</th>
                        <th className="py-1.5 px-2">{unit.toUpperCase()}</th>
                        <th className="py-1.5 px-2">Reps</th>
                        <th className="py-1.5 px-2 w-12 text-center">Done</th>
                        <th className="py-1.5 px-1 w-12 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {sets.map((set, setIdx) => {
                        const isPRWeight = history.maxWeight > 0 && parseFloat(set.weight) > history.maxWeight;

                        return (
                          <tr
                            key={set.id || setIdx}
                            className={`transition ${
                              set.isCompleted ? 'bg-emerald-950/20' : 'hover:bg-zinc-850/50'
                            }`}
                          >
                            {/* Set Number */}
                            <td className="py-2 px-2 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md text-xs font-bold ${
                                  set.isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {setIdx + 1}
                              </span>
                            </td>

                            {/* Set Type */}
                            <td className="py-2 px-2">
                              <select
                                value={set.type || 'normal'}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'type', e.target.value)}
                                className="w-full px-1.5 py-1 bg-zinc-850 border border-zinc-750 rounded-lg text-[11px] text-zinc-300 focus:outline-none focus:border-emerald-500"
                              >
                                <option value="normal">Normal</option>
                                <option value="warmup">Warmup</option>
                                <option value="drop">Drop</option>
                                <option value="failure">Failure</option>
                              </select>
                            </td>

                            {/* Weight */}
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                placeholder="0"
                                value={set.weight === 0 ? '0' : (set.weight || '')}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', e.target.value)}
                                className={`w-16 sm:w-20 px-2 py-1 bg-zinc-850 border rounded-lg text-xs font-semibold text-white focus:outline-none text-center ${
                                  isPRWeight
                                    ? 'border-amber-500/80 bg-amber-500/10 text-amber-300'
                                    : 'border-zinc-750 focus:border-emerald-500'
                                }`}
                              />
                            </td>

                            {/* Reps */}
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={set.reps === 0 ? '0' : (set.reps || '')}
                                onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                                className="w-14 sm:w-16 px-2 py-1 bg-zinc-850 border border-zinc-750 rounded-lg text-xs font-semibold text-white focus:outline-none text-center focus:border-emerald-500"
                              />
                            </td>

                            {/* Check complete */}
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => handleToggleComplete(exIdx, setIdx)}
                                className={`p-1 rounded-lg transition active:scale-90 ${
                                  set.isCompleted
                                    ? 'text-emerald-400'
                                    : 'text-zinc-600 hover:text-zinc-400'
                                }`}
                                title={set.isCompleted ? 'Completed' : 'Mark done'}
                              >
                                {set.isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>
                            </td>

                            {/* Actions: Duplicate & Delete */}
                            <td className="py-2 px-1 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleDuplicateSet(exIdx, setIdx)}
                                  className="p-1 text-zinc-500 hover:text-zinc-200 rounded"
                                  title="Duplicate set"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveSet(exIdx, setIdx)}
                                  className="p-1 text-zinc-500 hover:text-red-400 rounded"
                                  title="Delete set"
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

                {/* Add Set Footer */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleAddSet(exIdx)}
                    className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add Set</span>
                  </button>

                  <span className="text-xs text-zinc-400 font-mono">
                    {sets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0), 0)} {unit}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Bottom Add Exercise Button */}
          <div className="text-center pt-2">
            <button
              onClick={onOpenExerciseSelector}
              className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 text-emerald-400 font-bold rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Plus className="w-4 h-4" /> Add Another Exercise
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

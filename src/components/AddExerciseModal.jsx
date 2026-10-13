import React, { useState } from 'react';
import { X, Plus, Dumbbell, Sparkles, Check } from 'lucide-react';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../constants/exercises';
import { getCustomExercises, saveCustomExercises } from '../utils/storage';

export default function AddExerciseModal({ isOpen, onClose, onExerciseCreated }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Chest');
  const [equipment, setEquipment] = useState('Barbell');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter an exercise name.');
      return;
    }

    const newExercise = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmed,
      category,
      equipment,
      notes: notes.trim(),
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const existingCustom = getCustomExercises();
    // Check if name already exists
    if (existingCustom.some(ex => ex.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('An exercise with this name already exists in your custom list.');
      return;
    }

    const updated = [newExercise, ...existingCustom];
    saveCustomExercises(updated);

    setName('');
    setNotes('');
    setError('');
    
    if (onExerciseCreated) {
      onExerciseCreated(newExercise);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Exercise</h3>
              <p className="text-xs text-zinc-400">Add custom movement to your gym library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Exercise Name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Incline Smith Machine Press, Hip Thrust"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Target Muscle
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                {MUSCLE_GROUPS.filter(g => g !== 'All').map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Equipment
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                {EQUIPMENT_TYPES.map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Form Notes / Cues (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 2 second eccentric, slow squeeze at contraction"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> Save Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

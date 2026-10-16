import React, { useState } from 'react';
import { X, Settings, Download, Upload, Trash2, LogOut } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onSignOut,
  data,
  onImportData,
  onClearData,
}) {
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), ...data }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-workout-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const parsed = JSON.parse(content);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Backup file must contain a JSON object.');
        onImportData(parsed);
        setImportStatus('Data imported and saved to your account.');
        setTimeout(() => setImportStatus(''), 3000);
      } catch {
        setImportStatus('Failed to read backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL workout history? This cannot be undone.')) {
      onClearData();
      onClose();
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-800 text-zinc-300 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">App Settings & Data</h3>
              <p className="text-xs text-zinc-400">Preferences, backup, and workout units</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {importStatus && (
            <div className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
              importStatus.includes('failed') || importStatus.includes('Failed')
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              <span>{importStatus}</span>
            </div>
          )}

          {/* Unit selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Weight Unit
            </label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-850 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, unit: 'kg' })}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  settings.unit === 'kg'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Kilograms (kg)
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, unit: 'lbs' })}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  settings.unit === 'lbs'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Pounds (lbs)
              </button>
            </div>
          </div>

          {/* Rest Timer Default */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Default Rest Timer
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[60, 90, 120, 180].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, restTimerSeconds: sec })}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    settings.restTimerSeconds === sec
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Data Management & Backup
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="p-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export JSON</span>
              </button>

              <label className="p-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleClearAll}
                className="text-xs text-red-400/80 hover:text-red-400 flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Workouts</span>
              </button>
              <button onClick={onSignOut} className="settings-signout">
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, Minus, Volume2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { sound } from '../utils/audio';

export default function RestTimer({ initialSeconds = 90, onFinish, isOpen, setIsOpen }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            sound.playTimerFinished();
            if (onFinish) onFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onFinish]);

  const startTimerWith = (seconds) => {
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsRunning(true);
    setIsOpen(true);
  };

  const togglePlayPause = () => {
    if (timeLeft === 0) {
      setTimeLeft(totalTime || 90);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTime || 90);
  };

  const adjustTime = (delta) => {
    setTimeLeft((prev) => Math.max(0, prev + delta));
    setTotalTime((prev) => Math.max(0, prev + delta));
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-20 right-4 sm:right-6 z-40 bg-zinc-800 hover:bg-zinc-750 text-amber-400 border border-amber-500/40 p-3 rounded-full shadow-2xl flex items-center gap-2 group transition-all"
        title="Open Rest Timer"
      >
        <Timer className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-semibold text-zinc-100 pr-1">Rest Timer</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 sm:right-6 z-40 bg-zinc-900 border border-zinc-700/80 shadow-2xl rounded-2xl p-2.5 flex items-center gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMinimized(false)}>
          <div className={`p-2 rounded-xl ${isRunning ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}>
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-zinc-400 leading-none">Rest</div>
            <div className={`text-base font-bold font-mono ${timeLeft === 0 ? 'text-emerald-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <button
          onClick={togglePlayPause}
          className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 text-zinc-400 hover:text-white"
          title="Expand"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-40 w-80 max-w-[calc(100vw-2rem)] bg-zinc-900/95 border border-zinc-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
            <Timer className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-zinc-100">Rest Timer</span>
          {timeLeft === 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium animate-pulse">
              Time to lift!
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-zinc-400 hover:text-zinc-200 transition"
            title="Minimize"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsOpen(false); setIsRunning(false); }}
            className="p-1 text-zinc-400 hover:text-zinc-200 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Display */}
      <div className="py-4 text-center">
        <div className="relative inline-flex items-center justify-center">
          <div className={`text-4xl font-extrabold font-mono tracking-tight ${timeLeft === 0 ? 'text-emerald-400 animate-bounce' : isRunning ? 'text-amber-400' : 'text-zinc-100'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${timeLeft === 0 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          onClick={() => adjustTime(-15)}
          className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition"
          title="-15s"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlayPause}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition ${
            isRunning
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> {timeLeft === 0 ? 'Restart' : 'Start'}
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => adjustTime(30)}
          className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition"
          title="+30s"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-zinc-800/80">
        {[60, 90, 120, 180].map((sec) => (
          <button
            key={sec}
            onClick={() => startTimerWith(sec)}
            className={`py-1 text-xs rounded-lg font-medium transition ${
              totalTime === sec && isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-750 hover:text-zinc-200'
            }`}
          >
            {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
          </button>
        ))}
      </div>
    </div>
  );
}

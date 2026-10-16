import React from 'react';
import { Dumbbell, Calendar, FileText, BookOpen } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, hasTodayWorkout = false }) {
  const tabs = [
    {
      id: 'workout',
      label: 'Workout',
      icon: Dumbbell,
      badge: hasTodayWorkout
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText
    },
    {
      id: 'exercises',
      label: 'Exercises',
      icon: BookOpen
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 sm:py-2">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {tab.badge && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-zinc-950" />
                )}
              </div>
              <span className="text-[11px] sm:text-xs tracking-tight mt-0.5 font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

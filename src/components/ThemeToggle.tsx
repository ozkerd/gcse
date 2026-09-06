'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ className = '', showLabel = true }: { className?: string; showLabel?: boolean }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('gcse_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gcse_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gcse_theme', 'dark');
      setIsDark(true);
    }
  };

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 hover:border-slate-600'
          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-300'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          {showLabel && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20 shrink-0" />
          {showLabel && <span>Dark Mode</span>}
        </>
      )}
    </button>
  );
};

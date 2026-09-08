'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Target, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { UserStore } from '@/lib/user-store';

interface DailyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMinutes: number;
  currentGoal: number;
  onGoalSaved?: (newGoal: number) => void;
}

export function DailyGoalModal({
  isOpen,
  onClose,
  currentMinutes,
  currentGoal,
  onGoalSaved,
}: DailyGoalModalProps) {
  const [goal, setGoal] = useState<number>(currentGoal || 30);
  const [customInput, setCustomInput] = useState<string>(String(currentGoal || 30));
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setGoal(currentGoal || 30);
    setCustomInput(String(currentGoal || 30));
  }, [currentGoal, isOpen]);

  if (!isOpen) return null;

  const percent = Math.min(100, Math.round((currentMinutes / Math.max(1, goal)) * 100));
  const presets = [15, 30, 45, 60, 90];

  const handleSelectPreset = (mins: number) => {
    setGoal(mins);
    setCustomInput(String(mins));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setGoal(num);
    }
  };

  const handleSave = () => {
    const finalGoal = Math.max(5, Math.min(300, goal));
    UserStore.setDailyStudyGoal(finalGoal);
    if (onGoalSaved) onGoalSaved(finalGoal);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleAddManualTime = (minsToAdd: number) => {
    UserStore.addStudyMinutes(minsToAdd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Daily Study Time & Target
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track active revision minutes and set consistent GCSE preparation goals.
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/60 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
              Today's Achievement
            </span>
            <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
              {percent}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percent >= 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>
              Studied: <strong className="text-slate-900 dark:text-slate-100">{currentMinutes} mins</strong>
            </span>
            <span>
              Goal: <strong className="text-slate-900 dark:text-slate-100">{goal} mins</strong>
            </span>
          </div>

          {percent >= 100 ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 pt-1">
              <Award className="w-4 h-4" />
              <span>Goal reached for today! Outstanding revision discipline.</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              {Math.max(0, goal - currentMinutes)} minutes remaining to meet today's revision target.
            </p>
          )}
        </div>

        {/* Preset Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Select Daily Goal Preset</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((mins) => {
              const isSelected = goal === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleSelectPreset(mins)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  <span>{mins}</span>
                  <span className="text-[10px] opacity-80 font-normal">mins</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Goal Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Or Set Custom Target (Minutes)
          </label>
          <div className="relative">
            <input
              type="number"
              min={5}
              max={360}
              value={customInput}
              onChange={handleCustomChange}
              placeholder="e.g. 40"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
              minutes/day
            </span>
          </div>
        </div>

        {/* Offline / Textbook Study Credit */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Studied offline/textbook?</span>
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleAddManualTime(15)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition-colors"
            >
              +15m
            </button>
            <button
              onClick={() => handleAddManualTime(30)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition-colors"
            >
              +30m
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Daily Goal</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

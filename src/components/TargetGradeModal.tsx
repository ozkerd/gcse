'use client';

import React, { useState, useEffect } from 'react';
import { X, Award, GraduationCap, Check, Sparkles } from 'lucide-react';
import { UserStore, UserSession } from '@/lib/user-store';

interface TargetGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
}

export const TargetGradeModal: React.FC<TargetGradeModalProps> = ({
  isOpen,
  onClose,
  currentSession,
}) => {
  const [targetGrade, setTargetGrade] = useState<number>(currentSession.targetGrade || 8);
  const [schoolYear, setSchoolYear] = useState<number>(currentSession.schoolYear || 10);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTargetGrade(currentSession.targetGrade || 8);
      setSchoolYear(currentSession.schoolYear || 10);
      setIsSaved(false);
    }
  }, [isOpen, currentSession]);

  if (!isOpen) return null;

  const grades = [
    { grade: 9, label: 'Grade 9', desc: 'Exceptional (A**)', color: 'from-amber-500 to-yellow-500' },
    { grade: 8, label: 'Grade 8', desc: 'Distinction (A*)', color: 'from-purple-600 to-indigo-600' },
    { grade: 7, label: 'Grade 7', desc: 'Merit (A)', color: 'from-indigo-600 to-blue-600' },
    { grade: 6, label: 'Grade 6', desc: 'High Pass (B+)', color: 'from-blue-600 to-cyan-600' },
    { grade: 5, label: 'Grade 5', desc: 'Strong Pass (B/C)', color: 'from-emerald-600 to-teal-600' },
    { grade: 4, label: 'Grade 4', desc: 'Standard Pass (C)', color: 'from-slate-600 to-slate-700' },
  ];

  const years = [
    { year: 8, label: 'Year 8', desc: 'Foundation' },
    { year: 9, label: 'Year 9', desc: 'Early GCSE' },
    { year: 10, label: 'Year 10', desc: 'GCSE Year 1' },
    { year: 11, label: 'Year 11', desc: 'Exam Year' },
  ];

  const handleSave = () => {
    const session = UserStore.getSession();
    UserStore.saveSession({
      ...session,
      targetGrade,
      schoolYear,
    });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Target Grade & School Year
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your GCSE target grade and academic school year anytime.
            </p>
          </div>
        </div>

        {/* School Year Selection */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            School Year
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {years.map((y) => {
              const isSelected = schoolYear === y.year;
              return (
                <button
                  key={y.year}
                  type="button"
                  onClick={() => setSchoolYear(y.year)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 dark:border-purple-600 text-purple-950 dark:text-purple-200 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="text-sm font-extrabold">{y.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{y.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Grade Selection */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Target GCSE Grade
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {grades.map((g) => {
              const isSelected = targetGrade === g.grade;
              return (
                <button
                  key={g.grade}
                  type="button"
                  onClick={() => setTargetGrade(g.grade)}
                  className={`p-3 rounded-2xl border text-left relative transition-all ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <div className="text-base font-black text-slate-900 dark:text-slate-100">
                    Grade {g.grade}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                    {g.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

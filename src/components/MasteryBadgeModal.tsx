'use client';

import React, { useEffect, useState } from 'react';
import { GCSE_TOPICS, GCSE_SUBJECTS } from '@/lib/curriculum/gcse-data';
import { UserStore, UserSession } from '@/lib/user-store';

interface MasteryEventDetail {
  topicId: string;
  gradeLevel: number;
  topicRecord?: any;
}

export function MasteryBadgeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [detail, setDetail] = useState<MasteryEventDetail | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    setSession(UserStore.getSession());

    const handleMastery = (e: Event) => {
      const customEvent = e as CustomEvent<MasteryEventDetail>;
      if (customEvent.detail) {
        setDetail(customEvent.detail);
        setIsOpen(true);
      }
    };

    window.addEventListener('gcse_topic_mastered', handleMastery);
    return () => {
      window.removeEventListener('gcse_topic_mastered', handleMastery);
    };
  }, []);

  if (!isOpen || !detail) return null;

  // Find matching topic or format string nicely
  const topicMatch = GCSE_TOPICS.find((t) => t.id === detail.topicId);
  const topicName = topicMatch ? topicMatch.topicName : detail.topicId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const subjectMatch = topicMatch ? GCSE_SUBJECTS.find((s) => s.id === topicMatch.subjectId) : null;
  const parentEmail = session?.parentEmail || (session?.role === 'parent' ? session?.email : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-amber-200 text-center relative overflow-hidden transform transition-all scale-100">
        
        {/* Glow background accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Trophy Badge Icon */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 shadow-lg shadow-amber-300/50 ring-8 ring-amber-100 animate-bounce">
          <span className="text-5xl">🏆</span>
          <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            100%
          </div>
        </div>

        {/* Header */}
        <div className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wider px-3 py-1 rounded-full uppercase mb-2">
          Mastery Reward Unlocked
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Topic 100% Mastered!
        </h2>

        <p className="text-sm text-slate-600 mt-1 font-medium">
          Congratulations! You have reached full mastery status in:
        </p>

        {/* Topic details card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
              {subjectMatch ? subjectMatch.name : 'GCSE Topic'}
            </span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Working Grade {detail.gradeLevel}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mt-1">
            {topicName}
          </h3>

          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
            <span>Mastery Score: <strong className="text-emerald-600">100%</strong></span>
            <span>Badge: <strong className="text-amber-600">Gold Trophy</strong></span>
          </div>
        </div>

        {/* Parent Email Notification Banner */}
        {parentEmail ? (
          <div className="mb-6 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-start space-x-2 text-left">
            <span className="text-base leading-none">📧</span>
            <div>
              <p className="font-semibold">Parent Notification Sent!</p>
              <p className="text-indigo-700 text-[11px] mt-0.5">
                An email alert was dispatched to <strong>{parentEmail}</strong> from <code>noreply@btpsec.com</code> celebrating your achievement.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start space-x-2 text-left">
            <span className="text-base leading-none">💡</span>
            <div>
              <p className="font-medium">Tip: Add Parent Email in Sign-up</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Add your parent email in settings to automatically send them weekly reports and mastery celebrations!
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            Keep Practicing 🚀
          </button>
          
          <button
            onClick={() => {
              setIsOpen(false);
              if (typeof window !== 'undefined') {
                window.location.href = '/diagnostic';
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
          >
            View Mastery Progress 📊
          </button>
        </div>

      </div>
    </div>
  );
}

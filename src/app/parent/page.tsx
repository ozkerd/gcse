'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle2, Award, TrendingUp, BookOpen, Bell, UserCheck } from 'lucide-react';
import { UserStore, UserSession, DailyStats } from '@/lib/user-store';

export default function ParentPortalPage() {
  const [session, setSession] = useState<UserSession>({
    role: 'guest',
    name: 'Guest Student',
    email: 'guest@primerllm.com',
    targetGrade: 9,
  });

  const [dailyStats, setDailyStats] = useState<DailyStats>({
    date: new Date().toISOString().split('T')[0],
    questionsAttemptedToday: 0,
    questionsCorrectToday: 0,
    streakDays: 4,
  });

  const [notificationFreq, setNotificationFreq] = useState<'daily' | 'weekly' | 'off'>('daily');
  const [parentEmail, setParentEmail] = useState<string>('parent@primerllm.com');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    setSession(UserStore.getSession());
    setDailyStats(UserStore.getDailyStats());

    if (UserStore.getSession().email !== 'guest@primerllm.com') {
      setParentEmail(UserStore.getSession().email);
    }

    const handleUserUpdate = () => setSession(UserStore.getSession());
    const handleStatsUpdate = () => setDailyStats(UserStore.getDailyStats());

    window.addEventListener('gcse_user_updated', handleUserUpdate);
    window.addEventListener('gcse_stats_updated', handleStatsUpdate);

    return () => {
      window.removeEventListener('gcse_user_updated', handleUserUpdate);
      window.removeEventListener('gcse_stats_updated', handleStatsUpdate);
    };
  }, []);

  const studentDisplayName = session.studentName || (session.role === 'student' ? session.name : 'Alex (Student)');
  const targetGrade = session.targetGrade;
  const currentGrade = 6.5;

  const subtopicPercentages = [
    { code: 'M-ALG-1.1', name: 'Quadratic Factoring', topic: 'Algebra', percentage: 88, status: 'Strong' },
    { code: 'M-ALG-1.2', name: 'Simultaneous Equations', topic: 'Algebra', percentage: 42, status: 'Needs Improvement' },
    { code: 'P-ENG-1.1', name: 'Specific Heat Capacity', topic: 'Energy', percentage: 90, status: 'Mastered' },
    { code: 'CS-SYS-1.1', name: 'CPU Registers (PC, MAR)', topic: 'Systems', percentage: 75, status: 'Good' },
  ];

  const mockExamHistory = [
    { date: '2026-09-04', subject: 'GCSE Maths (Edexcel Paper 1)', score: '64/80 (80%)', grade: 8, timeMinutes: 85 },
    { date: '2026-08-28', subject: 'GCSE Physics (AQA Paper 1)', score: '52/70 (74%)', grade: 7, timeMinutes: 60 },
  ];

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const accuracyPercentage = dailyStats.questionsAttemptedToday > 0
    ? Math.round((dailyStats.questionsCorrectToday / dailyStats.questionsAttemptedToday) * 100)
    : 100;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-300">
            <Users className="w-4 h-4 text-yellow-300" />
            Parent Portal & Progress Monitor
          </div>
          <h1 className="text-2xl font-extrabold text-white">{studentDisplayName} - Progress Report</h1>
          <p className="text-slate-300 text-sm">Real-time breakdown of daily revision time, question accuracy, and subtopic mastery.</p>
        </div>

        <div className="bg-white/10 border border-white/20 p-3.5 rounded-xl text-center shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-indigo-200 font-bold block">Estimated GCSE Grade</span>
          <span className="text-2xl font-extrabold text-white">Grade {currentGrade}</span>
          <span className="text-xs text-indigo-300 block font-semibold">Target: Grade {targetGrade}</span>
        </div>
      </div>

      {/* Account Mode Alert */}
      {session.role === 'parent' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Signed in as Parent: {session.name} ({session.email}) — Monitoring {studentDisplayName}</span>
          </div>
        </div>
      )}

      {/* Daily Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Study Time Today</span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{dailyStats.questionsAttemptedToday * 3} Mins</div>
          <p className="text-xs text-slate-500 mt-2">Estimated practice time</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Questions Solved Today</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{dailyStats.questionsAttemptedToday} Questions</div>
          <p className="text-xs text-emerald-600 font-semibold mt-2">Accuracy: {accuracyPercentage}%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Study Streak</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{dailyStats.streakDays} Days 🔥</div>
          <p className="text-xs text-slate-500 mt-2">Consistent daily revision discipline</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Mock Exam</span>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">Grade 8</div>
          <p className="text-xs text-purple-600 font-semibold mt-2">Maths Paper 1 (80%)</p>
        </div>

      </div>

      {/* Detailed Sub-topic Breakdown & Category Percentage */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Sub-topic Mastery Breakdown
          </h2>
          <p className="text-slate-500 text-sm">Granular performance indicators across all tested topic specifications.</p>
        </div>

        <div className="space-y-4">
          {subtopicPercentages.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono">{item.code}</span>
                  <span className="text-slate-900 text-sm font-bold">{item.name} ({item.topic})</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] ${
                  item.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' :
                  item.percentage >= 60 ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {item.percentage}% - {item.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full ${
                    item.percentage >= 80 ? 'bg-emerald-500' :
                    item.percentage >= 60 ? 'bg-indigo-600' : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Exam Results History */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Mock GCSE Exam History
        </h2>

        <div className="space-y-3">
          {mockExamHistory.map((exam, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/30">
              <div>
                <span className="text-xs text-slate-500 font-mono">{exam.date}</span>
                <h3 className="font-bold text-slate-900 text-sm">{exam.subject}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">{exam.score}</span>
                  <span className="text-xs text-slate-500 block">{exam.timeMinutes} mins</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                  G{exam.grade}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Email Notification Preferences Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Parent Email Notification Settings</h2>
            <p className="text-slate-500 text-sm">Receive automated daily or weekly progress digests directly to your email inbox.</p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4 pt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent Email Address</label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                placeholder="parent@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notification Frequency</label>
              <select
                value={notificationFreq}
                onChange={(e) => setNotificationFreq(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="daily">Daily Digest (Daily Practice & Accuracy Summary)</option>
                <option value="weekly">Weekly Report (Every Sunday)</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Notification preferences saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}


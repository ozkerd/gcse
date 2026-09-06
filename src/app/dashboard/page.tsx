'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Sparkles, TrendingUp, Calendar, AlertCircle, ArrowRight, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { AdaptiveEngine } from '@/lib/adaptive/engine';
import { UserStore, UserSession, DailyStats } from '@/lib/user-store';
import { SearchBar } from '@/components/SearchBar';
import { QuickAssessmentModal } from '@/components/QuickAssessmentModal';

export default function Dashboard() {
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
    streakDays: 0,
  });

  const [estimatedGrade, setEstimatedGrade] = useState<number>(6.5);
  const [isQuickAssessmentOpen, setIsQuickAssessmentOpen] = useState(false);

  useEffect(() => {
    setSession(UserStore.getSession());
    setDailyStats(UserStore.getDailyStats());

    const handleUserUpdate = () => setSession(UserStore.getSession());
    const handleStatsUpdate = () => {
      setDailyStats(UserStore.getDailyStats());
      const masteries = Object.values(UserStore.getTopicMasteries());
      if (masteries.length > 0) {
        const est = AdaptiveEngine.calculateEstimatedGrade(masteries);
        setEstimatedGrade(est);
      }
    };

    window.addEventListener('gcse_user_updated', handleUserUpdate);
    window.addEventListener('gcse_stats_updated', handleStatsUpdate);

    return () => {
      window.removeEventListener('gcse_user_updated', handleUserUpdate);
      window.removeEventListener('gcse_stats_updated', handleStatsUpdate);
    };
  }, []);

  const handleTargetGradeChange = (newGrade: number) => {
    UserStore.setTargetGrade(newGrade);
  };

  const mockMasteries = [
    { topicId: 'm-alg-1', masteryScore: 78.0, totalAttempted: 18, totalCorrect: 14, lastAttemptAt: '2026-09-05' },
    { topicId: 'm-alg-2', masteryScore: 42.0, totalAttempted: 10, totalCorrect: 4, lastAttemptAt: '2026-09-04' },
    { topicId: 'p-eng-1', masteryScore: 85.0, totalAttempted: 12, totalCorrect: 10, lastAttemptAt: '2026-09-06' },
    { topicId: 'cs-sys-1', masteryScore: 90.0, totalAttempted: 15, totalCorrect: 14, lastAttemptAt: '2026-09-06' },
  ];

  const recommendedTopics = AdaptiveEngine.getRecommendedTopics('maths', mockMasteries, session.targetGrade);

  const targetDailyQuestions = 15;
  const progressPercent = Math.min(100, Math.round((dailyStats.questionsAttemptedToday / targetDailyQuestions) * 100));

  return (
    <div className="space-y-8">
      
      {/* Header & Google Search */}
      <div className="flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Student Dashboard & Progress</h1>
            <p className="text-slate-500 text-sm mt-1">
              {session.role === 'guest'
                ? 'Learning in Guest Mode. Your progress is saved dynamically via cookies.'
                : `Welcome back, ${session.name}! View daily goals and track your path to Grade ${session.targetGrade}.`}
            </p>
          </div>

          {/* Target Grade Selector */}
          <div className="flex items-center gap-4 bg-indigo-50/80 border border-indigo-100 p-3 rounded-2xl shrink-0">
            <Award className="w-6 h-6 text-indigo-600" />
            <div>
              <label className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wider">Target GCSE Grade</label>
              <select
                value={session.targetGrade}
                onChange={(e) => handleTargetGradeChange(Number(e.target.value))}
                className="bg-white border border-indigo-200 text-indigo-950 font-bold text-sm rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500"
              >
                {[4, 5, 6, 7, 8, 9].map(g => (
                  <option key={g} value={g}>Grade {g} (Target)</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search Bar & Quick Assessment CTA */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
          <div className="w-full">
            <SearchBar placeholder="Search any topic (e.g. Macbeth, Quadratic, Cold War, Mitosis, Energy)..." />
          </div>
          <button
            onClick={() => setIsQuickAssessmentOpen(true)}
            className="w-full md:w-auto shrink-0 px-5 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>5-Question Test</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Current Grade</span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">Grade {estimatedGrade}</div>
          <p className="text-xs text-indigo-600 font-semibold mt-2">
            {(session.targetGrade - estimatedGrade) > 0 
              ? `${(session.targetGrade - estimatedGrade).toFixed(1)} Grades remaining to Target`
              : 'Target Grade achieved!'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Study Streak</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{dailyStats.streakDays} Days 🔥</div>
          <p className="text-xs text-slate-500 mt-2">Active daily momentum tracking</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Questions Solved Today</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {dailyStats.questionsAttemptedToday} / {targetDailyQuestions}
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-2">
            {progressPercent}% of daily goal completed
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Days Until GCSE Exams</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">248 Days</div>
          <p className="text-xs text-slate-500 mt-2">May/June Exam Season</p>
        </div>

      </div>

      {/* Recommended Focus Area & Weakness Alert */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left: Recommended Practice */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-2xl p-6 shadow-lg border border-indigo-800">
          <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            AI Adaptive Recommendation
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Recommended Focus Topic Today</h2>
          <p className="text-slate-300 text-sm mb-6">
            Error analysis from recent practice: <strong>Quadratic Equations & Factoring</strong> requires mastery reinforcement for Target Grade {session.targetGrade}.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/practice?topicId=m-alg-1"
              className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-slate-100 font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-md"
            >
              <span>Start Adaptive Practice</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setIsQuickAssessmentOpen(true)}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-3 rounded-xl text-sm transition-all border border-white/20"
            >
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>Quick 5-Question Test</span>
            </button>
          </div>
        </div>

        {/* Right: Weakness Radar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Identified Topic Gaps
            </h3>
            
            <div className="space-y-3">
              {recommendedTopics.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                    <span>{rec.topicId === 'm-alg-2' ? 'Simultaneous Equations' : 'Quadratic Equations'}</span>
                    <span className="text-amber-600">Priority: High</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/topics"
            className="mt-4 text-center py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Explore Full Topic Matrix →
          </Link>
        </div>

      </div>

      {/* Quick Assessment Modal */}
      <QuickAssessmentModal
        isOpen={isQuickAssessmentOpen}
        onClose={() => setIsQuickAssessmentOpen(false)}
      />

    </div>
  );
}



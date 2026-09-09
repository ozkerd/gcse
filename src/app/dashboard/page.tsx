'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Sparkles, TrendingUp, Calendar, AlertCircle, ArrowRight, CheckCircle, Zap, GraduationCap, BarChart2, BarChart3, Lock, Clock, Bell, Play } from 'lucide-react';
import { AdaptiveEngine } from '@/lib/adaptive/engine';
import { UserStore, UserSession, DailyStats, ScheduledReview } from '@/lib/user-store';
import { SearchBar } from '@/components/SearchBar';
import { QuickAssessmentModal } from '@/components/QuickAssessmentModal';
import { TopicBreakdownModal } from '@/components/TopicBreakdownModal';
import { DailyGoalModal } from '@/components/DailyGoalModal';

export default function Dashboard() {
  const [session, setSession] = useState<UserSession>({
    role: 'guest',
    name: 'Guest Student',
    email: 'guest@primerllm.com',
    targetGrade: 9,
    dailyStudyGoalMinutes: 30,
    examDate: '2027-05-10',
  });

  const [dailyStats, setDailyStats] = useState<DailyStats>({
    date: new Date().toISOString().split('T')[0],
    questionsAttemptedToday: 0,
    questionsCorrectToday: 0,
    studyMinutesToday: 0,
    streakDays: 0,
  });

  const [estimatedGrade, setEstimatedGrade] = useState<number>(6.5);
  const [isQuickAssessmentOpen, setIsQuickAssessmentOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isDailyGoalOpen, setIsDailyGoalOpen] = useState(false);
  const [allTimeAttempted, setAllTimeAttempted] = useState(0);
  const [daysUntilExam, setDaysUntilExam] = useState(244);
  const [reviewsDueToday, setReviewsDueToday] = useState<ScheduledReview[]>([]);

  useEffect(() => {
    setSession(UserStore.getSession());
    setDailyStats(UserStore.getDailyStats());
    setDaysUntilExam(UserStore.getDaysUntilExam());
    setReviewsDueToday(UserStore.getReviewsDueToday());

    const updateMasteries = () => {
      const masteries = Object.values(UserStore.getTopicMasteries());
      if (masteries.length > 0) {
        const est = AdaptiveEngine.calculateEstimatedGrade(masteries);
        setEstimatedGrade(est);
        const attempted = masteries.reduce((sum, m) => sum + (m.totalAttempted || 0), 0);
        setAllTimeAttempted(attempted);
      }
    };

    updateMasteries();

    const handleUserUpdate = () => {
      setSession(UserStore.getSession());
      setDaysUntilExam(UserStore.getDaysUntilExam());
    };
    const handleStatsUpdate = () => {
      setDailyStats(UserStore.getDailyStats());
      updateMasteries();
    };
    const handleReviewsUpdate = () => {
      setReviewsDueToday(UserStore.getReviewsDueToday());
    };

    window.addEventListener('gcse_user_updated', handleUserUpdate);
    window.addEventListener('gcse_stats_updated', handleStatsUpdate);
    window.addEventListener('gcse_masteries_updated', handleStatsUpdate);
    window.addEventListener('gcse_reviews_updated', handleReviewsUpdate);

    return () => {
      window.removeEventListener('gcse_user_updated', handleUserUpdate);
      window.removeEventListener('gcse_stats_updated', handleStatsUpdate);
      window.removeEventListener('gcse_masteries_updated', handleStatsUpdate);
      window.removeEventListener('gcse_reviews_updated', handleReviewsUpdate);
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
  const totalSolvedDisplay = allTimeAttempted > 0 ? allTimeAttempted : dailyStats.questionsAttemptedToday;

  const studyMinutesToday = dailyStats.studyMinutesToday || 0;
  const studyGoalMinutes = session.dailyStudyGoalMinutes || 30;
  const studyGoalPercent = Math.min(100, Math.round((studyMinutesToday / studyGoalMinutes) * 100));

  return (
    <div className="space-y-8">
      
      {/* Header & Google Search */}
      <div className="flex flex-col gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Student Dashboard & Progress</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {session.role === 'guest'
                ? 'Learning in Guest Mode. Your progress is saved dynamically via cookies.'
                : `Welcome back, ${session.name}! View daily goals and track your path to Grade ${session.targetGrade}.`}
            </p>
          </div>

          {/* School Year & Target Grade Selectors */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/60 p-2.5 rounded-2xl">
              <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <label className="block text-[10px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">School Year</label>
                <select
                  value={session.schoolYear || 10}
                  onChange={(e) => {
                    const yr = Number(e.target.value);
                    UserStore.setSchoolYear(yr);
                  }}
                  className="bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200 font-bold text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-500"
                >
                  <option value={8}>Year 8 (Foundation / Gr 4)</option>
                  <option value={9}>Year 9 (Grade 5)</option>
                  <option value={10}>Year 10 (Grade 6)</option>
                  <option value={11}>Year 11 (Grade 8)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 p-2.5 rounded-2xl">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <label className="block text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">Target GCSE Grade</label>
                <select
                  value={session.targetGrade}
                  onChange={(e) => handleTargetGradeChange(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-bold text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                >
                  {[4, 5, 6, 7, 8, 9].map(g => (
                    <option key={g} value={g}>Grade {g} (Target)</option>
                  ))}
                </select>
              </div>
            </div>

            <Link
              href="/stats"
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold transition-all shadow-xs"
              title="Platform Canlı Ziyaretçi & User-Agent İstatistikleri (/stats)"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Platform Stats</span>
              <Lock className="w-3 h-3 text-slate-400" />
            </Link>
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

      {/* Due Today Reminder Banner */}
      {reviewsDueToday.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-white font-extrabold text-[11px] uppercase tracking-wider">
                  Due Today Reminder
                </span>
                <span className="text-xs text-pink-100 font-medium">
                  {reviewsDueToday.length} Scheduled Topic{reviewsDueToday.length > 1 ? 's' : ''} Due
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                {reviewsDueToday[0].topicTitle} ({reviewsDueToday[0].subject})
              </h3>
              {reviewsDueToday[0].notes && (
                <p className="text-xs text-pink-100 mt-0.5 line-clamp-1">
                  Note: {reviewsDueToday[0].notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/practice?topicId=${reviewsDueToday[0].topicId}`}
              className="px-6 py-3 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-rose-700" />
              <span>Start Now</span>
            </Link>
            <Link
              href="/calendar"
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/25 transition-colors"
            >
              View Schedule
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Estimated Grade */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estimated Current Grade</span>
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Grade {estimatedGrade}</div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
            {(session.targetGrade - estimatedGrade) > 0 
              ? `${(session.targetGrade - estimatedGrade).toFixed(1)} Grades remaining to Target`
              : 'Target Grade achieved!'}
          </p>
        </div>

        {/* Metric 2: Streak */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Study Streak</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{dailyStats.streakDays} Days 🔥</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Active daily momentum tracking</p>
        </div>

        {/* Metric 3: Clickable Solved Questions with Breakdown Trigger */}
        <button
          onClick={() => setIsBreakdownOpen(true)}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:scale-[1.02] transition-all group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Questions Solved
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {totalSolvedDisplay}
            </div>
            {allTimeAttempted > 0 && dailyStats.questionsAttemptedToday > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                (+{dailyStats.questionsAttemptedToday} today)
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>View Topic Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </p>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              Click to view
            </span>
          </div>
        </button>

        {/* Metric 4: Clickable Study Time Today with Goal Modal */}
        <button
          onClick={() => setIsDailyGoalOpen(true)}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:scale-[1.02] transition-all group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Study Time Today
            </span>
            <div className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {studyMinutesToday} mins
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              ({studyGoalPercent}%)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                studyGoalPercent >= 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${studyGoalPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Goal: {studyGoalMinutes}m • Set Target</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </p>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              Click to edit
            </span>
          </div>
        </button>

      </div>

      {/* Exam Countdown & Revision Hub Banner */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 font-bold border border-purple-200 dark:border-purple-800">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {daysUntilExam} Days Until GCSE Exams
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                May/June Season
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target Grade {session.targetGrade} Revision Roadmap • {reviewsDueToday.length} reviews due today
            </p>
          </div>
        </div>

        <Link
          href="/calendar"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-all shadow-sm shrink-0"
        >
          <span>Open Full Study Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Identified Topic Gaps
            </h3>
            
            <div className="space-y-3">
              {recommendedTopics.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <span>{rec.topicId === 'm-alg-2' ? 'Simultaneous Equations' : 'Quadratic Equations'}</span>
                    <span className="text-amber-600 dark:text-amber-400">Priority: High</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/topics"
            className="mt-4 text-center py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
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

      {/* Topic Performance Breakdown Modal */}
      <TopicBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
      />

      {/* Daily Study Goal & Time Modal */}
      <DailyGoalModal
        isOpen={isDailyGoalOpen}
        onClose={() => setIsDailyGoalOpen(false)}
        currentMinutes={studyMinutesToday}
        currentGoal={studyGoalMinutes}
        onGoalSaved={(newG) => {
          setSession((prev) => ({ ...prev, dailyStudyGoalMinutes: newG }));
        }}
      />

    </div>
  );
}

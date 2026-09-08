'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { X, Search, Award, CheckCircle2, TrendingUp, ArrowRight, BookOpen, Target, Sparkles, Filter } from 'lucide-react';
import { GCSE_TOPICS, GCSE_SUBJECTS } from '@/lib/curriculum/gcse-data';
import { UserStore, TopicMasteryRecord } from '@/lib/user-store';

interface TopicBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopicBreakdownModal({ isOpen, onClose }: TopicBreakdownModalProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'attempted' | 'all'>('attempted');

  const masteries = useMemo(() => {
    if (!isOpen) return {};
    return UserStore.getTopicMasteries();
  }, [isOpen]);

  // Calculate high-level KPIs
  const { totalAttempted, totalCorrect, overallAccuracy, practicedTopicsCount } = useMemo(() => {
    const list = Object.values(masteries);
    const attempted = list.reduce((sum, m) => sum + (m.totalAttempted || 0), 0);
    const correct = list.reduce((sum, m) => sum + (m.totalCorrect || 0), 0);
    const acc = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const practicedCount = list.filter(m => (m.totalAttempted || 0) > 0).length;
    return {
      totalAttempted: attempted,
      totalCorrect: correct,
      overallAccuracy: acc,
      practicedTopicsCount: practicedCount,
    };
  }, [masteries]);

  // Combine topics with user mastery records
  const topicStats = useMemo(() => {
    return GCSE_TOPICS.map((t) => {
      const rec = masteries[t.id];
      const attempted = rec?.totalAttempted || 0;
      const correct = rec?.totalCorrect || 0;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      const mastery = rec?.masteryScore || 0;
      const grade = rec?.currentGradeLevel || t.minGrade;
      const isMastered = rec?.isMastered || mastery >= 100;
      const subject = GCSE_SUBJECTS.find((s) => s.id === t.subjectId);

      return {
        topic: t,
        subject,
        attempted,
        correct,
        accuracy,
        mastery,
        grade,
        isMastered,
      };
    });
  }, [masteries]);

  // Filtered topics based on search, subject, and view mode
  const filteredTopics = useMemo(() => {
    return topicStats.filter((item) => {
      if (viewMode === 'attempted' && item.attempted === 0) {
        return false;
      }
      if (selectedSubject !== 'all' && item.topic.subjectId !== selectedSubject) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.topic.topicName.toLowerCase().includes(q);
        const matchUnit = item.topic.unitName.toLowerCase().includes(q);
        const matchSubject = item.subject?.name.toLowerCase().includes(q);
        if (!matchName && !matchUnit && !matchSubject) return false;
      }
      return true;
    }).sort((a, b) => {
      // Sort: practiced topics with highest attempts first, then highest accuracy
      if (b.attempted !== a.attempted) return b.attempted - a.attempted;
      return b.accuracy - a.accuracy;
    });
  }, [topicStats, selectedSubject, searchQuery, viewMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                Your GCSE Topic Performance Breakdown
              </h2>
              <p className="text-xs text-indigo-100 mt-0.5">
                Detailed question accuracy, completed topics, and success rate per curriculum area
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Solved
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {totalAttempted}
            </div>
            <span className="text-[10px] text-slate-400">All-time practice questions</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Correct Answers
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {totalCorrect}
            </div>
            <span className="text-[10px] text-emerald-600/80 font-medium">Successfully verified</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Overall Accuracy
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              {overallAccuracy}%
            </div>
            <span className="text-[10px] text-indigo-600/80 font-medium">Global success rate</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Topics Practiced
            </span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
              {practicedTopicsCount} <span className="text-xs font-semibold text-slate-400">/ 103</span>
            </div>
            <span className="text-[10px] text-purple-600/80 font-medium">Active coverage</span>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by topic or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle: Practiced Only vs All 103 Topics */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-stretch sm:self-auto justify-center">
              <button
                onClick={() => setViewMode('attempted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'attempted'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Practiced Topics ({practicedTopicsCount})
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All 103 Curriculum Topics
              </button>
            </div>
          </div>

          {/* Subject Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Subject:
            </span>
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all ${
                selectedSubject === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Subjects
            </button>
            {GCSE_SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all ${
                  selectedSubject === s.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.name.replace('GCSE ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Topics List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {filteredTopics.length > 0 ? (
            filteredTopics.map((item) => {
              const hasAttempted = item.attempted > 0;
              const barColor =
                item.accuracy >= 75
                  ? 'bg-emerald-500'
                  : item.accuracy >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

              const badgeColor =
                item.accuracy >= 75
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : item.accuracy >= 50
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';

              return (
                <div
                  key={item.topic.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {item.subject?.name || item.topic.subjectId}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {item.topic.unitName}
                        </span>
                        {item.isMastered && (
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            100% Mastered
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {item.topic.topicName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {hasAttempted ? (
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {item.correct} / {item.attempted} Correct
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-xs ${badgeColor}`}>
                              {item.accuracy}%
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Target Level: Grade {item.grade} • Mastery {item.mastery}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">
                          Not practiced yet
                        </span>
                      )}

                      <Link
                        href={`/practice?topicId=${item.topic.id}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-all shadow-sm"
                      >
                        <span>{hasAttempted ? 'Practice More' : 'Start'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Accuracy Visual Progress Bar */}
                  {hasAttempted && (
                    <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.max(4, item.accuracy)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {viewMode === 'attempted'
                    ? 'No practice questions solved yet'
                    : 'No matching topics found'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {viewMode === 'attempted'
                    ? 'Start practicing any GCSE topic to see your detailed question accuracy and mastery percentage breakdown here!'
                    : 'Try changing your search query or subject filter.'}
                </p>
              </div>
              {viewMode === 'attempted' && (
                <div className="pt-2">
                  <Link
                    href="/practice"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <span>Start Practicing Questions</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>
            Showing <strong>{filteredTopics.length}</strong> topics
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

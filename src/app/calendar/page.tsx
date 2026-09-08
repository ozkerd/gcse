'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  Flame, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Play, 
  Trash2, 
  Sparkles, 
  Bell, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight,
  Target,
  Edit3
} from 'lucide-react';
import { UserStore, DailyStats, UserSession, ScheduledReview, TopicMasteryRecord } from '@/lib/user-store';
import { GCSE_TOPICS, GCSE_SUBJECTS } from '@/lib/curriculum/gcse-data';
import { ScheduleReviewModal } from '@/components/ScheduleReviewModal';

export default function CalendarPage() {
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

  const [scheduledReviews, setScheduledReviews] = useState<ScheduledReview[]>([]);
  const [daysUntilExam, setDaysUntilExam] = useState<number>(244);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [prefilledTopicId, setPrefilledTopicId] = useState<string | undefined>(undefined);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [isEditingExamDate, setIsEditingExamDate] = useState(false);
  const [customExamDate, setCustomExamDate] = useState('2027-05-10');
  const [masteries, setMasteries] = useState<Record<string, TopicMasteryRecord>>({});

  useEffect(() => {
    setSession(UserStore.getSession());
    setDailyStats(UserStore.getDailyStats());
    setScheduledReviews(UserStore.getScheduledReviews());
    setDaysUntilExam(UserStore.getDaysUntilExam());
    setMasteries(UserStore.getTopicMasteries());
    setCustomExamDate(UserStore.getSession().examDate || '2027-05-10');

    const handleUpdate = () => {
      setSession(UserStore.getSession());
      setDailyStats(UserStore.getDailyStats());
      setScheduledReviews(UserStore.getScheduledReviews());
      setDaysUntilExam(UserStore.getDaysUntilExam());
      setMasteries(UserStore.getTopicMasteries());
    };

    window.addEventListener('gcse_stats_updated', handleUpdate);
    window.addEventListener('gcse_user_updated', handleUpdate);
    window.addEventListener('gcse_reviews_updated', handleUpdate);
    window.addEventListener('gcse_masteries_updated', handleUpdate);

    return () => {
      window.removeEventListener('gcse_stats_updated', handleUpdate);
      window.removeEventListener('gcse_user_updated', handleUpdate);
      window.removeEventListener('gcse_reviews_updated', handleUpdate);
      window.removeEventListener('gcse_masteries_updated', handleUpdate);
    };
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const reviewsDueToday = scheduledReviews.filter(r => r.scheduledDate === todayStr && r.status !== 'completed');

  const handleToggleComplete = (id: string) => {
    UserStore.toggleReviewCompleted(id);
  };

  const handleDelete = (id: string) => {
    UserStore.deleteScheduledReview(id);
  };

  const handleOpenScheduleForTopic = (topicId: string) => {
    setPrefilledTopicId(topicId);
    setIsScheduleModalOpen(true);
  };

  const handleSaveExamDate = (newDate: string) => {
    UserStore.setExamDate(newDate);
    setCustomExamDate(newDate);
    setIsEditingExamDate(false);
    setDaysUntilExam(UserStore.getDaysUntilExam());
  };

  // AI Recommended topics based on low mastery or unpracticed core subjects
  const getSmartRecommendations = () => {
    const scoredList = GCSE_TOPICS.map(topic => {
      const record = masteries[topic.id];
      const score = record ? record.masteryScore : 25; // Default unpracticed score
      const attempted = record ? record.totalAttempted : 0;
      return { topic, score, attempted };
    });

    // Sort by lowest mastery score first (weakest topics prioritized)
    scoredList.sort((a, b) => a.score - b.score);
    return scoredList.slice(0, 4);
  };

  const smartRecommendations = getSmartRecommendations();

  const filteredReviews = scheduledReviews.filter(r => {
    if (filterTab === 'pending') return r.status === 'pending';
    if (filterTab === 'completed') return r.status === 'completed';
    return true;
  });

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomStr = tomorrow.toISOString().split('T')[0];
    if (dateStr === tomStr) return 'Tomorrow';

    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>GCSE Exam Preparation Plan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Revision Schedule & Study Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Tailored topic revision pacing, scheduled review reminders, and instant practice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 px-3.5 py-2 rounded-2xl text-amber-900 dark:text-amber-300 font-bold text-xs">
            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{dailyStats.streakDays} Day Streak</span>
          </div>

          <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/60 px-3.5 py-2 rounded-2xl text-purple-900 dark:text-purple-300 font-bold text-xs">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>{dailyStats.studyMinutesToday || 0}m Today</span>
          </div>

          <button
            onClick={() => {
              setPrefilledTopicId(undefined);
              setIsScheduleModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Review</span>
          </button>
        </div>
      </div>

      {/* Due Today Alert Center */}
      {reviewsDueToday.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 text-white shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white font-black text-[10px] uppercase tracking-wider">
                  Due Today Reminder
                </span>
                <h2 className="text-lg font-extrabold text-white mt-0.5">
                  {reviewsDueToday.length} Topic Review{reviewsDueToday.length > 1 ? 's' : ''} Scheduled For Today
                </h2>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {reviewsDueToday.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="px-2 py-0.5 rounded bg-white/20 font-bold text-[11px]">
                      {rev.subject}
                    </span>
                    <span className="text-[10px] font-semibold text-pink-100 uppercase">
                      {rev.priority || 'high'} Priority
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{rev.topicTitle}</h3>
                  {rev.notes && (
                    <p className="text-[11px] text-pink-100 mt-1 line-clamp-1">
                      {rev.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15">
                  <span className="text-[11px] text-pink-100">
                    Target: {rev.targetQuestions || 15} Qs
                  </span>
                  <Link
                    href={`/practice?topicId=${rev.topicId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-extrabold text-xs shadow-md transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-rose-700" />
                    <span>Start Now</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam Countdown & Target Grade Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xl border border-indigo-100 dark:border-indigo-900/60">
              {daysUntilExam}d
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {daysUntilExam} Days Left Until GCSE Exams
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                  Target Grade {session.targetGrade}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target Exam Season Date: <strong>{customExamDate}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingExamDate ? (
              <button
                onClick={() => setIsEditingExamDate(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change Exam Date</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customExamDate}
                  min={todayStr}
                  onChange={(e) => setCustomExamDate(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <button
                  onClick={() => handleSaveExamDate(customExamDate)}
                  className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingExamDate(false)}
                  className="px-2 py-1 text-slate-400 text-xs font-semibold hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Recommended Weekly Cadence
            </span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100">
              3 to 4 Topic Reviews / week
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Target Question Volume
            </span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100">
              15 - 20 authentic exam questions / review
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Curriculum Coverage
            </span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {Object.keys(masteries).length} of 103 Topics Practiced
            </span>
          </div>
        </div>
      </div>

      {/* AI Smart Suggested Topics to Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              AI Smart Recommendations (Highest Exam Yield)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Topics prioritized by mastery gap and grade weighting
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {smartRecommendations.map(({ topic, score, attempted }) => (
            <div
              key={topic.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                    Gr {topic.minGrade}-{topic.maxGrade}
                  </span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs">
                    {score}% Mastery
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                  {topic.topicName}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {topic.unitName}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenScheduleForTopic(topic.id)}
                  className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Schedule
                </button>
                <Link
                  href={`/practice?topicId=${topic.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Now</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revision Schedule Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Revision Schedule Timeline
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {scheduledReviews.length} Total
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({scheduledReviews.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Pending ({scheduledReviews.filter(r => r.status !== 'completed').length})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Completed ({scheduledReviews.filter(r => r.status === 'completed').length})
            </button>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              No Scheduled Reviews Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't scheduled any reviews for this filter. Use the button below to add topics to your study schedule.
            </p>
            <button
              onClick={() => {
                setPrefilledTopicId(undefined);
                setIsScheduleModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule a Review</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((item) => {
              const isDueToday = item.scheduledDate === todayStr && item.status !== 'completed';
              const isCompleted = item.status === 'completed';

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDueToday
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-sm'
                      : isCompleted
                      ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Completion Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(item.id)}
                      className="mt-0.5 sm:mt-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                      title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                          {item.subject}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isDueToday
                              ? 'text-rose-600 dark:text-rose-400 font-black'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {formatDateLabel(item.scheduledDate)}
                        </span>
                        {item.priority && (
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              item.priority === 'high'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                : item.priority === 'medium'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {item.priority}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`font-bold text-base ${
                          isCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {item.topicTitle}
                      </h3>

                      {item.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {item.targetQuestions || 15} Qs
                    </span>

                    {/* Start Now Button */}
                    <Link
                      href={`/practice?topicId=${item.topicId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Now</span>
                    </Link>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete Scheduled Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Review Modal */}
      <ScheduleReviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialTopicId={prefilledTopicId}
        onScheduled={() => {
          setScheduledReviews(UserStore.getScheduledReviews());
        }}
      />

    </div>
  );
}

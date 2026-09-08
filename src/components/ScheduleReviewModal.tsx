'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { GCSE_SUBJECTS, GCSE_TOPICS, GCSETopic } from '@/lib/curriculum/gcse-data';
import { UserStore, ScheduledReview } from '@/lib/user-store';

interface ScheduleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: (newReview: ScheduledReview) => void;
  initialTopicId?: string;
}

export function ScheduleReviewModal({
  isOpen,
  onClose,
  onScheduled,
  initialTopicId,
}: ScheduleReviewModalProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('maths');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || 'm-alg-1');
  const [scheduledDate, setScheduledDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [targetQuestions, setTargetQuestions] = useState<number>(15);
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (initialTopicId) {
      const topic = GCSE_TOPICS.find((t) => t.id === initialTopicId);
      if (topic) {
        setSelectedSubject(topic.subjectId);
        setSelectedTopicId(topic.id);
      }
    }
  }, [initialTopicId, isOpen]);

  if (!isOpen) return null;

  const filteredTopics = GCSE_TOPICS.filter((t) => t.subjectId === selectedSubject);

  const handleSubjectChange = (subjId: string) => {
    setSelectedSubject(subjId);
    const firstTopic = GCSE_TOPICS.find((t) => t.subjectId === subjId);
    if (firstTopic) {
      setSelectedTopicId(firstTopic.id);
    }
  };

  const handleQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setScheduledDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = GCSE_TOPICS.find((t) => t.id === selectedTopicId);
    const subject = GCSE_SUBJECTS.find((s) => s.id === selectedSubject);

    if (!topic || !subject) return;

    const newRev = UserStore.addScheduledReview({
      topicId: topic.id,
      topicTitle: topic.topicName,
      subject: subject.name,
      scheduledDate,
      status: 'pending',
      priority,
      targetQuestions,
      notes: notes.trim() || undefined,
    });

    if (onScheduled) onScheduled(newRev);

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 600);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative transition-colors max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
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
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Schedule Topic Revision
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Plan ahead and receive automated reminders on the scheduled date.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {GCSE_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>GCSE Topic ({filteredTopics.length} available)</span>
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {filteredTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.topicName} ({t.unitName} • Gr {t.minGrade}-{t.maxGrade})
                </option>
              ))}
            </select>
          </div>

          {/* Revision Date */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Target Revision Date
            </label>
            
            {/* Quick date chips */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickDate(0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  scheduledDate === todayStr
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(1)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(3)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(7)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all"
              >
                In 1 Week
              </button>
            </div>

            <input
              type="date"
              value={scheduledDate}
              min={todayStr}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Priority & Target Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low / Refresher</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Target Questions
              </label>
              <select
                value={targetQuestions}
                onChange={(e) => setTargetQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10 Questions (~15 mins)</option>
                <option value={15}>15 Questions (~25 mins)</option>
                <option value={20}>20 Questions (~35 mins)</option>
                <option value={30}>30 Questions (~50 mins)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Revision Notes / Goals (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Master Grade 8 method marks, review formulas..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Scheduled!</span>
                </>
              ) : (
                <span>Schedule Revision</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

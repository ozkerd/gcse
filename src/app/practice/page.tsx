'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Award,
  Sliders,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  Headphones,
  Flag,
  Play,
  RotateCcw,
  Filter,
  Check,
  ArrowRight,
} from 'lucide-react';
import {
  INITIAL_SEED_QUESTIONS,
  SeedQuestion,
  GCSE_TOPICS,
  GCSE_SUBJECTS,
} from '@/lib/curriculum/gcse-data';
import {
  AIGenerator,
  DeepExplanationResult,
  validateAnswer,
} from '@/lib/ai/generator';
import { DeepExplanationModal } from '@/components/DeepExplanationModal';
import {
  UserStore,
  TopicMasteryRecord,
  StudentTopicCoverage,
} from '@/lib/user-store';
import { AdaptiveEngine } from '@/lib/adaptive/engine';
import { SearchBar } from '@/components/SearchBar';
import { QuestionCard } from '@/components/QuestionCard';
import { LevelCheckInModal } from '@/components/LevelCheckInModal';

interface SessionAttemptLog {
  questionId: string;
  topicId: string;
  topicName: string;
  subtopicId?: string;
  subtopicName?: string;
  gradeLevel: number;
  isCorrect: boolean;
  masteryAfter: number;
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject');
  const topicParam = searchParams.get('topic') || searchParams.get('topicId');
  const subtopicParam =
    searchParams.get('subtopic') || searchParams.get('subtopicId') || undefined;
  const searchQueryParam = searchParams.get('searchQuery');
  const filterParam = searchParams.get('filter'); // e.g. 'covered'

  // Determine initial topic & subject
  let initialTopicId = 'm-alg-1';
  if (topicParam) {
    initialTopicId = topicParam;
  } else if (searchQueryParam) {
    const matched = GCSE_TOPICS.find(
      (t) =>
        t.topicName.toLowerCase().includes(searchQueryParam.toLowerCase()) ||
        t.unitName.toLowerCase().includes(searchQueryParam.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQueryParam.toLowerCase())
    );
    if (matched) initialTopicId = matched.id;
  } else if (subjectParam) {
    const matched = GCSE_TOPICS.find((t) => t.subjectId === subjectParam);
    if (matched) initialTopicId = matched.id;
  }

  const initialTopicObj =
    GCSE_TOPICS.find((t) => t.id === initialTopicId) || GCSE_TOPICS[0];

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjectParam || initialTopicObj.subjectId
  );
  const [activeTopicId, setActiveTopicId] = useState<string>(initialTopicId);
  const [customSelectedTopicIds, setCustomSelectedTopicIds] = useState<string[]>([
    initialTopicId,
  ]);
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState<boolean>(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [customGradeBand, setCustomGradeBand] = useState<
    'adaptive' | 'foundation' | 'higher' | 'top'
  >('adaptive');

  const [sessionIndex, setSessionIndex] = useState<number>(0);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>(
    subtopicParam || ''
  );
  const [typeFilter, setTypeFilter] = useState<
    'all' | 'numerical' | 'short_answer' | 'fill_in_blank' | 'multiple_choice'
  >('all');

  const [masteriesMap, setMasteriesMap] = useState<
    Record<string, TopicMasteryRecord>
  >({});
  const [coverageMap, setCoverageMap] = useState<
    Record<string, StudentTopicCoverage>
  >({});

  // Session summary / finish state
  const [isSessionFinished, setIsSessionFinished] = useState<boolean>(false);
  const [sessionLogs, setSessionLogs] = useState<SessionAttemptLog[]>([]);
  const [lastDiagnosticFeedback, setLastDiagnosticFeedback] = useState<{
    isCorrect: boolean;
    topicId: string;
    topicName: string;
    subtopicName: string;
    masteryScore: number;
    gradeLevel: number;
    verdictTitle: string;
    verdictDetail: string;
  } | null>(null);

  const topicSubtopics = useMemo(() => {
    const map = new Map<string, string>();
    INITIAL_SEED_QUESTIONS.filter(
      (q) => q.topicId === activeTopicId && q.subtopicId
    ).forEach((q) => {
      if (q.subtopicId && !map.has(q.subtopicId)) {
        map.set(q.subtopicId, q.subtopicName || q.subtopicId);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [activeTopicId]);

  const getInitialQuestion = (): SeedQuestion => {
    const session = UserStore.getSession();
    const baseGrade = session.targetGrade || 6;
    return AdaptiveEngine.getAdaptiveQuestionForTopic(
      initialTopicId,
      baseGrade,
      [],
      undefined,
      0
    );
  };

  const [currentQuestion, setCurrentQuestion] =
    useState<SeedQuestion>(getInitialQuestion);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deepAnalysisData, setDeepAnalysisData] =
    useState<DeepExplanationResult | null>(null);
  const [scoreCount, setScoreCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [loadingNewQuestion, setLoadingNewQuestion] = useState<boolean>(false);
  const [askedIds, setAskedIds] = useState<string[]>([]);

  useEffect(() => {
    const m = UserStore.getTopicMasteries();
    const c = UserStore.getTopicCoverageMap();
    setMasteriesMap(m);
    setCoverageMap(c);

    if (filterParam === 'covered') {
      const coveredInSubject = GCSE_TOPICS.filter(
        (t) =>
          (!subjectParam || t.subjectId === subjectParam) &&
          c[t.id] &&
          c[t.id].status !== 'not_covered'
      ).map((t) => t.id);

      if (coveredInSubject.length > 0) {
        setCustomSelectedTopicIds(coveredInSubject);
        setActiveTopicId(coveredInSubject[0]);
      }
    }
  }, [filterParam, subjectParam]);

  const computeTargetGradeForTopic = (topicId: string): number => {
    if (customGradeBand === 'foundation') return 4;
    if (customGradeBand === 'higher') return 6;
    if (customGradeBand === 'top') return 8;
    const masteries = UserStore.getTopicMasteries();
    const cov = UserStore.getTopicCoverageMap();
    if (masteries[topicId]?.currentGradeLevel) {
      return masteries[topicId].currentGradeLevel;
    }
    if (cov[topicId]?.selfAssessedGrade) {
      return cov[topicId].selfAssessedGrade;
    }
    return UserStore.getSession().targetGrade || 6;
  };

  // Load adaptive question when URL params or filters change
  useEffect(() => {
    const targetId = topicParam || activeTopicId || initialTopicId;
    setActiveTopicId(targetId);
    const tObj = GCSE_TOPICS.find((t) => t.id === targetId);
    if (tObj) setSelectedSubjectId(tObj.subjectId);
    if (!customSelectedTopicIds.includes(targetId)) {
      setCustomSelectedTopicIds([targetId]);
    }
    if (subtopicParam) {
      setSelectedSubtopic(subtopicParam);
    }

    const currentGrade = computeTargetGradeForTopic(targetId);
    const answeredIds = UserStore.getAnsweredQuestionIds();
    const excludeList = Array.from(new Set([...askedIds, ...answeredIds]));

    setSessionIndex(0);
    const prefType = typeFilter !== 'all' ? typeFilter : undefined;
    const q = AdaptiveEngine.getAdaptiveQuestionForTopic(
      targetId,
      currentGrade,
      excludeList,
      selectedSubtopic || subtopicParam || undefined,
      0,
      prefType
    );
    setCurrentQuestion(q);
    setAskedIds((prev) => [...prev, q.id]);
    setSelectedOption(null);
    setHasSubmitted(false);
    setLastDiagnosticFeedback(null);
  }, [topicParam, subtopicParam, searchQueryParam, selectedSubtopic, typeFilter, customGradeBand]);

  const currentTopic =
    GCSE_TOPICS.find((t) => t.id === activeTopicId) || GCSE_TOPICS[0];
  const currentTopicMastery = masteriesMap[activeTopicId]?.masteryScore ?? 30;

  const toggleCustomTopic = (topicId: string) => {
    setCustomSelectedTopicIds((prev) => {
      if (prev.includes(topicId)) {
        if (prev.length === 1) return prev; // Keep at least 1 topic selected
        const next = prev.filter((id) => id !== topicId);
        if (activeTopicId === topicId) {
          setActiveTopicId(next[0]);
        }
        return next;
      }
      return [...prev, topicId];
    });
  };

  const applyCustomPracticeSelection = (topicIds: string[]) => {
    if (topicIds.length === 0) return;
    setCustomSelectedTopicIds(topicIds);
    const firstTopic = topicIds[0];
    setActiveTopicId(firstTopic);
    setSelectedSubtopic('');
    setIsCustomBuilderOpen(false);
    setIsSessionFinished(false);

    const grade = computeTargetGradeForTopic(firstTopic);
    const prefType = typeFilter !== 'all' ? typeFilter : undefined;
    const q = AdaptiveEngine.getAdaptiveQuestionForTopic(
      firstTopic,
      grade,
      askedIds,
      undefined,
      sessionIndex + 1,
      prefType
    );
    setCurrentQuestion(q);
    setAskedIds((prev) => [...prev, q.id]);
    setSelectedOption(null);
    setHasSubmitted(false);
    setLastDiagnosticFeedback(null);
  };

  const handleSubmit = () => {
    if (!selectedOption || hasSubmitted) return;
    setHasSubmitted(true);
    setTotalAttempts((prev) => prev + 1);

    const evalRes = validateAnswer(currentQuestion, selectedOption);
    const correct = evalRes.isCorrect;
    if (correct) {
      setScoreCount((prev) => prev + 1);
    }

    // Record attempt & update Adaptive Topic Mastery
    UserStore.recordQuestionAttempt(correct, currentQuestion.id);
    const updatedRecord = UserStore.updateTopicMastery(
      currentQuestion.topicId,
      correct,
      currentQuestion.gradeLevel
    );

    const latestMasteries = UserStore.getTopicMasteries();
    setMasteriesMap(latestMasteries);

    const qTopic =
      GCSE_TOPICS.find((t) => t.id === currentQuestion.topicId) || currentTopic;
    const subName = currentQuestion.subtopicName || qTopic.topicName;

    // Build explicit diagnostic verdict for the student
    let verdictTitle = '';
    let verdictDetail = '';

    if (correct) {
      if (updatedRecord.masteryScore >= 80) {
        verdictTitle = `🌟 You've mastered "${subName}" (${updatedRecord.masteryScore}% Topic Mastery)!`;
        verdictDetail = `Strong command of Grade ${currentQuestion.gradeLevel} concepts. When you click Continue, we'll challenge you at Grade ${updatedRecord.currentGradeLevel} or rotate to your next selected topic.`;
      } else {
        verdictTitle = `✅ You've understood this step in "${subName}" (Mastery up to ${updatedRecord.masteryScore}%)!`;
        verdictDetail = `Great job! Let's keep going with another question to push your mastery above 80% and lock in Grade ${updatedRecord.currentGradeLevel}.`;
      }
    } else {
      verdictTitle = `🔄 Concept needs reinforcement: "${subName}" (${updatedRecord.masteryScore}% Topic Mastery)`;
      verdictDetail = `Don't worry—review the worked solution below. When you click Continue, we'll ask a targeted follow-up question on "${subName}" to make sure you've got it!`;
    }

    setLastDiagnosticFeedback({
      isCorrect: correct,
      topicId: qTopic.id,
      topicName: qTopic.topicName,
      subtopicName: subName,
      masteryScore: updatedRecord.masteryScore,
      gradeLevel: updatedRecord.currentGradeLevel,
      verdictTitle,
      verdictDetail,
    });

    setSessionLogs((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        topicId: qTopic.id,
        topicName: qTopic.topicName,
        subtopicId: currentQuestion.subtopicId,
        subtopicName: subName,
        gradeLevel: currentQuestion.gradeLevel,
        isCorrect: correct,
        masteryAfter: updatedRecord.masteryScore,
      },
    ]);
  };

  const handleOpenDeepAnalysis = async () => {
    const analysis = await AIGenerator.generateDeepAnalysis(
      currentQuestion,
      selectedOption || undefined
    );
    setDeepAnalysisData(analysis);
    setIsModalOpen(true);
  };

  const handleNextQuestion = async () => {
    setLoadingNewQuestion(true);
    setSelectedOption(null);
    setHasSubmitted(false);

    const lastWasIncorrect =
      lastDiagnosticFeedback && !lastDiagnosticFeedback.isCorrect;

    // If the student missed the previous question, stay on the SAME topic & subtopic to reinforce understanding!
    // Otherwise, rotate across their customSelectedTopicIds pool.
    let nextTopicId = activeTopicId;
    let nextSubtopic: string | undefined = selectedSubtopic || undefined;

    if (lastWasIncorrect) {
      nextTopicId = currentQuestion.topicId;
      nextSubtopic = currentQuestion.subtopicId || selectedSubtopic || undefined;
    } else if (customSelectedTopicIds.length > 1) {
      const idx = customSelectedTopicIds.indexOf(activeTopicId);
      nextTopicId =
        customSelectedTopicIds[(idx + 1) % customSelectedTopicIds.length];
      setActiveTopicId(nextTopicId);
    }

    const nextGrade = computeTargetGradeForTopic(nextTopicId);
    const answeredIds = UserStore.getAnsweredQuestionIds();
    const excludeList = Array.from(
      new Set([...askedIds, ...answeredIds, currentQuestion.id])
    );

    const nextIndex = sessionIndex + 1;
    setSessionIndex(nextIndex);

    const prefType = typeFilter !== 'all' ? typeFilter : undefined;
    const nextQ = AdaptiveEngine.getAdaptiveQuestionForTopic(
      nextTopicId,
      nextGrade,
      excludeList,
      nextSubtopic,
      nextIndex,
      prefType
    );
    setAskedIds((prev) => [...prev, nextQ.id]);
    setCurrentQuestion(nextQ);
    setLastDiagnosticFeedback(null);
    setLoadingNewQuestion(false);
  };

  // Group session logs by topic for the Finish Summary screen
  const sessionTopicBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        topicId: string;
        topicName: string;
        attempted: number;
        correct: number;
        latestMastery: number;
      }
    >();
    sessionLogs.forEach((log) => {
      const existing = map.get(log.topicId) || {
        topicId: log.topicId,
        topicName: log.topicName,
        attempted: 0,
        correct: 0,
        latestMastery: log.masteryAfter,
      };
      existing.attempted += 1;
      if (log.isCorrect) existing.correct += 1;
      existing.latestMastery = log.masteryAfter;
      map.set(log.topicId, existing);
    });
    return Array.from(map.values());
  }, [sessionLogs]);

  const subjectTopicsForBuilder = useMemo(
    () => GCSE_TOPICS.filter((t) => t.subjectId === selectedSubjectId),
    [selectedSubjectId]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Practice Studio Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Custom & Adaptive GCSE Question Engine</span>
              {customSelectedTopicIds.length > 1 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px]">
                  {customSelectedTopicIds.length} Custom Topics Active
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {currentTopic.topicName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unit: {currentTopic.unitName} • Topic Mastery:{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {currentTopicMastery}%
              </strong>{' '}
              • Grades {currentTopic.minGrade}–{currentTopic.maxGrade}
            </p>
          </div>

          {/* Right Action Toolbar: Custom Topic Builder, Level Check-In, Finish Session */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomBuilderOpen((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
                isCustomBuilderOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Choose Custom Topics ({customSelectedTopicIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLevelModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-extrabold flex items-center gap-1.5 hover:bg-amber-100"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>My Level</span>
            </button>

            <Link
              href={`/flashcards?topicId=${activeTopicId}`}
              className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-extrabold flex items-center gap-1.5 hover:bg-purple-100"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Flashcards & Pod</span>
            </Link>

            {totalAttempts > 0 && !isSessionFinished && (
              <button
                type="button"
                onClick={() => setIsSessionFinished(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Finish & Score Mastery ({totalAttempts})</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Topic Mastery Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              Current Topic Mastery Score ({currentTopic.topicName})
            </span>
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                {currentTopicMastery}% Mastery
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-bold text-slate-600 dark:text-slate-300">
                Session Accuracy:{' '}
                {totalAttempts > 0
                  ? Math.round((scoreCount / totalAttempts) * 100)
                  : 100}
                % ({scoreCount}/{totalAttempts})
              </span>
            </div>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                currentTopicMastery >= 80
                  ? 'bg-emerald-500'
                  : currentTopicMastery >= 50
                  ? 'bg-indigo-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, currentTopicMastery)}%` }}
            />
          </div>
        </div>

        {/* Collapsible Custom Question & Topic Builder */}
        {isCustomBuilderOpen && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-indigo-200 dark:border-indigo-900 space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Custom Question Session Builder
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select one or multiple topics you want to be tested on, filter by what you have covered at school, and set your difficulty band.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const covered = GCSE_TOPICS.filter(
                      (t) =>
                        t.subjectId === selectedSubjectId &&
                        coverageMap[t.id] &&
                        coverageMap[t.id].status !== 'not_covered'
                    ).map((t) => t.id);
                    if (covered.length > 0) {
                      applyCustomPracticeSelection(covered);
                    } else {
                      setIsLevelModalOpen(true);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold"
                >
                  Practice Topics I’ve Covered at School
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyCustomPracticeSelection(
                      subjectTopicsForBuilder.map((t) => t.id)
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Select All in Subject
                </button>
              </div>
            </div>

            {/* Subject Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {GCSE_SUBJECTS.map((subj) => (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSubjectId === subj.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {subj.name.replace('GCSE ', '')}
                </button>
              ))}
            </div>

            {/* Topic Checkboxes Grid */}
            <div className="grid sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {subjectTopicsForBuilder.map((topic) => {
                const isChecked = customSelectedTopicIds.includes(topic.id);
                const tMastery = masteriesMap[topic.id]?.masteryScore;
                const cov = coverageMap[topic.id];
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleCustomTopic(topic.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      isChecked
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <span>{topic.unitName}</span>
                        {cov && cov.status !== 'not_covered' && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Covered (G{cov.selfAssessedGrade})
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-extrabold truncate">
                        {topic.topicName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {tMastery !== undefined && (
                        <span className="text-[11px] font-black text-slate-500">
                          {tMastery}%
                        </span>
                      )}
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Difficulty Band & Start Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1">
                  Target Level:
                </span>
                {[
                  { id: 'adaptive', label: '⚡ Auto-Adaptive' },
                  { id: 'foundation', label: 'Grades 4–5' },
                  { id: 'higher', label: 'Grades 6–7' },
                  { id: 'top', label: 'Grades 8–9' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setCustomGradeBand(b.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      customGradeBand === b.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  applyCustomPracticeSelection(customSelectedTopicIds)
                }
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>
                  Start Custom Practice ({customSelectedTopicIds.length} Topic
                  {customSelectedTopicIds.length > 1 ? 's' : ''})
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Subtopic Selector & Question Type Toolbar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              🎯 Subtopic:
            </span>
            <select
              value={selectedSubtopic}
              onChange={(e) => setSelectedSubtopic(e.target.value)}
              className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All 10 Subtopics (Adaptive Curriculum)</option>
              {topicSubtopics.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mr-1">
              Format:
            </span>
            {[
              { id: 'all', label: '🎯 20/80 Ratio' },
              { id: 'numerical', label: '🔢 Numerical' },
              { id: 'short_answer', label: '✍️ Written' },
              { id: 'fill_in_blank', label: '📝 Fill Blank' },
              { id: 'multiple_choice', label: '🔘 MC Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Instant Topic Search */}
        <div className="pt-2">
          <SearchBar placeholder="Search & switch to another topic (e.g. Macbeth, Mitosis, Cold War, Trigonometry)..." />
        </div>
      </div>

      {/* IF SESSION FINISHED: SHOW COMPREHENSIVE MASTERY REPORT CARD */}
      {isSessionFinished ? (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                Custom Session Complete
              </span>
              <h2 className="text-2xl font-black">
                Your Topic Mastery & Understanding Report
              </h2>
              <p className="text-xs text-indigo-100">
                You answered {totalAttempts} question{totalAttempts !== 1 ? 's' : ''} with{' '}
                {totalAttempts > 0
                  ? Math.round((scoreCount / totalAttempts) * 100)
                  : 0}
                % accuracy. Here is our diagnostic verdict on each topic you practiced:
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-black">
                {scoreCount} / {totalAttempts}
              </div>
              <div className="text-xs font-bold text-indigo-100">
                Questions Correct
              </div>
            </div>
          </div>

          {/* Per-Topic Understanding Verdict Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Topic-by-Topic Mastery Breakdown
            </h3>
            {sessionTopicBreakdown.map((item) => {
              const acc = Math.round((item.correct / item.attempted) * 100);
              const understood = item.latestMastery >= 70 || acc >= 75;
              return (
                <div
                  key={item.topicId}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    understood
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          understood
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {understood
                          ? '✅ Topic Understood'
                          : '🔄 Needs Reinforcement'}
                      </span>
                      <span className="text-xs font-extrabold text-slate-500">
                        Session: {item.correct}/{item.attempted} ({acc}%) • Overall Mastery: {item.latestMastery}%
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {item.topicName}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {understood
                        ? `You have demonstrated solid understanding of ${item.topicName}. Ready for Higher Tier exam papers!`
                        : `You missed key steps in ${item.topicName}. We recommend reviewing the 2-minute Audio-Visual Pod and Flashcards before re-testing.`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/flashcards?topicId=${item.topicId}&mode=pods`}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-700 dark:text-purple-300 font-extrabold text-xs hover:bg-purple-50"
                    >
                      🎧 Watch Pod
                    </Link>
                    <Link
                      href={`/flashcards?topicId=${item.topicId}`}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs hover:bg-indigo-50"
                    >
                      🃏 Flashcards
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setIsSessionFinished(false);
                handleNextQuestion();
              }}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Continue Practicing More Questions</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSessionFinished(false);
                setIsCustomBuilderOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm"
            >
              Pick Different Custom Topics
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* REAL-TIME ADAPTIVE DIAGNOSTIC BANNER AFTER SUBMITTING AN ANSWER */}
          {hasSubmitted && lastDiagnosticFeedback && (
            <div
              className={`p-5 rounded-3xl border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200 ${
                lastDiagnosticFeedback.isCorrect
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
              }`}
            >
              <div className="space-y-1">
                <div className="text-sm sm:text-base font-black">
                  {lastDiagnosticFeedback.verdictTitle}
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  {lastDiagnosticFeedback.verdictDetail}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>
                    {lastDiagnosticFeedback.isCorrect
                      ? 'Continue (Next Question)'
                      : 'Try Targeted Follow-Up'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSessionFinished(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-white"
                >
                  Finish Session
                </button>
              </div>
            </div>
          )}

          {/* Main Multi-Type Question Card */}
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={selectedOption}
            onAnswerChange={setSelectedOption}
            hasSubmitted={hasSubmitted}
            onSubmit={handleSubmit}
            onNext={handleNextQuestion}
            onDeepAnalysis={handleOpenDeepAnalysis}
            loading={loadingNewQuestion}
          />
        </>
      )}

      {/* Deep Solution Modal */}
      {deepAnalysisData && (
        <DeepExplanationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          explanation={deepAnalysisData}
          topicName={currentTopic?.topicName || 'GCSE Topic Deep Analysis'}
          topicId={currentTopic?.id}
        />
      )}

      {/* Student Level & Covered Topics Check-In Modal */}
      <LevelCheckInModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        initialSubjectId={selectedSubjectId}
        onCompleted={() => {
          setMasteriesMap(UserStore.getTopicMasteries());
          setCoverageMap(UserStore.getTopicCoverageMap());
        }}
      />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 font-bold">
          Loading Adaptive Practice Engine...
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}

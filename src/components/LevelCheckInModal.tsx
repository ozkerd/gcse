'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Target,
  Sliders,
  Play,
  HelpCircle,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  GCSE_SUBJECTS,
  GCSE_TOPICS,
  INITIAL_SEED_QUESTIONS,
  SeedQuestion,
} from '@/lib/curriculum/gcse-data';
import {
  UserStore,
  TopicCoverageStatus,
  StudentTopicCoverage,
} from '@/lib/user-store';
import { FormattedText } from '@/components/FormattedText';
import { useRouter } from 'next/navigation';

interface LevelCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubjectId?: string;
  onCompleted?: () => void;
}

export const LevelCheckInModal: React.FC<LevelCheckInModalProps> = ({
  isOpen,
  onClose,
  initialSubjectId = 'maths',
  onCompleted,
}) => {
  const router = useRouter();
  const [step, setStep] = useState<'overall' | 'topics' | 'verify' | 'summary'>('overall');
  const [schoolYear, setSchoolYear] = useState<number>(10);
  const [currentWorkingGrade, setCurrentWorkingGrade] = useState<number>(5);
  const [targetGrade, setTargetGrade] = useState<number>(8);
  const [activeSubjectId, setActiveSubjectId] = useState<string>(initialSubjectId);

  const [coverageState, setCoverageState] = useState<
    Record<string, { status: TopicCoverageStatus; selfAssessedGrade: number }>
  >({});

  // Mini verification quiz state (tests covered topics to verify true level)
  const [verifyQuestions, setVerifyQuestions] = useState<SeedQuestion[]>([]);
  const [verifyIndex, setVerifyIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [verifyResults, setVerifyResults] = useState<
    Array<{
      topicId: string;
      topicName: string;
      selfGrade: number;
      testedGrade: number;
      isCorrect: boolean;
      newMastery: number;
    }>
  >([]);

  useEffect(() => {
    if (!isOpen) return;
    const session = UserStore.getSession();
    setSchoolYear(session.schoolYear || 10);
    setCurrentWorkingGrade(session.currentWorkingGrade || Math.max(4, (session.targetGrade || 7) - 1));
    setTargetGrade(session.targetGrade || 8);

    const savedMap = UserStore.getTopicCoverageMap();
    const initialMap: Record<
      string,
      { status: TopicCoverageStatus; selfAssessedGrade: number }
    > = {};

    GCSE_TOPICS.forEach((t) => {
      if (savedMap[t.id]) {
        initialMap[t.id] = {
          status: savedMap[t.id].status,
          selfAssessedGrade: savedMap[t.id].selfAssessedGrade,
        };
      } else {
        // Default: first 2 topics per core subject marked as 'needs_practice' so student has a helpful starting point
        initialMap[t.id] = {
          status: 'not_covered',
          selfAssessedGrade: session.currentWorkingGrade || 5,
        };
      }
    });
    setCoverageState(initialMap);
    setStep('overall');
    setVerifyResults([]);
  }, [isOpen]);

  const subjectTopics = useMemo(
    () => GCSE_TOPICS.filter((t) => t.subjectId === activeSubjectId),
    [activeSubjectId]
  );

  const coveredCount = useMemo(() => {
    return Object.values(coverageState).filter((v) => v.status !== 'not_covered').length;
  }, [coverageState]);

  const setTopicStatus = (topicId: string, status: TopicCoverageStatus) => {
    setCoverageState((prev) => ({
      ...prev,
      [topicId]: {
        status,
        selfAssessedGrade:
          prev[topicId]?.selfAssessedGrade ||
          (status === 'confident'
            ? Math.min(9, currentWorkingGrade + 1)
            : currentWorkingGrade),
      },
    }));
  };

  const setTopicGrade = (topicId: string, grade: number) => {
    setCoverageState((prev) => ({
      ...prev,
      [topicId]: {
        status:
          prev[topicId]?.status === 'not_covered'
            ? 'needs_practice'
            : prev[topicId]?.status || 'needs_practice',
        selfAssessedGrade: grade,
      },
    }));
  };

  const markAllInSubject = (status: TopicCoverageStatus) => {
    setCoverageState((prev) => {
      const next = { ...prev };
      subjectTopics.forEach((t) => {
        next[t.id] = {
          status,
          selfAssessedGrade:
            status === 'confident'
              ? Math.min(9, currentWorkingGrade + 1)
              : currentWorkingGrade,
        };
      });
      return next;
    });
  };

  const persistCoverage = () => {
    const items = Object.entries(coverageState).map(([topicId, val]) => ({
      topicId,
      status: val.status,
      selfAssessedGrade: val.selfAssessedGrade,
    }));
    UserStore.saveBulkTopicCoverage(
      items,
      currentWorkingGrade,
      targetGrade,
      schoolYear
    );
  };

  const startVerificationQuiz = () => {
    persistCoverage();

    // Pick up to 3 covered topics (prioritising active subject first, then any covered topic)
    const coveredIds = Object.entries(coverageState)
      .filter(([, v]) => v.status !== 'not_covered')
      .map(([id]) => id);

    const targetTopicIds =
      coveredIds.length > 0
        ? coveredIds.slice(0, 4)
        : subjectTopics.slice(0, 3).map((t) => t.id);

    const picked: SeedQuestion[] = [];
    for (const tid of targetTopicIds) {
      const targetLvl = coverageState[tid]?.selfAssessedGrade || currentWorkingGrade;
      const candidates = INITIAL_SEED_QUESTIONS.filter(
        (q) => q.topicId === tid && q.options && q.options.length > 0
      );
      if (candidates.length > 0) {
        // Find question closest to student's self-reported level for that topic
        const sorted = [...candidates].sort(
          (a, b) => Math.abs(a.gradeLevel - targetLvl) - Math.abs(b.gradeLevel - targetLvl)
        );
        picked.push(sorted[0]);
      }
      if (picked.length >= 3) break;
    }

    if (picked.length === 0) {
      setStep('summary');
      return;
    }

    setVerifyQuestions(picked);
    setVerifyIndex(0);
    setSelectedOption('');
    setVerifyResults([]);
    setStep('verify');
  };

  const handleVerifyAnswer = () => {
    const currentQ = verifyQuestions[verifyIndex];
    if (!currentQ || !selectedOption) return;

    const isCorrect =
      selectedOption.trim().toLowerCase() ===
      currentQ.correctAnswer.trim().toLowerCase();

    UserStore.recordQuestionAttempt(isCorrect, currentQ.id);
    const updatedMastery = UserStore.updateTopicMastery(
      currentQ.topicId,
      isCorrect,
      currentQ.gradeLevel
    );

    const topicObj = GCSE_TOPICS.find((t) => t.id === currentQ.topicId);
    const selfGrade =
      coverageState[currentQ.topicId]?.selfAssessedGrade || currentWorkingGrade;

    const nextResults = [
      ...verifyResults,
      {
        topicId: currentQ.topicId,
        topicName: topicObj?.topicName || currentQ.topicId,
        selfGrade,
        testedGrade: currentQ.gradeLevel,
        isCorrect,
        newMastery: updatedMastery.masteryScore,
      },
    ];
    setVerifyResults(nextResults);

    if (verifyIndex + 1 < verifyQuestions.length) {
      setVerifyIndex(verifyIndex + 1);
      setSelectedOption('');
    } else {
      setStep('summary');
      if (onCompleted) onCompleted();
    }
  };

  const handleSaveAndFinish = () => {
    persistCoverage();
    if (onCompleted) onCompleted();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
                Personalised GCSE Level Calibration
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                Where Are You Right Now? (Level & Covered Topics)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={() => setStep('overall')}
              className={`flex items-center gap-1.5 ${
                step === 'overall'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[11px]">
                1
              </span>
              <span>Current Grade</span>
            </button>
            <span className="text-slate-300">→</span>
            <button
              onClick={() => setStep('topics')}
              className={`flex items-center gap-1.5 ${
                step === 'topics'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[11px]">
                2
              </span>
              <span>Topics Covered at School ({coveredCount})</span>
            </button>
            <span className="text-slate-300">→</span>
            <span
              className={`flex items-center gap-1.5 ${
                step === 'verify' || step === 'summary'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[11px]">
                3
              </span>
              <span>3-Question Level Check</span>
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 max-h-[72vh] overflow-y-auto">
          {step === 'overall' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Step 1: Tell us your current school year and working level
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  We use this to pitch flashcards, audio pods, and custom questions at the exact level you need right now.
                </p>
              </div>

              {/* School Year Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Which School Year are you currently in?
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { yr: 8, desc: 'Pre-GCSE Foundation' },
                    { yr: 9, desc: 'Starting GCSE Core' },
                    { yr: 10, desc: 'Building Exam Mastery' },
                    { yr: 11, desc: 'Final GCSE Exam Year' },
                  ].map((item) => (
                    <button
                      key={item.yr}
                      type="button"
                      onClick={() => setSchoolYear(item.yr)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        schoolYear === item.yr
                          ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                      }`}
                    >
                      <div className="font-black text-base text-slate-900 dark:text-slate-100">
                        Year {item.yr}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Working Grade */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  What GCSE Grade are you currently working at in school tests?
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {[
                    { g: 4, label: 'Grade 4', tag: 'Standard Pass' },
                    { g: 5, label: 'Grade 5', tag: 'Strong Pass' },
                    { g: 6, label: 'Grade 6', tag: 'Solid Higher' },
                    { g: 7, label: 'Grade 7', tag: 'Equivalent A' },
                    { g: 8, label: 'Grade 8', tag: 'Top Tier A*' },
                    { g: 9, label: 'Grade 9', tag: 'Top 5% Elite' },
                  ].map((item) => (
                    <button
                      key={item.g}
                      type="button"
                      onClick={() => {
                        setCurrentWorkingGrade(item.g);
                        if (targetGrade < item.g) setTargetGrade(Math.min(9, item.g + 1));
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        currentWorkingGrade === item.g
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-lg font-black">{item.label}</div>
                      <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {item.tag}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Grade */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  What is your Target GCSE Grade?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[5, 6, 7, 8, 9].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setTargetGrade(g)}
                      className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all border ${
                        targetGrade === g
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Target Grade {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('topics')}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all"
                >
                  <span>Next: Select Topics You’ve Covered at School</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'topics' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    Step 2: Which topics have you covered in class & how confident do you feel?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mark topics you have seen at school and set your current grade confidence per topic.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => markAllInSubject('confident')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100"
                  >
                    Mark Subject Confident
                  </button>
                  <button
                    type="button"
                    onClick={() => markAllInSubject('needs_practice')}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100"
                  >
                    Mark Subject Covered (Need Practice)
                  </button>
                </div>
              </div>

              {/* Subject Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                {GCSE_SUBJECTS.map((subj) => {
                  const isActive = activeSubjectId === subj.id;
                  const subjCovered = GCSE_TOPICS.filter(
                    (t) =>
                      t.subjectId === subj.id &&
                      coverageState[t.id]?.status &&
                      coverageState[t.id]?.status !== 'not_covered'
                  ).length;

                  return (
                    <button
                      key={subj.id}
                      type="button"
                      onClick={() => setActiveSubjectId(subj.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{subj.name.replace('GCSE ', '')}</span>
                      {subjCovered > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            isActive
                              ? 'bg-white text-indigo-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {subjCovered}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Topics List for Active Subject */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {subjectTopics.map((topic) => {
                  const cov = coverageState[topic.id] || {
                    status: 'not_covered',
                    selfAssessedGrade: currentWorkingGrade,
                  };

                  return (
                    <div
                      key={topic.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        cov.status === 'confident'
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                          : cov.status === 'needs_practice'
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                          : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                            {topic.unitName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                            Grades {topic.minGrade}–{topic.maxGrade}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {topic.topicName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {topic.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Status Pills */}
                        <button
                          type="button"
                          onClick={() => setTopicStatus(topic.id, 'confident')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            cov.status === 'confident'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                          }`}
                        >
                          ✅ Covered & Confident
                        </button>
                        <button
                          type="button"
                          onClick={() => setTopicStatus(topic.id, 'needs_practice')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            cov.status === 'needs_practice'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                          }`}
                        >
                          🔄 Covered (Need Practice)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTopicStatus(topic.id, 'not_covered')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            cov.status === 'not_covered'
                              ? 'bg-slate-700 text-white border-slate-700'
                              : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          ⏳ Not Seen Yet
                        </button>

                        {/* Per-Topic Self-Assessed Grade Selector when Covered */}
                        {cov.status !== 'not_covered' && (
                          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                            <span className="text-[11px] font-bold text-slate-500">
                              My Level:
                            </span>
                            <select
                              value={cov.selfAssessedGrade}
                              onChange={(e) =>
                                setTopicGrade(topic.id, Number(e.target.value))
                              }
                              className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800"
                            >
                              {[3, 4, 5, 6, 7, 8, 9].map((g) => (
                                <option key={g} value={g}>
                                  Grade {g}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('overall')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveAndFinish}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                  >
                    Save Without Quiz
                  </button>
                  <button
                    type="button"
                    onClick={startVerificationQuiz}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Verify My Level on Covered Topics (3 Quick Questions)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'verify' && verifyQuestions[verifyIndex] && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/50 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Level Verification Question {verifyIndex + 1} of {verifyQuestions.length}
                  </span>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    Checking your true mastery on:{' '}
                    {GCSE_TOPICS.find((t) => t.id === verifyQuestions[verifyIndex].topicId)
                      ?.topicName || 'Selected Topic'}{' '}
                    (Grade {verifyQuestions[verifyIndex].gradeLevel} Standard)
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-black">
                  Grade {verifyQuestions[verifyIndex].gradeLevel}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-sm sm:text-base leading-relaxed">
                <FormattedText text={verifyQuestions[verifyIndex].questionText} />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {(verifyQuestions[verifyIndex].options || []).map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <FormattedText text={opt} />
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={handleVerifyAnswer}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all"
                >
                  <span>
                    {verifyIndex + 1 < verifyQuestions.length
                      ? 'Submit & Next Check Question'
                      : 'Finish & See My Level Calibration'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                    Calibration Complete
                  </span>
                  <h3 className="text-2xl font-black">
                    Your Personal GCSE Profile Is Ready!
                  </h3>
                  <p className="text-xs text-emerald-50">
                    Year {schoolYear} • Current Working Level: Grade {currentWorkingGrade} • Target: Grade {targetGrade} • {coveredCount} Covered Topics Tracked
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-white/90 shrink-0" />
              </div>

              {verifyResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Diagnostic Verification on Covered Topics
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {verifyResults.map((res, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border ${
                          res.isCorrect
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="truncate">{res.topicName}</span>
                          <span
                            className={
                              res.isCorrect ? 'text-emerald-600' : 'text-amber-600'
                            }
                          >
                            {res.isCorrect ? '✅ Verified!' : '🔄 Needs Boost'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          {res.isCorrect
                            ? `You nailed the Grade ${res.testedGrade} check! Topic Mastery calibrated to ${res.newMastery}%.`
                            : `Tricky Grade ${res.testedGrade} concept! We've queued flashcards & custom practice (${res.newMastery}% Mastery).`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/flashcards?subject=${activeSubjectId}`);
                  }}
                  className="px-5 py-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-extrabold text-xs sm:text-sm hover:bg-purple-200 transition-all"
                >
                  Open Flashcards & Audio Pods
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/practice?subject=${activeSubjectId}&filter=covered`);
                  }}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Practice My Covered Topics Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

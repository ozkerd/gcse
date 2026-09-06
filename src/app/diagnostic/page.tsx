'use client';

import React, { useState } from 'react';
import { Target, CheckCircle2, ArrowRight, Award, Sparkles, GraduationCap, Filter, BookOpen } from 'lucide-react';
import { INITIAL_SEED_QUESTIONS, SeedQuestion, GCSE_TOPICS, GCSE_SUBJECTS } from '@/lib/curriculum/gcse-data';
import { KaTeXRenderer } from '@/components/KaTeXRenderer';
import { AdaptiveEngine, DiagnosticResult } from '@/lib/adaptive/engine';
import { UserStore } from '@/lib/user-store';
import Link from 'next/link';

export default function DiagnosticPage() {
  const [step, setStep] = useState<'setup' | 'test' | 'results'>('setup');
  const [selectedYear, setSelectedYear] = useState<number>(10);
  const [mode, setMode] = useState<'random' | 'specific'>('random');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('maths');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('m-alg-1');

  const [questions, setQuestions] = useState<SeedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<{ questionGrade: number; isCorrect: boolean; topicId: string }[]>([]);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const subjectTopics = GCSE_TOPICS.filter((t) => t.subjectId === selectedSubjectId);

  const startDiagnostic = () => {
    const yearGradeMap: Record<number, number> = { 8: 4, 9: 5, 10: 6, 11: 8 };
    const targetGrade = yearGradeMap[selectedYear] || 6;

    const answeredIds = UserStore.getAnsweredQuestionIds();
    let qList: SeedQuestion[] = [];
    const usedIds: string[] = [...answeredIds];

    if (mode === 'specific') {
      // Diagnostic specifically for chosen topic across difficulty levels
      for (let g = targetGrade - 1; g <= targetGrade + 2; g++) {
        const gradeLevel = Math.min(9, Math.max(4, g));
        const q = AdaptiveEngine.getAdaptiveQuestionForTopic(selectedTopicId, gradeLevel, usedIds);
        usedIds.push(q.id);
        qList.push({
          ...q,
          gradeLevel,
        });
      }
    } else {
      // Full Diagnostic across all subjects/topics tailored for Year Group
      qList = AdaptiveEngine.getQuickSnapshotQuestions(8).map((q) => ({
        ...q,
        gradeLevel: Math.min(9, Math.max(4, q.gradeLevel)),
      }));
    }

    setQuestions(qList);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAttempts([]);
    setStep('test');
  };

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (!selectedOption || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAttempts = [...attempts, { questionGrade: currentQuestion.gradeLevel, isCorrect, topicId: currentQuestion.topicId }];
    setAttempts(newAttempts);

    // Track daily question attempt in UserStore and mark question as answered
    UserStore.recordQuestionAttempt(isCorrect, currentQuestion.id);
    UserStore.updateTopicMastery(currentQuestion.topicId, isCorrect, currentQuestion.gradeLevel);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      const evalResult = AdaptiveEngine.evaluateDiagnosticTest(newAttempts);
      setResult(evalResult);
      setStep('results');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
          <Target className="w-4 h-4 text-indigo-600" />
          GCSE Diagnostic Assessment Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Diagnostic Assessment</h1>
        <p className="text-slate-500 text-sm">
          Determine your baseline GCSE grade and identify key knowledge gaps on your path to Grade 9.
        </p>
      </div>

      {step === 'setup' ? (
        /* Setup Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          
          {/* Year Group Selection */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              1. Select Your School Year Group
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { year: 8, label: 'Year 8', desc: 'Foundation' },
                { year: 9, label: 'Year 9', desc: 'Pre-GCSE' },
                { year: 10, label: 'Year 10', desc: 'GCSE Core' },
                { year: 11, label: 'Year 11', desc: 'Final GCSE' },
              ].map((y) => (
                <button
                  key={y.year}
                  onClick={() => setSelectedYear(y.year)}
                  className={`p-4 rounded-2xl border-2 text-center transition-all ${
                    selectedYear === y.year
                      ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900 shadow-sm'
                      : 'border-slate-200 hover:border-indigo-300 text-slate-700'
                  }`}
                >
                  <div className="text-base font-extrabold">{y.label}</div>
                  <div className="text-[11px] opacity-80">{y.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostic Mode & Topic Choice */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-600" />
              2. Choose Diagnostic Scope
            </label>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setMode('random')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  mode === 'random'
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900'
                    : 'border-slate-200 hover:border-indigo-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Full GCSE Diagnostic (All Subjects)
                </div>
                <p className="text-xs opacity-80 font-normal">
                  Comprehensive test spanning Maths, Science, History & Literature for Year {selectedYear}.
                </p>
              </button>

              <button
                onClick={() => setMode('specific')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  mode === 'specific'
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900'
                    : 'border-slate-200 hover:border-indigo-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold mb-1">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Specific Subject & Topic Diagnostic
                </div>
                <p className="text-xs opacity-80 font-normal">
                  Diagnose knowledge gaps for a specific topic (e.g., Quadratics, Macbeth, Cold War).
                </p>
              </button>
            </div>

            {/* Specific Subject / Topic Selection */}
            {mode === 'specific' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      const firstTopic = GCSE_TOPICS.find((t) => t.subjectId === e.target.value);
                      if (firstTopic) setSelectedTopicId(firstTopic.id);
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white font-semibold text-sm text-slate-800"
                  >
                    {GCSE_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Specific Topic</label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white font-semibold text-sm text-slate-800"
                  >
                    {subjectTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.topicName} ({t.unitName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={startDiagnostic}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Start Diagnostic Assessment</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : step === 'test' && currentQuestion ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Question {currentIndex + 1} of {questions.length} • Year {selectedYear}</span>
              <span className="text-indigo-600">Target Difficulty: Grade {currentQuestion.gradeLevel}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5">
            <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded font-mono text-[11px] font-bold mb-3">
              GCSE Level {currentQuestion.gradeLevel} Question
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              <KaTeXRenderer content={currentQuestion.questionText} />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((option, idx) => {
              const isSelected = selectedOption === option;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                  }`}
                >
                  <KaTeXRenderer content={option} />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleNext}
              disabled={!selectedOption}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                selectedOption
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{currentIndex + 1 === questions.length ? 'Complete Assessment' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : step === 'results' ? (
        /* Result Screen */
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-8 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-extrabold text-indigo-600 tracking-wider uppercase">Assessment Result • Year {selectedYear}</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Baseline Grade: {result?.gradeLabel}</h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
              {result?.summaryText}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Strong Topics</span>
              <span className="text-sm font-semibold text-emerald-950">Quadratic Equations & Energy Transfer</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase block mb-1">Areas for Improvement</span>
              <span className="text-sm font-semibold text-amber-950">CPU Registers & Weimar Republic</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setStep('setup')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm"
            >
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Configure & Retake Assessment</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
            >
              <Award className="w-4 h-4" />
              <span>Go to Dashboard & Set Targets</span>
            </Link>
          </div>
        </div>
      ) : null}

    </div>
  );
}



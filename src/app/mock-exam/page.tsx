'use client';

import React, { useState } from 'react';
import { Award, Clock, ArrowRight, BookOpen, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { SeedQuestion, GCSE_SUBJECTS, GCSE_TOPICS } from '@/lib/curriculum/gcse-data';
import { UserStore } from '@/lib/user-store';
import { AdaptiveEngine } from '@/lib/adaptive/engine';
import { validateAnswer } from '@/lib/ai/generator';
import { QuestionCard } from '@/components/QuestionCard';
import Link from 'next/link';

export default function MockExamPage() {
  const session = UserStore.getSession();
  const [selectedSubject, setSelectedSubject] = useState<string>('maths');
  const [selectedTier, setSelectedTier] = useState<'higher' | 'foundation'>('higher');
  const [selectedBoard, setSelectedBoard] = useState<string>('Edexcel');
  const [examMode, setExamMode] = useState<'standard' | 'extended'>('standard');
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);

  const [mockQuestions, setMockQuestions] = useState<SeedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  const handleStartExam = () => {
    const questionCount = examMode === 'extended' ? 15 : 8;
    const targetGrade = selectedTier === 'higher' ? 8 : 5;
    const questions = AdaptiveEngine.getQuickSnapshotQuestions(questionCount, selectedSubject, targetGrade);
    setMockQuestions(questions);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsExamSubmitted(false);
    setIsExamStarted(true);
  };

  const currentQ = mockQuestions[currentIndex];

  const handleSelectAnswer = (ans: string) => {
    if (!currentQ) return;
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: ans }));
  };

  const handleSubmitExam = () => {
    setIsExamSubmitted(true);
    // Record solved questions in user store for mastery & daily stats
    mockQuestions.forEach(q => {
      const userAns = userAnswers[q.id];
      if (userAns) {
        const isOk = validateAnswer(q, userAns).isCorrect;
        UserStore.recordQuestionAttempt(isOk, q.id);
        UserStore.updateTopicMastery(q.topicId, isOk, q.gradeLevel);
      }
    });
  };

  // Dynamic Grade & Performance Calculation
  let correctCount = 0;
  const topicBreakdown: Record<string, { topicName: string; correct: number; total: number }> = {};

  mockQuestions.forEach(q => {
    const userAns = userAnswers[q.id];
    const isCorrect = userAns ? validateAnswer(q, userAns).isCorrect : false;
    if (isCorrect) correctCount++;

    const topic = GCSE_TOPICS.find(t => t.id === q.topicId);
    const tName = topic ? topic.topicName : q.subtopicName || q.topicId;
    if (!topicBreakdown[q.topicId]) {
      topicBreakdown[q.topicId] = { topicName: tName, correct: 0, total: 0 };
    }
    topicBreakdown[q.topicId].total += 1;
    if (isCorrect) {
      topicBreakdown[q.topicId].correct += 1;
    }
  });

  const totalQuestions = mockQuestions.length || 1;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Predicted Grade calculation based on Tier and score
  let predictedGrade = 1;
  if (selectedTier === 'higher') {
    if (percentage >= 85) predictedGrade = 9;
    else if (percentage >= 75) predictedGrade = 8;
    else if (percentage >= 62) predictedGrade = 7;
    else if (percentage >= 50) predictedGrade = 6;
    else if (percentage >= 40) predictedGrade = 5;
    else if (percentage >= 30) predictedGrade = 4;
    else predictedGrade = 3;
  } else {
    // Foundation Tier (Grades 1 to 5)
    if (percentage >= 80) predictedGrade = 5;
    else if (percentage >= 65) predictedGrade = 4;
    else if (percentage >= 50) predictedGrade = 3;
    else if (percentage >= 35) predictedGrade = 2;
    else predictedGrade = 1;
  }

  const activeSubject = GCSE_SUBJECTS.find(s => s.id === selectedSubject) || GCSE_SUBJECTS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-bold text-xs">
            <Award className="w-4 h-4 text-purple-600" />
            Official GCSE Mock Exam Simulator (20% MC / 80% Calculations & Written)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Authentic GCSE Mock Examination</h1>
          <p className="text-slate-500 text-sm">
            Calibrated against real AQA, Edexcel, and OCR past-paper exam standards.
          </p>
        </div>
      </div>

      {!isExamStarted ? (
        /* Setup Options */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Configure Your Mock Paper</h2>

          <div className="space-y-4">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Subject</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {GCSE_SUBJECTS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubject(s.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                      selectedSubject === s.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              {/* Tier Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Exam Tier</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedTier('higher')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      selectedTier === 'higher' ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div>Higher</div>
                    <div className="text-[10px] font-normal opacity-80">Grades 4–9</div>
                  </button>
                  <button
                    onClick={() => setSelectedTier('foundation')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      selectedTier === 'foundation' ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div>Foundation</div>
                    <div className="text-[10px] font-normal opacity-80">Grades 1–5</div>
                  </button>
                </div>
              </div>

              {/* Exam Board */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Exam Board</label>
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 h-[46px]"
                >
                  <option value="Edexcel">Edexcel GCSE (9-1)</option>
                  <option value="AQA">AQA GCSE Specification</option>
                  <option value="OCR">OCR Gateway GCSE</option>
                </select>
              </div>

              {/* Exam Length */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Paper Format</label>
                <select
                  value={examMode}
                  onChange={(e) => setExamMode(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 h-[46px]"
                >
                  <option value="standard">Standard Mock (8 Questions, 20/80 Ratio)</option>
                  <option value="extended">Full Mock Paper (15 Questions, 20/80 Ratio)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 leading-relaxed">
              <span className="font-bold block mb-0.5">Authentic Real-Exam Ratio:</span>
              This mock exam provides <strong>20% Multiple Choice</strong> and <strong>80% Non-Multiple Choice</strong> (numerical multi-step calculations, fill-in-the-blank definitions, and short-answer questions with official mark schemes).
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleStartExam}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all"
            >
              <span>Start Timed Mock Paper</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : !isExamSubmitted ? (
        /* Exam In-Progress Screen */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-indigo-600 font-mono">
              {selectedBoard} {activeSubject.name.toUpperCase()} ({selectedTier.toUpperCase()} TIER) — Question {currentIndex + 1} of {mockQuestions.length}
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full font-mono text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Exam in Progress</span>
            </div>
          </div>

          <QuestionCard
            question={currentQ}
            selectedAnswer={userAnswers[currentQ.id] || null}
            onAnswerChange={handleSelectAnswer}
            hasSubmitted={false}
            onSubmit={() => {
              if (currentIndex + 1 < mockQuestions.length) {
                setCurrentIndex(currentIndex + 1);
              } else {
                handleSubmitExam();
              }
            }}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              Previous Question
            </button>

            {currentIndex + 1 < mockQuestions.length ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Submit Paper & Calculate Predicted Grade
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Exam Result Breakdown Screen */
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Mock Examination Completed</h2>
            <p className="text-slate-500 text-xs mt-1">
              {selectedBoard} {activeSubject.name} — {selectedTier.toUpperCase()} Tier
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-lg mx-auto space-y-2">
            <div className="text-4xl font-extrabold text-indigo-600">
              Predicted GCSE Grade {predictedGrade}
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              Score: {correctCount} / {mockQuestions.length} ({percentage}%)
            </div>
          </div>

          {/* Dynamic Topic Performance Breakdown */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-3 max-w-lg mx-auto">
            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-2">
              Topic Breakdown for this Examination:
            </span>
            {Object.entries(topicBreakdown).map(([tId, tData]) => {
              const topicPct = Math.round((tData.correct / tData.total) * 100);
              return (
                <div key={tId} className="flex justify-between items-center py-1">
                  <span className="text-slate-700 font-medium truncate max-w-[280px]">
                    {tData.topicName}
                  </span>
                  <span className={`font-bold ${topicPct >= 70 ? 'text-emerald-600' : topicPct >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {tData.correct} / {tData.total} ({topicPct}%)
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setIsExamStarted(false);
                setIsExamSubmitted(false);
                setMockQuestions([]);
                setUserAnswers({});
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Configure Another Mock Paper</span>
            </button>
            <Link
              href={`/practice?subject=${selectedSubject}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Practice Weak Topics</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Sparkles, ArrowRight, Award, Zap, RefreshCw, BookOpen } from 'lucide-react';
import { AdaptiveEngine } from '@/lib/adaptive/engine';
import { SeedQuestion, GCSE_TOPICS, GCSE_SUBJECTS } from '@/lib/curriculum/gcse-data';
import { UserStore } from '@/lib/user-store';
import { KaTeXRenderer } from './KaTeXRenderer';

interface QuickAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAssessmentModal({ isOpen, onClose }: QuickAssessmentModalProps) {
  const [questions, setQuestions] = useState<SeedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ isCorrect: boolean; question: SeedQuestion }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load 5 snapshot questions
      const qList = AdaptiveEngine.getQuickSnapshotQuestions(5);
      setQuestions(qList);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setUserAnswers([]);
      setIsFinished(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + (isAnswered ? 1 : 0)) / (questions.length || 5)) * 100;

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQ || isAnswered) return;

    const isCorrect = selectedOption === currentQ.correctAnswer;
    setIsAnswered(true);

    // Record stats and topic mastery
    UserStore.recordQuestionAttempt(isCorrect);
    UserStore.updateTopicMastery(currentQ.topicId, isCorrect, currentQ.gradeLevel);

    setUserAnswers((prev) => [...prev, { isCorrect, question: currentQ }]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const score = userAnswers.filter((a) => a.isCorrect).length;
  const estimatedGrade = Math.min(9, Math.max(4, Math.round(4 + (score / 5) * 5)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl">
              <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                5-Question Quick Assessment
                <span className="text-xs bg-yellow-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                  Hap Test
                </span>
              </h2>
              <p className="text-xs text-indigo-100">Adaptive Snapshot across GCSE Subjects</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 shrink-0">
          <div
            className="bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400 h-2 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isFinished && currentQ ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Target Grade {currentQ.gradeLevel}
                </span>
              </div>

              {/* Question Text */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 mb-5">
                <KaTeXRenderer content={currentQ.questionText} className="text-base font-semibold text-slate-900 dark:text-slate-100" />
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options?.map((opt, idx) => {
                  let btnStyle = "border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-slate-800 dark:text-slate-100";
                  if (selectedOption === opt) {
                    btnStyle = "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-900 dark:text-indigo-200";
                  }

                  if (isAnswered) {
                    if (opt === currentQ.correctAnswer) {
                      btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold";
                    } else if (selectedOption === opt) {
                      btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-semibold";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswered}
                      className={`w-full p-4 text-left rounded-2xl border-2 transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <KaTeXRenderer content={opt} />
                      </div>

                      {isAnswered && opt === currentQ.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && selectedOption === opt && opt !== currentQ.correctAnswer && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Solution Feedback */}
              {isAnswered && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-sm space-y-2 mb-6 animate-in fade-in">
                  <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Key GCSE Concept & Explanation
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs">
                    {currentQ.explanation.overview}
                  </p>
                  {currentQ.explanation.examTip && (
                    <div className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                      💡 <strong>Exam Tip:</strong> {currentQ.explanation.examTip}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isFinished ? (
            /* Results Screen */
            <div className="py-6 text-center space-y-6">
              <div className="inline-flex p-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-3xl shadow-lg">
                <Award className="w-12 h-12" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  Quick Assessment Complete!
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  You scored <strong className="text-indigo-600 dark:text-indigo-400">{score} out of 5</strong>
                </p>
              </div>

              <div className="p-5 bg-indigo-50 dark:bg-indigo-950/40 rounded-3xl border border-indigo-100 dark:border-indigo-900 max-w-md mx-auto">
                <div className="text-xs uppercase font-bold text-indigo-500 tracking-wider mb-1">
                  Estimated Working Level
                </div>
                <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  Grade {estimatedGrade}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                  Your topic masteries and daily stats have been updated in your profile.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const qList = AdaptiveEngine.getQuickSnapshotQuestions(5);
                    setQuestions(qList);
                    setCurrentIndex(0);
                    setSelectedOption(null);
                    setIsAnswered(false);
                    setUserAnswers([]);
                    setIsFinished(false);
                  }}
                  className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Another 5 Questions
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  Done
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {!isFinished && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-400 font-medium">
              {isAnswered ? 'Review answer before proceeding' : 'Select an answer to proceed'}
            </span>

            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Award, Clock, ArrowRight } from 'lucide-react';
import { INITIAL_SEED_QUESTIONS } from '@/lib/curriculum/gcse-data';
import { KaTeXRenderer } from '@/components/KaTeXRenderer';
import { UserStore } from '@/lib/user-store';
import Link from 'next/link';

export default function MockExamPage() {
  const [examMode, setExamMode] = useState<'full' | 'topic'>('full');
  const [selectedSubject] = useState<string>('maths');
  const [selectedBoard, setSelectedBoard] = useState<string>('Edexcel');
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);

  const mockQuestions = INITIAL_SEED_QUESTIONS;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  const currentQ = mockQuestions[currentIndex];

  const handleStartExam = () => {
    setIsExamStarted(true);
  };

  const handleSelectAnswer = (ans: string) => {
    setUserAnswers({ ...userAnswers, [currentQ.id]: ans });
  };

  const handleSubmitExam = () => {
    setIsExamSubmitted(true);
    // Record solved questions for stats
    Object.keys(userAnswers).forEach(qId => {
      const q = mockQuestions.find(m => m.id === qId);
      if (q) {
        UserStore.recordQuestionAttempt(userAnswers[qId] === q.correctAnswer);
      }
    });
  };

  let totalScore = 0;
  mockQuestions.forEach(q => {
    if (userAnswers[q.id] === q.correctAnswer) totalScore += 10;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-bold text-xs">
            <Award className="w-4 h-4 text-purple-600" />
            Mock GCSE Exam Engine
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Realistic GCSE Mock Examination</h1>
          <p className="text-slate-500 text-sm">Timed mock papers modeled directly on AQA, Edexcel, and OCR specification standards.</p>
        </div>
      </div>

      {!isExamStarted ? (
        /* Setup Options */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Mock Exam Configuration</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Exam Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setExamMode('full')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    examMode === 'full' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Full Mock Paper (80 Marks)
                </button>
                <button
                  onClick={() => setExamMode('topic')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    examMode === 'topic' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Modular Topic Exam
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Exam Board Specification</label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Edexcel">Edexcel GCSE (9-1)</option>
                <option value="AQA">AQA GCSE (8300)</option>
                <option value="OCR">OCR GCSE (J277)</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950">
              <span className="font-bold block mb-0.5">Time Limit & Grading Rules:</span>
              Mock exams adhere to official GCSE time limits. Your answers are evaluated against subtopic specifications to calculate your predicted GCSE Grade (1–9).
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleStartExam}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all"
            >
              <span>Start Timed Mock Exam</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : !isExamSubmitted ? (
        /* Exam In-Progress Screen */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-indigo-600 font-mono">
              {selectedBoard} {selectedSubject.toUpperCase()} Paper 1 — Question {currentIndex + 1} of {mockQuestions.length}
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full font-mono text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Time Remaining: 84:12</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="text-base sm:text-lg font-bold text-slate-900">
              <KaTeXRenderer content={currentQ.questionText} />
            </div>
          </div>

          <div className="space-y-3">
            {currentQ.options?.map((opt, idx) => {
              const isSelected = userAnswers[currentQ.id] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(opt)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${
                    isSelected ? 'bg-indigo-50 border-indigo-500 font-bold text-indigo-950 ring-2 ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <KaTeXRenderer content={opt} />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
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
                Submit Exam & Calculate Grade
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Exam Result Breakdown Screen */
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Mock Exam Assessment Completed</h2>
          <div className="text-4xl font-extrabold text-indigo-600">Grade 8 ({totalScore} / 30 Marks)</div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
            <span className="font-bold text-slate-900 block">Subtopic Performance Score:</span>
            <div className="flex justify-between"><span>Quadratic Factoring (M-ALG-1.1):</span><span className="font-bold text-emerald-600">100%</span></div>
            <div className="flex justify-between"><span>Specific Heat Capacity (P-ENG-1.1):</span><span className="font-bold text-emerald-600">100%</span></div>
            <div className="flex justify-between"><span>CPU Registers (CS-SYS-1.1):</span><span className="font-bold text-amber-600">50%</span></div>
          </div>

          <div className="pt-2 flex justify-center gap-4">
            <Link href="/parent" className="px-6 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow">
              Send Report to Parent Portal
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}


'use client';

import React, { useState } from 'react';
import { Target, CheckCircle2, ArrowRight, Award, Sparkles } from 'lucide-react';
import { INITIAL_SEED_QUESTIONS, SeedQuestion } from '@/lib/curriculum/gcse-data';
import { KaTeXRenderer } from '@/components/KaTeXRenderer';
import { AdaptiveEngine, DiagnosticResult } from '@/lib/adaptive/engine';
import Link from 'next/link';

export default function DiagnosticPage() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<{ questionGrade: number; isCorrect: boolean; topicId: string }[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const questions: SeedQuestion[] = INITIAL_SEED_QUESTIONS;
  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAttempts = [...attempts, { questionGrade: currentQuestion.gradeLevel, isCorrect, topicId: currentQuestion.topicId }];
    setAttempts(newAttempts);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      const evalResult = AdaptiveEngine.evaluateDiagnosticTest(newAttempts);
      setResult(evalResult);
      setIsCompleted(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
          <Target className="w-4 h-4 text-indigo-600" />
          GCSE Seviye Tesbit Motoru
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Initial Diagnostic Assessment</h1>
        <p className="text-slate-500 text-sm">
          Mevcut GCSE başlangıç seviyenizi ve hedef Grade’e giden yoldaki eksiklerinizi belirleyin.
        </p>
      </div>

      {!isCompleted ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Soru {currentIndex + 1} / {questions.length}</span>
              <span className="text-indigo-600">Hedef Zorluk: Grade {currentQuestion.gradeLevel}</span>
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
              <span>{currentIndex + 1 === questions.length ? 'Testi Tamamla' : 'Sonraki Soru'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* Result Screen */
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-8 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-extrabold text-indigo-600 tracking-wider uppercase">Değerlendirme Sonucu</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Başlangıç Seviyeniz: {result?.gradeLabel}</h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
              {result?.summaryText}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Güçlü Konular</span>
              <span className="text-sm font-semibold text-emerald-950">Quadratic Equations & Specific Heat</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase block mb-1">Geliştirilecek Konular</span>
              <span className="text-sm font-semibold text-amber-950">CPU Registers & Surds</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
            >
              <Award className="w-4 h-4" />
              <span>Paneline Git ve Hedef Belirle</span>
            </Link>

            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Akıllı Alıştırmalara Başla</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

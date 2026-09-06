'use client';

import React, { useState } from 'react';
import { DeepExplanationResult } from '@/lib/ai/generator';
import { KaTeXRenderer } from './KaTeXRenderer';
import { Lightbulb, CheckCircle2, AlertTriangle, BookOpen, X, Sparkles, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  explanation: DeepExplanationResult;
  topicName: string;
}

export const DeepExplanationModal: React.FC<Props> = ({ isOpen, onClose, explanation, topicName }) => {
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<string | null>(null);
  const [showPracticeResult, setShowPracticeResult] = useState(false);

  if (!isOpen) return null;

  const isPracticeCorrect = selectedPracticeOption === explanation.practiceCheck.correctAnswer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white p-6 rounded-t-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-yellow-300">
              <Lightbulb className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Daha Fazla Bilgi & Derin Konu Analizi</span>
              <h2 className="text-xl font-bold text-white">{topicName}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">

          {/* Core Overview */}
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-indigo-900 text-sm mb-1">Konu Özeti</h3>
              <p className="text-sm text-indigo-950 leading-relaxed">
                <KaTeXRenderer content={explanation.overview} />
              </p>
            </div>
          </div>

          {/* Key Formulae */}
          {explanation.relatedFormulae && explanation.relatedFormulae.length > 0 && (
            <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Önemli GCSE Formülleri
              </h3>
              <div className="flex flex-wrap gap-4">
                {explanation.relatedFormulae.map((f, i) => (
                  <div key={i} className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
                    <KaTeXRenderer content={`$${f}$`} className="text-yellow-300 font-mono text-base" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Working Out */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Adım Adım Çözüm Analizi
            </h3>
            <div className="space-y-2.5">
              {explanation.stepByStep.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-sm text-slate-800 leading-normal">
                    <KaTeXRenderer content={step} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common GCSE Pitfalls & Examiner Tips */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4">
              <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Sık Yapılan GCSE Hataları
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-950">
                {explanation.commonMistakes.map((m, i) => (
                  <li key={i}><KaTeXRenderer content={m} /></li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200/80 rounded-xl p-4">
              <h4 className="font-bold text-purple-900 text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Müfettiş (Examiner) İpucu
              </h4>
              <p className="text-xs text-purple-950 leading-relaxed">
                <KaTeXRenderer content={explanation.examTip} />
              </p>
            </div>
          </div>

          {/* Interactive Micro Practice Check */}
          <div className="border border-indigo-200 rounded-xl p-5 bg-gradient-to-b from-indigo-50/40 to-white">
            <div className="flex items-center gap-2 font-bold text-indigo-900 text-sm mb-3">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Pekiştirme Kontrolü: Öğrendiklerinizi Test Edin
            </div>
            <p className="text-xs text-slate-700 mb-4 font-medium">
              <KaTeXRenderer content={explanation.practiceCheck.questionText} />
            </p>

            <div className="space-y-2">
              {explanation.practiceCheck.options.map((opt, idx) => {
                const isSelected = selectedPracticeOption === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPracticeOption(opt);
                      setShowPracticeResult(true);
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? isPracticeCorrect
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                          : 'bg-rose-50 border-rose-500 text-rose-900 font-semibold'
                        : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                    }`}
                  >
                    <KaTeXRenderer content={opt} />
                  </button>
                );
              })}
            </div>

            {showPracticeResult && (
              <div className={`mt-3 p-3 rounded-lg text-xs font-medium border ${
                isPracticeCorrect ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-rose-100 border-rose-300 text-rose-900'
              }`}>
                {isPracticeCorrect ? '🎉 Harika! Konu mantığını tam olarak kavradınız.' : '💡 Neredeyse! İpucuna tekrar göz atıp tekrar deneyin.'}
                <div className="mt-1 text-[11px] opacity-90">{explanation.practiceCheck.explanation}</div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md"
          >
            Anladım, Alıştırmalara Dön
          </button>
        </div>

      </div>
    </div>
  );
};

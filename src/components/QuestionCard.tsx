'use client';

import React, { useState } from 'react';
import { SeedQuestion } from '@/lib/curriculum/gcse-data';
import { KaTeXRenderer } from '@/components/KaTeXRenderer';
import { validateAnswer } from '@/lib/ai/generator';
import { CheckCircle2, XCircle, Sparkles, HelpCircle, FileText, Send } from 'lucide-react';

interface QuestionCardProps {
  question: SeedQuestion;
  selectedAnswer: string | null;
  onAnswerChange: (ans: string) => void;
  hasSubmitted: boolean;
  onSubmit: () => void;
  onNext?: () => void;
  onDeepAnalysis?: () => void;
  loading?: boolean;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onAnswerChange,
  hasSubmitted,
  onSubmit,
  onNext,
  onDeepAnalysis,
  loading = false,
}: QuestionCardProps) {
  const [textInput, setTextInput] = useState<string>(selectedAnswer || '');

  React.useEffect(() => {
    setTextInput(selectedAnswer || '');
  }, [selectedAnswer, question.id]);

  // Math helper symbols for keyboard toolbar
  const mathSymbols = [
    { label: 'x²', value: '^2' },
    { label: '√x', value: '\\sqrt{}' },
    { label: 'π', value: '\\pi' },
    { label: 'θ', value: '\\theta' },
    { label: 'a/b', value: '\\frac{a}{b}' },
    { label: '±', value: '\\pm' },
    { label: '≈', value: '\\approx' },
    { label: 'Δ', value: '\\Delta' },
  ];

  const handleInsertSymbol = (sym: string) => {
    const newVal = textInput + sym;
    setTextInput(newVal);
    onAnswerChange(newVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextInput(val);
    onAnswerChange(val);
  };

  const evalResult = hasSubmitted ? validateAnswer(question, selectedAnswer || textInput) : null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
      
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full font-mono text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            Target Grade {question.gradeLevel} Question
          </span>
          <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-900 rounded-full text-xs font-semibold flex items-center gap-1">
            📜 {question.examBoard || 'AQA'} {question.paperYear || 2024} ({question.paperName || 'Paper 1'})
          </span>
          <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-xs font-semibold uppercase tracking-wide">
            {question.questionType.replace('_', ' ')}
          </span>
          {question.subtopicName && (
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-semibold flex items-center gap-1">
              🎯 {question.subtopicName}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-slate-400">ID: {question.id}</span>
      </div>

      {/* Question Body */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
          <KaTeXRenderer content={question.questionText} />
        </div>
        {question.fillInTemplate && question.questionType === 'fill_in_blank' && (
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-sm font-medium text-indigo-950">
            <KaTeXRenderer content={question.fillInTemplate} />
          </div>
        )}
      </div>

      {/* Inputs according to questionType */}
      {question.questionType === 'multiple_choice' ? (
        /* 1. Multiple Choice Options */
        <div className="space-y-3">
          {question.options?.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            let btnStyle = 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800';

            if (hasSubmitted) {
              if (option === question.correctAnswer) {
                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
              } else if (isSelected) {
                btnStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-500/20';
              }
            } else if (isSelected) {
              btnStyle = 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold ring-2 ring-indigo-500/20';
            }

            return (
              <button
                key={idx}
                disabled={hasSubmitted}
                onClick={() => onAnswerChange(option)}
                className={`w-full text-left p-4 rounded-2xl border-2 text-sm transition-all flex items-center justify-between ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <KaTeXRenderer content={option} />
                </div>

                {hasSubmitted && option === question.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {hasSubmitted && isSelected && option !== question.correctAnswer && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* 2. Written / Numerical Input Options */
        <div className="space-y-4">
          
          {/* Math Helper Toolbar */}
          {!hasSubmitted && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-2 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Symbol Helper:</span>
              {mathSymbols.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertSymbol(s.value)}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-mono font-bold text-slate-800 transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Text/Number Input */}
          {question.questionType === 'short_answer' ? (
            <textarea
              rows={4}
              disabled={hasSubmitted}
              value={textInput}
              onChange={handleInputChange}
              placeholder="Type your complete written answer, key terms, or working steps..."
              className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium bg-white text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50"
            />
          ) : (
            <div className="relative">
              <input
                type={question.questionType === 'numerical' ? 'text' : 'text'}
                disabled={hasSubmitted}
                value={textInput}
                onChange={handleInputChange}
                placeholder={
                  question.questionType === 'numerical'
                    ? 'Enter exact numerical value (e.g. 12.5 or 25/2)...'
                    : 'Type answer term here...'
                }
                className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold bg-white text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50"
              />
              {question.numericalTolerance && (
                <span className="absolute right-4 top-4 text-xs font-medium text-slate-400">
                  Tolerance: ±{question.numericalTolerance}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submission Action */}
      {!hasSubmitted ? (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onSubmit}
            disabled={!selectedAnswer && !textInput.trim()}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all"
          >
            <span>Submit Answer</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Feedback & Mark Scheme Display */
        <div className="space-y-4 animate-in fade-in">
          <div className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            evalResult?.isCorrect ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center gap-3">
              {evalResult?.isCorrect ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-base">
                  {evalResult?.isCorrect ? 'Correct Answer! 🎉' : 'Review official model answer below.'}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">{evalResult?.feedback}</p>
              </div>
            </div>

            {onDeepAnalysis && (
              <button
                onClick={onDeepAnalysis}
                className="px-4 py-2 bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold shadow-sm shrink-0 flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Deep Solution Analysis</span>
              </button>
            )}
          </div>

          {/* Mark Scheme Guidance */}
          {question.markScheme && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
              <div className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <FileText className="w-4 h-4 text-indigo-600" />
                Official GCSE Mark Scheme Rubric:
              </div>
              <div className="text-slate-800 font-mono whitespace-pre-line leading-relaxed">
                <KaTeXRenderer content={question.markScheme} />
              </div>
            </div>
          )}

          {/* Next Question Action */}
          {onNext && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onNext}
                disabled={loading}
                className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>{loading ? 'Loading Next...' : 'Next Adaptive Question'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

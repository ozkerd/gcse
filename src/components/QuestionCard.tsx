'use client';

import React, { useState } from 'react';
import { SeedQuestion } from '@/lib/curriculum/gcse-data';
import { KaTeXRenderer } from '@/components/KaTeXRenderer';
import { validateAnswer } from '@/lib/ai/generator';
import { CheckCircle2, XCircle, HelpCircle, FileText, Send, Award } from 'lucide-react';

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

/**
 * Intelligent helper to determine if a question requires math/calculation symbols.
 * Returns false for humanities (English, History), qualitative sciences, and general theory.
 */
function isMathOrCalculationQuestion(q: SeedQuestion): boolean {
  if (!q) return false;
  // Mathematics & Physics almost always involve calculations or formulas
  if (q.topicId.startsWith('m-') || q.topicId.startsWith('p-')) return true;
  // Numerical question type always accepts calculations
  if (q.questionType === 'numerical') return true;
  // Chemistry calculations (moles, enthalpy, bond energy)
  if (q.topicId.startsWith('ch-')) {
    const text = (q.questionText || '').toLowerCase();
    if (text.includes('$') || text.includes('calculate') || text.includes('mass') || text.includes('mole') || text.includes('energy') || text.includes('volume')) {
      return true;
    }
  }
  // Economics & Business numerical problems
  if (q.topicId.startsWith('econ-') || q.topicId.startsWith('bus-')) {
    const text = (q.questionText || '').toLowerCase();
    if (text.includes('calculate') || text.includes('ped') || text.includes('break-even') || text.includes('margin') || text.includes('%')) {
      return true;
    }
  }
  // Check if text or correct answer has math notation
  const text = q.questionText || '';
  const ans = q.correctAnswer || '';
  if (text.includes('$') || text.includes('\\sqrt') || text.includes('^2') || text.includes('^3') || ans.includes('√') || ans.includes('π') || ans.includes('°')) {
    return true;
  }
  return false;
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
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    setTextInput(selectedAnswer || '');
  }, [selectedAnswer, question.id]);

  // Clean Unicode math helper symbols (only rendered when needed)
  const mathSymbols = [
    { label: '√', value: '√', title: 'Square Root' },
    { label: 'π', value: 'π', title: 'Pi' },
    { label: 'x²', value: '²', title: 'Squared' },
    { label: 'x³', value: '³', title: 'Cubed' },
    { label: '±', value: '±', title: 'Plus-minus' },
    { label: '°', value: '°', title: 'Degrees' },
    { label: 'θ', value: 'θ', title: 'Theta' },
    { label: '×', value: '×', title: 'Multiply' },
    { label: '÷', value: '÷', title: 'Divide' },
    { label: '≈', value: '≈', title: 'Approximately' },
  ];

  const handleInsertSymbol = (sym: string) => {
    const el = inputRef.current;
    if (el && typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const currentVal = textInput || '';
      const newVal = currentVal.substring(0, start) + sym + currentVal.substring(end);
      setTextInput(newVal);
      onAnswerChange(newVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + sym.length, start + sym.length);
      }, 0);
    } else {
      const newVal = (textInput || '') + sym;
      setTextInput(newVal);
      onAnswerChange(newVal);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextInput(val);
    onAnswerChange(val);
  };

  const evalResult = hasSubmitted ? validateAnswer(question, selectedAnswer || textInput) : null;
  const showSymbolHelper = isMathOrCalculationQuestion(question);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-2xl space-y-6 transition-colors">
      
      {/* Distraction-Free Top Context Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-[11px] tracking-wide">
            Grade {question.gradeLevel}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            {question.examBoard || 'AQA'}{question.paperName ? ` • ${question.paperName}` : ''}
          </span>
          {question.subtopicName && (
            <>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                {question.subtopicName}
              </span>
            </>
          )}
        </div>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {question.questionType === 'multiple_choice'
            ? 'Multiple Choice'
            : question.questionType === 'numerical'
            ? 'Calculation'
            : 'Written Answer'}
        </span>
      </div>

      {/* Hero Question Text Container */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
        <div className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-50 leading-relaxed sm:leading-loose tracking-normal">
          <KaTeXRenderer content={question.questionText} />
        </div>
        {question.fillInTemplate && question.questionType === 'fill_in_blank' && question.fillInTemplate !== question.questionText && (
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-base font-medium text-indigo-950 dark:text-indigo-200">
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
            let btnStyle = 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-900 dark:text-slate-100 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30';

            if (hasSubmitted) {
              if (option === question.correctAnswer) {
                btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-bold ring-2 ring-emerald-500/20';
              } else if (isSelected) {
                btnStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 dark:border-rose-600 text-rose-950 dark:text-rose-100 font-bold ring-2 ring-rose-500/20';
              }
            } else if (isSelected) {
              btnStyle = 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-950 dark:text-indigo-100 font-semibold ring-2 ring-indigo-500/30';
            }

            return (
              <button
                key={idx}
                disabled={hasSubmitted}
                onClick={() => onAnswerChange(option)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 text-base sm:text-lg transition-all flex items-center justify-between shadow-sm ${btnStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">
                    <KaTeXRenderer content={option} />
                  </span>
                </div>

                {hasSubmitted && option === question.correctAnswer && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {hasSubmitted && isSelected && option !== question.correctAnswer && (
                  <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* 2. Written / Numerical Input Options */
        <div className="space-y-4">
          
          {/* Math Helper Toolbar - Only rendered when question needs it */}
          {!hasSubmitted && showSymbolHelper && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 transition-all">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
                Math Symbols:
              </span>
              {mathSymbols.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  title={s.title}
                  onClick={() => handleInsertSymbol(s.value)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-400 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-100 transition-all shadow-sm active:scale-95"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Text/Number Input */}
          {question.questionType === 'short_answer' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Your Answer / Working Steps:
              </label>
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                rows={4}
                disabled={hasSubmitted}
                value={textInput}
                onChange={handleInputChange}
                placeholder="Type your complete written answer, key terms, or working steps..."
                className="w-full p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/20 text-base sm:text-lg font-medium leading-relaxed bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 shadow-sm transition-all"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Your Answer:
              </label>
              <div className="relative">
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  disabled={hasSubmitted}
                  value={textInput}
                  onChange={handleInputChange}
                  placeholder={
                    question.questionType === 'numerical'
                      ? 'Enter exact numerical value (e.g. 12.5 or 25/2)...'
                      : 'Type answer term here...'
                  }
                  className="w-full p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/20 text-lg sm:text-xl font-bold font-mono tracking-wide bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 shadow-sm transition-all"
                />
                {typeof question.numericalTolerance === 'number' && question.numericalTolerance > 0 ? (
                  <span className="absolute right-4 top-5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                    Tolerance: ±{question.numericalTolerance}
                  </span>
                ) : null}
              </div>
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
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <span>Submit Answer</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Feedback & Mark Scheme Display */
        <div className="space-y-4 animate-in fade-in">
          <div className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            evalResult?.isCorrect
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100'
          }`}>
            <div className="flex items-center gap-3">
              {evalResult?.isCorrect ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0" />
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
                className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-sm shrink-0 flex items-center gap-1.5 transition-all"
              >
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Deep Solution Analysis</span>
              </button>
            )}
          </div>

          {/* Official GCSE Mark Scheme Breakdown */}
          {evalResult?.marksBreakdown && evalResult.marksBreakdown.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Official GCSE Mark Scheme Assessment:
                </span>
                <span className={`px-2.5 py-1 rounded-full font-mono text-xs font-black ${
                  evalResult.marksAwarded === evalResult.maxMarks
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                    : evalResult.marksAwarded > 0
                    ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                    : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                }`}>
                  Score: {evalResult.marksAwarded} / {evalResult.maxMarks} Marks
                </span>
              </div>

              <div className="space-y-1.5">
                {evalResult.marksBreakdown.map((crit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold shrink-0 ${
                      crit.awarded
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
                    }`}>
                      {crit.awarded ? '✓' : '✗'} {crit.code}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{crit.name}:</span>
                    <span className="text-slate-600 dark:text-slate-400 truncate">{crit.description}</span>
                  </div>
                ))}
              </div>

              {evalResult.examinerNote && (
                <div className="mt-2 p-2.5 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                  <strong>Examiner Guidance:</strong> {evalResult.examinerNote}
                </div>
              )}
            </div>
          )}

          {/* Mark Scheme Guidance */}
          {question.markScheme && (
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl space-y-1 text-xs">
              <div className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Exam Board Specification Rubric:
              </div>
              <div className="text-indigo-950 dark:text-indigo-100 font-mono whitespace-pre-line leading-relaxed">
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
                className="px-8 py-3.5 rounded-2xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
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

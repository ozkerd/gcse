'use client';

import React from 'react';
import { FormattedText } from './FormattedText';
import { CheckCircle2, AlertTriangle, Sparkles, Calculator, BookOpen } from 'lucide-react';

interface PodVisualDiagramProps {
  topicName: string;
  unitName?: string;
  visualType: 'formula_spotlight' | 'three_pillars' | 'worked_hack' | 'trap_vs_top';
  headlineFormula: string;
  goldenFormulae: string[];
  keyTakeaways: string[];
  keywords?: string[];
  comparison?: {
    commonTrap: string;
    grade9Fix: string;
  };
  activeDialogueIdx: number;
  isPlaying: boolean;
}

export const PodVisualDiagram: React.FC<PodVisualDiagramProps> = ({
  topicName,
  visualType,
  headlineFormula,
  goldenFormulae,
  keyTakeaways,
  keywords = [],
  comparison,
  activeDialogueIdx,
  isPlaying,
}) => {
  // SLIDE 1: Topic-Specific Formula & Key Concept Board (No generic pyramid!)
  if (visualType === 'formula_spotlight') {
    const formulasToDisplay =
      goldenFormulae && goldenFormulae.length > 0
        ? goldenFormulae.slice(0, 3)
        : [headlineFormula];

    return (
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-indigo-400/30 shadow-inner space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Key Formulae & Rules for {topicName}</span>
          </span>
        </div>

        <div
          className={`grid gap-3 ${
            formulasToDisplay.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {formulasToDisplay.map((f, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                idx === 0
                  ? 'bg-indigo-950/90 border-indigo-400/50 text-amber-200 sm:col-span-2'
                  : 'bg-slate-900/90 border-white/15 text-indigo-100'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-300 mb-1">
                {idx === 0 ? 'Primary Rule / Formula' : `Key Relationship #${idx + 1}`}
              </div>
              <div className="text-sm sm:text-base font-bold overflow-x-auto">
                <FormattedText text={f.includes('\\') ? `$$${f}$$` : f} />
              </div>
            </div>
          ))}
        </div>

        {keywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 mr-1">
              Key Exam Terms:
            </span>
            {keywords.slice(0, 6).map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-lg bg-white/10 text-indigo-200 text-xs font-semibold"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // SLIDE 2: 3-Step Method Board (Highlights active step as Dan & Mia speak)
  if (visualType === 'three_pillars') {
    return (
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-indigo-400/30 space-y-3">
        <div className="text-xs font-extrabold uppercase tracking-wider text-pink-300">
          Step-by-Step Exam Method
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {keyTakeaways.slice(0, 3).map((stepText, idx) => {
            const isActiveStep = isPlaying && activeDialogueIdx === idx;
            const cleanText = stepText.replace(/^(Rule|Step)\s*\d+\s*:\s*/i, '');
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isActiveStep
                    ? 'bg-indigo-600/40 border-pink-400 shadow-lg scale-[1.02]'
                    : 'bg-slate-900/90 border-white/15'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-200 font-black text-xs">
                      Step {idx + 1}
                    </span>
                    {isActiveStep && (
                      <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-white font-semibold leading-relaxed">
                    <FormattedText text={cleanText} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // SLIDE 3: Worked Exam Solution Whiteboard
  if (visualType === 'worked_hack') {
    return (
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-400/30 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Worked Solution Steps</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-amber-200 text-xs font-extrabold">
            <FormattedText text={headlineFormula} />
          </span>
        </div>

        <div className="space-y-2">
          {keyTakeaways.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-start gap-3 text-xs sm:text-sm text-slate-100 font-medium"
            >
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="leading-relaxed">
                <FormattedText text={step} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // SLIDE 4: Common Mistake vs Top Grade Tip
  return (
    <div className="grid sm:grid-cols-2 gap-3.5">
      <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 space-y-2">
        <div className="font-extrabold text-rose-300 text-xs uppercase flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Mistake to Avoid</span>
        </div>
        <p className="text-xs sm:text-sm text-rose-100 leading-relaxed font-medium">
          {comparison?.commonTrap || keyTakeaways[0]}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 space-y-2">
        <div className="font-extrabold text-emerald-300 text-xs uppercase flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Top Grade Exam Tip</span>
        </div>
        <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium">
          {comparison?.grade9Fix || keyTakeaways[1]}
        </p>
      </div>
    </div>
  );
};

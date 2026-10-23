'use client';

import React from 'react';
import { FormattedText } from './FormattedText';

interface PodVisualDiagramProps {
  subjectId: string;
  topicName: string;
  visualType: 'formula_spotlight' | 'three_pillars' | 'worked_hack' | 'trap_vs_top';
  headlineFormula: string;
  activeDialogueIdx: number;
  isPlaying: boolean;
}

interface TriangleNodes {
  topLabel: string;
  topSub: string;
  leftLabel: string;
  leftSub: string;
  rightLabel: string;
  rightSub: string;
  operatorCenter: string;
  diagramCaption: string;
}

function getSubjectTriangleNodes(subjectId: string, topicName: string): TriangleNodes {
  switch (subjectId) {
    case 'physics':
      return {
        topLabel: 'Total Energy / Voltage (V, E, F)',
        topSub: 'SI Units: J, V, N',
        leftLabel: 'Current / Mass (I, m, f)',
        leftSub: 'SI Units: A, kg, Hz',
        rightLabel: 'Resistance / Accel (R, a, λ)',
        rightSub: 'SI Units: Ω, m/s², m',
        operatorCenter: '×',
        diagramCaption: 'Cover the unknown variable in the triangle to see whether to multiply (base × base) or divide (top ÷ base).',
      };
    case 'chemistry':
      return {
        topLabel: 'Mass (g) or Moles (n)',
        topSub: 'Convert cm³ ÷ 1000 → dm³',
        leftLabel: 'Moles (n) / Conc (c)',
        leftSub: 'mol or mol/dm³',
        rightLabel: 'Mr (g/mol) / Vol (dm³)',
        rightSub: 'Periodic Table Ar',
        operatorCenter: '×',
        diagramCaption: 'Quantitative Chemistry Triangle: Mass = Moles × Mr  |  Moles = Concentration × Volume (dm³).',
      };
    case 'biology':
      return {
        topLabel: 'Image Size (I)',
        topSub: 'Convert mm × 1000 → μm',
        leftLabel: 'Actual Size (A)',
        leftSub: 'Real cell size (μm)',
        rightLabel: 'Magnification (×M)',
        rightSub: 'Objective × Eyepiece',
        operatorCenter: '×',
        diagramCaption: 'I-A-M Triangle & Biological Logic: Structure → Specific Function → Evolutionary Adaptation.',
      };
    case 'maths':
      return {
        topLabel: 'Target Unknown (x, y, Area)',
        topSub: 'Isolate on LHS',
        leftLabel: 'Formula / Identity',
        leftSub: 'Substitute in (brackets)',
        rightLabel: 'Inverse Operations',
        rightSub: 'Balance both sides',
        operatorCenter: '➔',
        diagramCaption: 'Algebraic & Geometric Solver Map: State Formula → Substitute with Brackets → Rearrange & Solve.',
      };
    case 'business':
    case 'economics':
      return {
        topLabel: 'Revenue / % Change Qd',
        topSub: 'Total Inflow / Demand Shift',
        leftLabel: 'Price / Fixed Costs',
        leftSub: 'Unit Price (£)',
        rightLabel: 'Quantity / Elasticity',
        rightSub: 'Output / PED Coefficient',
        operatorCenter: '×',
        diagramCaption: 'Financial & Elasticity Logic: Calculate exact figures first, then build a contextualised "It depends on..." evaluation.',
      };
    case 'cs':
      return {
        topLabel: 'Total File Size (bits)',
        topSub: 'Divide by 8 for Bytes',
        leftLabel: 'Sample Rate / Width×Height',
        leftSub: 'Hz or Pixels',
        rightLabel: 'Bit Depth × Duration',
        rightSub: 'Bits per sample',
        operatorCenter: '×',
        diagramCaption: 'Data & Algorithm Trace Logic: Track binary nibbles (8-4-2-1) and variable state changes row by row.',
      };
    default:
      return {
        topLabel: `Core Thesis (${topicName})`,
        topSub: 'Writer’s / Historical Purpose',
        leftLabel: 'Embedded Evidence',
        leftSub: 'Micro-Quote / Date / Stat',
        rightLabel: 'Method & Context Impact',
        rightSub: 'Zoom-Word / Provenance',
        operatorCenter: '+',
        diagramCaption: 'Top-Band Essay Blueprint: Conceptual Thesis + Embedded Evidence + Deep Method/Context Analysis = Grade 8–9.',
      };
  }
}

export const PodVisualDiagram: React.FC<PodVisualDiagramProps> = ({
  subjectId,
  topicName,
  visualType,
  headlineFormula,
  activeDialogueIdx,
  isPlaying,
}) => {
  const nodes = getSubjectTriangleNodes(subjectId, topicName);

  if (visualType === 'formula_spotlight') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-indigo-400/30 shadow-inner space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
            📐 Interactive Formula & Variable Logic Diagram
          </span>
          <span className="text-[10px] font-bold text-indigo-300">
            Visual Memory Map
          </span>
        </div>

        {/* SVG Formula Triangle + Live Equation Display */}
        <div className="grid sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-6 flex justify-center">
            <svg
              viewBox="0 0 320 190"
              className="w-full max-w-[290px] h-auto drop-shadow-lg"
            >
              <defs>
                <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#db2777" stopOpacity="0.45" />
                </linearGradient>
              </defs>

              {/* Main Triangle */}
              <polygon
                points="160,12 20,176 300,176"
                fill="url(#triGrad)"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Horizontal Divider */}
              <line
                x1="88"
                y1="96"
                x2="232"
                y2="96"
                stroke="#c7d2fe"
                strokeWidth="2"
                strokeDasharray="4 3"
              />

              {/* Vertical Divider */}
              <line
                x1="160"
                y1="96"
                x2="160"
                y2="176"
                stroke="#c7d2fe"
                strokeWidth="2"
              />

              {/* Division signs on upper line */}
              <circle cx="115" cy="96" r="9" fill="#1e1b4b" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="115" y="100" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">
                ÷
              </text>
              <circle cx="205" cy="96" r="9" fill="#1e1b4b" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="205" y="100" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">
                ÷
              </text>

              {/* Center Operator Circle */}
              <circle cx="160" cy="138" r="12" fill="#ec4899" />
              <text x="160" y="143" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                {nodes.operatorCenter}
              </text>

              {/* Top Node Text */}
              <text x="160" y="58" textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="800">
                {nodes.topLabel.slice(0, 24)}
              </text>
              <text x="160" y="73" textAnchor="middle" fill="#a5f3fc" fontSize="8.5" fontWeight="600">
                {nodes.topSub}
              </text>

              {/* Bottom Left Node Text */}
              <text x="95" y="135" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="800">
                {nodes.leftLabel.slice(0, 18)}
              </text>
              <text x="95" y="152" textAnchor="middle" fill="#fde68a" fontSize="8" fontWeight="600">
                {nodes.leftSub}
              </text>

              {/* Bottom Right Node Text */}
              <text x="225" y="135" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="800">
                {nodes.rightLabel.slice(0, 18)}
              </text>
              <text x="225" y="152" textAnchor="middle" fill="#fde68a" fontSize="8" fontWeight="600">
                {nodes.rightSub}
              </text>
            </svg>
          </div>

          <div className="sm:col-span-6 space-y-2.5">
            <div className="p-3.5 rounded-xl bg-indigo-950/90 border border-indigo-400/40 text-amber-200 font-bold text-sm">
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-300 mb-1">
                Core Governing Equation
              </div>
              <FormattedText
                text={
                  headlineFormula.includes('\\')
                    ? `$$${headlineFormula}$$`
                    : headlineFormula
                }
              />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              💡 <strong>Visual Logic:</strong> {nodes.diagramCaption}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === 'three_pillars') {
    const steps = [
      {
        num: '1',
        title: 'Spot Given Data & Units',
        sub: 'Highlight 2 known values & convert to SI',
        color: 'from-blue-600 to-indigo-600',
      },
      {
        num: '2',
        title: 'Write & Substitute Rule',
        sub: 'Bank [M1] method mark immediately',
        color: 'from-purple-600 to-pink-600',
      },
      {
        num: '3',
        title: 'Solve & Check Accuracy',
        sub: 'Rearrange cleanly + state final unit [A1]',
        color: 'from-emerald-600 to-teal-600',
      },
    ];

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-indigo-400/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-pink-300">
            ⚡ 3-Step Visual Problem-Solving Flowchart
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            Solves 90% of GCSE Questions
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 relative">
          {steps.map((st, idx) => {
            const isHighlighted = isPlaying && activeDialogueIdx === idx;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all duration-300 relative ${
                  isHighlighted
                    ? 'bg-gradient-to-br ' +
                      st.color +
                      ' border-white shadow-lg scale-[1.03]'
                    : 'bg-slate-900/90 border-white/15'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-white/20 text-white font-black text-xs flex items-center justify-center">
                    {st.num}
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    {st.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 leading-snug">{st.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-amber-200 font-bold text-center">
          <FormattedText
            text={
              headlineFormula.includes('\\')
                ? `$$${headlineFormula}$$`
                : headlineFormula
            }
          />
        </div>
      </div>
    );
  }

  if (visualType === 'worked_hack') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-emerald-400/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
            🎯 Visual Mark-Scheme Blueprint (How Examiners Award Marks)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
            Full Marks Path
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-2.5 items-stretch">
          <div className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-400/30 flex flex-col justify-between">
            <span className="text-[10px] font-black text-indigo-300 uppercase">
              1. Extract Stem Values
            </span>
            <p className="text-xs text-white font-bold mt-1">
              Underline given numbers & convert units first
            </p>
            <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-bold w-fit">
              [B1 / Conversion]
            </span>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/70 border border-purple-400/30 flex flex-col justify-between">
            <span className="text-[10px] font-black text-purple-300 uppercase">
              2. Formula Substitution
            </span>
            <p className="text-xs text-white font-bold mt-1">
              Plug numbers directly into the governing rule
            </p>
            <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 font-bold w-fit">
              [M1 Method Mark]
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 flex flex-col justify-between">
            <span className="text-[10px] font-black text-emerald-300 uppercase">
              3. Verified Output
            </span>
            <div className="text-xs text-amber-200 font-extrabold mt-1">
              <FormattedText text={headlineFormula} />
            </div>
            <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-bold w-fit">
              [A1 Accuracy Mark]
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Slide 4: trap_vs_top visual meter
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-400/30 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
          ⚖️ Visual Grade Impact: Examiner Trap vs Grade 9 Habit
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-rose-300">❌ Rushed Answer (Skipping Formula / Units)</span>
            <span className="text-rose-400">1 / 4 Marks (25%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-1/4 bg-rose-500 rounded-full" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-emerald-300">
              ✅ Grade 9 Blueprint (Formula + Substitution + Unit)
            </span>
            <span className="text-emerald-400">4 / 4 Marks (100%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

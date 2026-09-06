'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Target, Sparkles, Calendar, Award, ArrowRight, HelpCircle, Zap } from 'lucide-react';
import { GCSE_SUBJECTS } from '@/lib/curriculum/gcse-data';
import { SearchBar } from '@/components/SearchBar';
import { QuickAssessmentModal } from '@/components/QuickAssessmentModal';

export default function Home() {
  const [isQuickAssessmentOpen, setIsQuickAssessmentOpen] = useState(false);

  return (
    <div className="space-y-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-indigo-800/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            Next-Gen AI GCSE Platform
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Achieve Your Target <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">Grade 9</span> with Adaptive AI
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Search any GCSE topic below, take a quick 5-question snapshot test, or run a full diagnostic assessment calibrated to your exact working grade level.
          </p>

          {/* Google-like Instant Search Bar */}
          <div className="pt-2">
            <SearchBar placeholder="Search any topic (e.g. Quadratic, Macbeth, Cold War, Mitosis, Subduction)..." />
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              onClick={() => setIsQuickAssessmentOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold shadow-lg shadow-amber-500/30 hover:scale-105 transition-all text-sm"
            >
              <Zap className="w-5 h-5 fill-yellow-300 text-yellow-300" />
              <span>Take Quick 5-Question Test</span>
            </button>

            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all text-sm"
            >
              <Target className="w-5 h-5" />
              <span>Full Diagnostic Test</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold backdrop-blur transition-all text-sm"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>AI Question Engine</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">1. Diagnostic Assessment</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Pinpoint your current baseline grade and topic strengths across 10-15 adaptive questions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">2. Smart Question Engine</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Generates targeted practice questions focusing on your identified weak areas and target grade level.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 font-bold">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">3. Deep Concept Analysis</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Step-by-step mark schemes, theoretical summaries, and examiner tips whenever you get stuck.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">4. Daily Goals & Streak</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Track daily question targets, maintain your study streak, and keep count of exam countdowns.
          </p>
        </div>

      </section>

      {/* Available GCSE Subjects */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Supported GCSE Subjects</h2>
            <p className="text-slate-500 text-sm">Full topic specifications aligned with AQA, Edexcel, and OCR boards</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {GCSE_SUBJECTS.map(subject => (
            <div key={subject.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded-lg">{subject.code}</span>
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{subject.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{subject.description}</p>
              </div>

              <Link
                href={`/practice?subject=${subject.id}`}
                className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 font-semibold text-xs text-slate-700 transition-colors border border-slate-200"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Assessment Modal */}
      <QuickAssessmentModal
        isOpen={isQuickAssessmentOpen}
        onClose={() => setIsQuickAssessmentOpen(false)}
      />

    </div>
  );
}



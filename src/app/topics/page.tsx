'use client';

import React from 'react';
import { GCSE_SUBJECTS, GCSE_TOPICS } from '@/lib/curriculum/gcse-data';
import { BookOpen, Award, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TopicsPage() {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">GCSE Konu Ağacı & Ustalık Matrisi</h1>
        <p className="text-slate-500 text-sm">Tüm dersler, konu üniteleri ve Grade 1-9 zorluk seviyeleri.</p>
      </div>

      {/* Subject Groups */}
      <div className="space-y-8">
        {GCSE_SUBJECTS.map(subject => {
          const subjectTopics = GCSE_TOPICS.filter(t => t.subjectId === subject.id);
          return (
            <div key={subject.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{subject.name}</h2>
                    <span className="text-xs text-slate-500">{subject.examBoard} ({subject.code})</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {subjectTopics.map(topic => (
                  <div key={topic.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-indigo-600 font-mono">{topic.unitName}</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded font-semibold">Grades {topic.minGrade}-{topic.maxGrade}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">{topic.topicName}</h3>
                      <p className="text-xs text-slate-600 mb-3">{topic.description}</p>
                    </div>

                    <Link
                      href={`/practice?topic=${topic.id}`}
                      className="inline-flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-indigo-50 hover:text-indigo-700 font-bold text-xs text-slate-800 rounded-lg border border-slate-200 transition-colors"
                    >
                      <span>Soru Çöz & Ustalık Artır</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

'use client';

import React from 'react';
import { GCSE_SUBJECTS, GCSE_TOPICS, INITIAL_SEED_QUESTIONS } from '@/lib/curriculum/gcse-data';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';

export default function TopicsPage() {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">GCSE Specification Topic & Subtopic Matrix</h1>
        <p className="text-slate-500 text-sm">Comprehensive subject units, 10 detailed archetype subtopics per topic, and Grade 1–9 difficulty mappings.</p>
      </div>

      {/* Subject Groups */}
      <div className="space-y-8">
        {GCSE_SUBJECTS.map(subject => {
          const subjectTopics = GCSE_TOPICS.filter(t => t.subjectId === subject.id);
          const boardsText = subject.supportedBoards ? subject.supportedBoards.join(', ') : 'AQA, Edexcel';

          return (
            <div key={subject.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{subject.name}</h2>
                    <span className="text-xs text-slate-500">{boardsText} ({subject.code})</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {subjectTopics.map(topic => {
                  // Collect unique subtopics for this topic
                  const subtopicMap = new Map<string, string>();
                  INITIAL_SEED_QUESTIONS.filter(q => q.topicId === topic.id && q.subtopicId).forEach(q => {
                    if (q.subtopicId && !subtopicMap.has(q.subtopicId)) {
                      subtopicMap.set(q.subtopicId, q.subtopicName || q.subtopicId);
                    }
                  });
                  const subtopics = Array.from(subtopicMap.entries()).map(([id, name]) => ({ id, name }));

                  return (
                    <div key={topic.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-indigo-600 font-mono">{topic.unitName}</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded font-semibold">Grades {topic.minGrade}-{topic.maxGrade}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mb-1">{topic.topicName}</h3>
                        <p className="text-xs text-slate-600 mb-3">{topic.description}</p>

                        {/* Subtopics List */}
                        {subtopics.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                              <Layers className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Subtopic Breakdown ({subtopics.length} Archetypes):</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {subtopics.map(sub => (
                                <Link
                                  key={sub.id}
                                  href={`/practice?topic=${topic.id}&subtopic=${sub.id}`}
                                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-[11px] font-medium text-slate-700 rounded-lg transition-colors shadow-2xs"
                                >
                                  🎯 {sub.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <Link
                          href={`/practice?topic=${topic.id}`}
                          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-lg transition-colors shadow-sm"
                        >
                          <span>Practice All Topic Questions</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}


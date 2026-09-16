'use client';

import React, { useState } from 'react';
import { getTopicRevisionBundle, RevisionResource, VideoTutorial } from '@/lib/curriculum/topic-resources';
import { 
  BookOpen, 
  Video, 
  ExternalLink, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  FileText, 
  GraduationCap, 
  CheckCircle2 
} from 'lucide-react';

interface TopicRevisionResourcesProps {
  topicId: string;
  topicName?: string;
  subjectId?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export function TopicRevisionResources({
  topicId,
  topicName,
  subjectId,
  className = '',
  defaultExpanded = true,
}: TopicRevisionResourcesProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'videos'>('all');

  const bundle = getTopicRevisionBundle(topicId, subjectId, topicName);

  return (
    <div
      className={`rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 shadow-sm transition-all overflow-hidden ${className}`}
    >
      {/* Header bar / accordion toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Recommended Topic Revision
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                PMT • Save My Exams • Maths Genie • Corbettmaths
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Master &quot;{bundle.topicName}&quot;
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <span>{isExpanded ? 'Collapse' : 'View Notes & Videos'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-indigo-100/80 dark:border-indigo-900/50 space-y-4">
          
          {/* Quick tab filters */}
          <div className="flex items-center justify-between gap-2 pt-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All Resources ({bundle.readingResources.length + bundle.videoTutorials.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Notes & Worksheets ({bundle.readingResources.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'videos'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Lessons ({bundle.videoTutorials.length})</span>
              </button>
            </div>

            <a
              href={bundle.externalSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors"
            >
              <span>Search More Papers</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 1. Revision Notes & Past Papers (PMT, Corbettmaths, Maths Genie, Save My Exams) */}
          {(activeTab === 'all' || activeTab === 'notes') && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Revision Notes, Worksheets & Exam Question Packs
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {bundle.readingResources.map((res) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {res.provider}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${res.badgeColor}`}>
                          {res.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {res.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Open Revision Notes</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 2. Video Tutorials (FreeScienceLessons, Maths Genie, Corbettmaths, Cognito) */}
          {(activeTab === 'all' || activeTab === 'videos') && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                Curated Video Lessons & Worked Solutions
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bundle.videoTutorials.map((vid) => (
                  <a
                    key={vid.id}
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <Play className="w-3 h-3 fill-rose-600 dark:fill-rose-400" />
                        </div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {vid.channelName}
                        </span>
                        {vid.durationEstimate && (
                          <span className="ml-auto text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            {vid.durationEstimate}
                          </span>
                        )}
                      </div>

                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                        {vid.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {vid.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                      <span>Watch Video Tutorial</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Quick study recommendation badge */}
          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              <strong>Examiner Strategy:</strong> Watch the 5-minute video lesson above first, review the PMT/Save My Exams summary notes, then attempt 3 practice questions to secure full marks.
            </span>
          </div>

        </div>
      )}
    </div>
  );
}

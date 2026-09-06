'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Sparkles, BookOpen, ChevronRight, Zap } from 'lucide-react';
import { GCSE_TOPICS, GCSE_SUBJECTS, GCSETopic } from '@/lib/curriculum/gcse-data';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = "Type any GCSE topic or concept (e.g. Quadratic, Macbeth, Cold War, Mitosis, Energy)...",
  className = "",
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<{ topic: GCSETopic; subjectName: string; subjectColor: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const q = query.toLowerCase().trim();
    const matches = GCSE_TOPICS.filter((t) => {
      const subject = GCSE_SUBJECTS.find((s) => s.id === t.subjectId);
      const subjectMatch = subject?.name.toLowerCase().includes(q);
      const nameMatch = t.topicName.toLowerCase().includes(q);
      const unitMatch = t.unitName.toLowerCase().includes(q);
      const descMatch = t.description.toLowerCase().includes(q);
      const keywordMatch = t.keywords?.some((k) => k.toLowerCase().includes(q));
      return subjectMatch || nameMatch || unitMatch || descMatch || keywordMatch;
    }).map((topic) => {
      const subject = GCSE_SUBJECTS.find((s) => s.id === topic.subjectId);
      return {
        topic,
        subjectName: subject?.name || 'GCSE',
        subjectColor: subject?.color || 'from-indigo-600 to-purple-600',
      };
    });

    setResults(matches);
    setIsOpen(matches.length > 0);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTopic = (topicId: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/practice?topicId=${encodeURIComponent(topicId)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleSelectTopic(results[0].topic.id);
    } else if (query.trim()) {
      router.push(`/practice?searchQuery=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
        <div className="absolute left-4 text-slate-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-28 py-4 text-base font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-24 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-2.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <span>Search</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </form>

      {/* Google-like Instant Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Found {results.length} matching GCSE topic{results.length > 1 ? 's' : ''}
            </span>
            <span>Press Enter to start adaptive test</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            {results.map(({ topic, subjectName, subjectColor }) => (
              <button
                key={topic.id}
                onClick={() => handleSelectTopic(topic.id)}
                className="w-full text-left p-3.5 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${subjectColor} text-white shrink-0 shadow-sm`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {subjectName}
                      </span>
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        Grade {topic.minGrade}–{topic.maxGrade}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {topic.topicName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {topic.unitName} • {topic.description.replace(/\$/g, '')}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-xs rounded-xl flex items-center gap-1 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Zap className="w-3.5 h-3.5" />
                    Test Now
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

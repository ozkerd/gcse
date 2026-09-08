'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Award } from 'lucide-react';
import { INITIAL_SEED_QUESTIONS, SeedQuestion, GCSE_TOPICS } from '@/lib/curriculum/gcse-data';
import { AIGenerator, DeepExplanationResult, validateAnswer } from '@/lib/ai/generator';
import { DeepExplanationModal } from '@/components/DeepExplanationModal';
import { UserStore } from '@/lib/user-store';
import { AdaptiveEngine } from '@/lib/adaptive/engine';
import { SearchBar } from '@/components/SearchBar';
import { QuestionCard } from '@/components/QuestionCard';

function PracticeContent() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject');
  const topicParam = searchParams.get('topic') || searchParams.get('topicId');
  const subtopicParam = searchParams.get('subtopic') || searchParams.get('subtopicId') || undefined;
  const searchQueryParam = searchParams.get('searchQuery');

  // Determine target topic
  let initialTopicId = 'm-alg-1'; // Default
  if (topicParam) {
    initialTopicId = topicParam;
  } else if (searchQueryParam) {
    const matched = GCSE_TOPICS.find(t => 
      t.topicName.toLowerCase().includes(searchQueryParam.toLowerCase()) ||
      t.unitName.toLowerCase().includes(searchQueryParam.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQueryParam.toLowerCase())
    );
    if (matched) initialTopicId = matched.id;
  } else if (subjectParam) {
    const matched = GCSE_TOPICS.find(t => t.subjectId === subjectParam);
    if (matched) initialTopicId = matched.id;
  }

  const [activeTopicId, setActiveTopicId] = useState<string>(initialTopicId);
  
  const [sessionIndex, setSessionIndex] = useState<number>(0);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>(subtopicParam || '');
  const [typeFilter, setTypeFilter] = useState<'all' | 'numerical' | 'short_answer' | 'fill_in_blank' | 'multiple_choice'>('all');

  const topicSubtopics = React.useMemo(() => {
    const map = new Map<string, string>();
    INITIAL_SEED_QUESTIONS.filter(q => q.topicId === activeTopicId && q.subtopicId).forEach(q => {
      if (q.subtopicId && !map.has(q.subtopicId)) {
        map.set(q.subtopicId, q.subtopicName || q.subtopicId);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [activeTopicId]);

  const getInitialQuestion = (): SeedQuestion => {
    const session = UserStore.getSession();
    const baseGrade = session.targetGrade || 6;
    return AdaptiveEngine.getAdaptiveQuestionForTopic(initialTopicId, baseGrade, [], undefined, 0);
  };

  const [currentQuestion, setCurrentQuestion] = useState<SeedQuestion>(getInitialQuestion);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deepAnalysisData, setDeepAnalysisData] = useState<DeepExplanationResult | null>(null);
  const [scoreCount, setScoreCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [loadingNewQuestion, setLoadingNewQuestion] = useState<boolean>(false);

  const [askedIds, setAskedIds] = useState<string[]>([]);

  // Load adaptive question when activeTopicId, subtopic, or typeFilter change
  useEffect(() => {
    const targetId = topicParam || initialTopicId;
    setActiveTopicId(targetId);
    if (subtopicParam) {
      setSelectedSubtopic(subtopicParam);
    }
    
    const session = UserStore.getSession();
    const baseGrade = session.targetGrade || 6;
    const masteries = UserStore.getTopicMasteries();
    const topicRecord = masteries[targetId];
    const currentGrade = topicRecord?.currentGradeLevel || baseGrade;

    const answeredIds = UserStore.getAnsweredQuestionIds();
    const excludeList = Array.from(new Set([...askedIds, ...answeredIds]));

    setSessionIndex(0);
    const prefType = typeFilter !== 'all' ? typeFilter : undefined;
    const q = AdaptiveEngine.getAdaptiveQuestionForTopic(targetId, currentGrade, excludeList, selectedSubtopic || subtopicParam || undefined, 0, prefType);
    setCurrentQuestion(q);
    setAskedIds(prev => [...prev, q.id]);
    setSelectedOption(null);
    setHasSubmitted(false);
  }, [subjectParam, topicParam, subtopicParam, searchQueryParam, selectedSubtopic, typeFilter]);

  const currentTopic = GCSE_TOPICS.find(t => t.id === activeTopicId) || GCSE_TOPICS[0];

  const handleSubmit = () => {
    if (!selectedOption || hasSubmitted) return;
    setHasSubmitted(true);
    setTotalAttempts(prev => prev + 1);
    
    const evalRes = validateAnswer(currentQuestion, selectedOption);
    const correct = evalRes.isCorrect;
    if (correct) {
      setScoreCount(prev => prev + 1);
    }

    // Record attempt in UserStore and update Adaptive Mastery!
    UserStore.recordQuestionAttempt(correct, currentQuestion.id);
    UserStore.updateTopicMastery(activeTopicId, correct, currentQuestion.gradeLevel);
  };

  const handleOpenDeepAnalysis = async () => {
    const analysis = await AIGenerator.generateDeepAnalysis(currentQuestion, selectedOption || undefined);
    setDeepAnalysisData(analysis);
    setIsModalOpen(true);
  };

  const handleNextQuestion = async () => {
    setLoadingNewQuestion(true);
    setSelectedOption(null);
    setHasSubmitted(false);

    // Fetch updated topic mastery to determine new adaptive grade level
    const session = UserStore.getSession();
    const baseGrade = session.targetGrade || 6;
    const masteries = UserStore.getTopicMasteries();
    const topicRecord = masteries[activeTopicId];
    const nextGrade = topicRecord?.currentGradeLevel || baseGrade;

    const answeredIds = UserStore.getAnsweredQuestionIds();
    const excludeList = Array.from(new Set([...askedIds, ...answeredIds, currentQuestion.id]));

    const nextIndex = sessionIndex + 1;
    setSessionIndex(nextIndex);

    const prefType = typeFilter !== 'all' ? typeFilter : undefined;
    // Load next adaptive question for topic with strict 20/80 sequence pacing or requested type
    const nextQ = AdaptiveEngine.getAdaptiveQuestionForTopic(activeTopicId, nextGrade, excludeList, selectedSubtopic || undefined, nextIndex, prefType);
    setAskedIds(prev => [...prev, nextQ.id]);
    setCurrentQuestion(nextQ);
    setLoadingNewQuestion(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Adaptive Practice • 20% MC / 80% Calculations & Written
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {currentTopic.topicName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unit: {currentTopic.unitName} • Grade {currentTopic.minGrade}–{currentTopic.maxGrade} Specification
            </p>
          </div>

          {/* Live Score Counter */}
          <div className="flex items-center gap-3 bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 px-4 py-2 rounded-2xl shrink-0">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Accuracy: </span>
              <span className="font-extrabold text-indigo-900 dark:text-indigo-200">
                {totalAttempts > 0 ? Math.round((scoreCount / totalAttempts) * 100) : 100}% ({scoreCount}/{totalAttempts})
              </span>
            </div>
          </div>
        </div>

        {/* Subtopic Selector & Question Type Toolbar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Subtopic Dropdown */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">🎯 Subtopic:</span>
            <select
              value={selectedSubtopic}
              onChange={(e) => setSelectedSubtopic(e.target.value)}
              className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All 10 Subtopics (Adaptive Curriculum)</option>
              {topicSubtopics.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Format Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mr-1">Format:</span>
            {[
              { id: 'all', label: '🎯 20/80 Ratio' },
              { id: 'numerical', label: '🔢 Numerical' },
              { id: 'short_answer', label: '✍️ Written' },
              { id: 'fill_in_blank', label: '📝 Fill Blank' },
              { id: 'multiple_choice', label: '🔘 MC Only' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Instant Topic Search */}
        <div className="pt-2">
          <SearchBar placeholder="Search & switch to another topic (e.g. Macbeth, Mitosis, Cold War, Trigonometry)..." />
        </div>
      </div>

      {/* Main Multi-Type Question Card */}
      <QuestionCard
        question={currentQuestion}
        selectedAnswer={selectedOption}
        onAnswerChange={setSelectedOption}
        hasSubmitted={hasSubmitted}
        onSubmit={handleSubmit}
        onNext={handleNextQuestion}
        onDeepAnalysis={handleOpenDeepAnalysis}
        loading={loadingNewQuestion}
      />

      {/* Deep Solution Modal */}
      {deepAnalysisData && (
        <DeepExplanationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          explanation={deepAnalysisData}
          topicName={currentTopic?.topicName || 'GCSE Topic Deep Analysis'}
        />
      )}

    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 font-bold">
        Loading Adaptive Practice Engine...
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}




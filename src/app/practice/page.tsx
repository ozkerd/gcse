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
  
  const getInitialQuestion = (): SeedQuestion => {
    return AdaptiveEngine.getAdaptiveQuestionForTopic(initialTopicId);
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

  // Load adaptive question when activeTopicId or params change
  useEffect(() => {
    const targetId = topicParam || initialTopicId;
    setActiveTopicId(targetId);
    
    const masteries = UserStore.getTopicMasteries();
    const topicRecord = masteries[targetId];
    const currentGrade = topicRecord?.currentGradeLevel || 4;

    const answeredIds = UserStore.getAnsweredQuestionIds();
    const excludeList = Array.from(new Set([...askedIds, ...answeredIds]));

    const q = AdaptiveEngine.getAdaptiveQuestionForTopic(targetId, currentGrade, excludeList, subtopicParam);
    setCurrentQuestion(q);
    setAskedIds(prev => [...prev, q.id]);
    setSelectedOption(null);
    setHasSubmitted(false);
  }, [subjectParam, topicParam, subtopicParam, searchQueryParam]);

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
    const masteries = UserStore.getTopicMasteries();
    const topicRecord = masteries[activeTopicId];
    const nextGrade = topicRecord?.currentGradeLevel || 4;

    const answeredIds = UserStore.getAnsweredQuestionIds();
    const excludeList = Array.from(new Set([...askedIds, ...answeredIds, currentQuestion.id]));

    // Load next adaptive question for topic ensuring anti-repetition & option shuffling
    const nextQ = AdaptiveEngine.getAdaptiveQuestionForTopic(activeTopicId, nextGrade, excludeList, subtopicParam);
    setAskedIds(prev => [...prev, nextQ.id]);
    setCurrentQuestion(nextQ);
    setLoadingNewQuestion(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Search Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Adaptive AI Question Engine (20/80 Exam Simulation)
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              {currentTopic.topicName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit: {currentTopic.unitName} • Grade {currentTopic.minGrade}–{currentTopic.maxGrade} Specification
            </p>
          </div>

          {/* Live Score Counter */}
          <div className="flex items-center gap-3 bg-indigo-50/80 border border-indigo-100 px-4 py-2 rounded-2xl shrink-0">
            <Award className="w-5 h-5 text-indigo-600" />
            <div className="text-xs">
              <span className="text-slate-500 font-medium">Accuracy: </span>
              <span className="font-extrabold text-indigo-900">
                {totalAttempts > 0 ? Math.round((scoreCount / totalAttempts) * 100) : 100}% ({scoreCount}/{totalAttempts})
              </span>
            </div>
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




'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, HelpCircle, CheckCircle2, XCircle, ArrowRight, Lightbulb, RefreshCw, Award, Search } from 'lucide-react';
import { INITIAL_SEED_QUESTIONS, SeedQuestion, GCSE_TOPICS, GCSE_SUBJECTS } from '@/lib/curriculum/gcse-data';
import { KaTeXRenderer } from '@/components/KaTeXRenderer';
import { AIGenerator, DeepExplanationResult } from '@/lib/ai/generator';
import { DeepExplanationModal } from '@/components/DeepExplanationModal';
import { UserStore } from '@/lib/user-store';
import { AdaptiveEngine } from '@/lib/adaptive/engine';
import { SearchBar } from '@/components/SearchBar';

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
    const matchedSeeds = INITIAL_SEED_QUESTIONS.filter(q => q.topicId === initialTopicId);
    return matchedSeeds.length > 0 ? matchedSeeds[0] : AdaptiveEngine.getAdaptiveQuestionForTopic(initialTopicId);
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
  const isCorrect = selectedOption === currentQuestion.correctAnswer;

  const handleSubmit = () => {
    if (!selectedOption || hasSubmitted) return;
    setHasSubmitted(true);
    setTotalAttempts(prev => prev + 1);
    
    const correct = selectedOption === currentQuestion.correctAnswer;
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
              Adaptive AI Question Engine
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

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        
        {/* Question Header & Grade Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full font-mono text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              Target Grade {currentQuestion.gradeLevel} Question
            </span>
            <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-900 rounded-full text-xs font-semibold flex items-center gap-1">
              📜 {currentQuestion.examBoard || 'AQA'} {currentQuestion.paperYear || 2023} ({currentQuestion.paperName || 'Paper 1'})
            </span>
            {currentQuestion.subtopicName && (
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-semibold flex items-center gap-1">
                🎯 {currentQuestion.subtopicName}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-400">ID: {currentQuestion.id}</span>
        </div>

        {/* Question Body */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6">
          <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            <KaTeXRenderer content={currentQuestion.questionText} />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options?.map((option, idx) => {
            const isSelected = selectedOption === option;
            let btnStyle = 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800';

            if (hasSubmitted) {
              if (option === currentQuestion.correctAnswer) {
                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
              } else if (isSelected) {
                btnStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-500/20';
              }
            } else if (isSelected) {
              btnStyle = 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold ring-2 ring-indigo-500/20';
            }

            return (
              <button
                key={idx}
                disabled={hasSubmitted}
                onClick={() => setSelectedOption(option)}
                className={`w-full text-left p-4 rounded-2xl border-2 text-sm transition-all flex items-center justify-between ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <KaTeXRenderer content={option} />
                </div>

                {hasSubmitted && option === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {hasSubmitted && isSelected && option !== currentQuestion.correctAnswer && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback / Result Banner */}
        {hasSubmitted && (
          <div className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isCorrect ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-base">
                  {isCorrect ? 'Correct Answer! 🎉' : 'Nearly there! Review solution below.'}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  {isCorrect
                    ? 'Topic mastery increased! Answer 2 in a row correctly to unlock higher Grade questions.'
                    : 'Reinforcing foundational concepts for this topic before promoting difficulty.'}
                </p>
              </div>
            </div>

            {/* Deep Analysis Button */}
            <button
              onClick={handleOpenDeepAnalysis}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105 shrink-0"
            >
              <Lightbulb className="w-4 h-4 text-slate-900" />
              <span>Deep Analysis & Hint</span>
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          
          {!hasSubmitted && (
            <button
              onClick={handleOpenDeepAnalysis}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-indigo-600 font-semibold text-xs transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Request Hint & Formula Help</span>
            </button>
          )}

          <div className="ml-auto flex gap-3">
            {!hasSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOption}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                  selectedOption
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={loadingNewQuestion}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
              >
                {loadingNewQuestion ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading Adaptive Question...</span>
                  </>
                ) : (
                  <>
                    <span>Next Adaptive Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Deep Explanation Modal */}
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
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Question Engine...
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}




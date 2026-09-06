'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, CheckCircle2, XCircle, ArrowRight, Lightbulb, RefreshCw, Award, BookOpen } from 'lucide-react';
import { INITIAL_SEED_QUESTIONS, SeedQuestion, GCSE_TOPICS } from '@/lib/curriculum/gcse-data';
import { KaTeXRenderer } from '@/components/KaTeXRenderer';
import { AIGenerator, DeepExplanationResult } from '@/lib/ai/generator';
import { DeepExplanationModal } from '@/components/DeepExplanationModal';

export default function PracticePage() {
  const [currentQuestion, setCurrentQuestion] = useState<SeedQuestion>(INITIAL_SEED_QUESTIONS[0]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deepAnalysisData, setDeepAnalysisData] = useState<DeepExplanationResult | null>(null);
  const [scoreCount, setScoreCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [loadingNewQuestion, setLoadingNewQuestion] = useState<boolean>(false);

  const isCorrect = selectedOption === currentQuestion.correctAnswer;
  const currentTopic = GCSE_TOPICS.find(t => t.id === currentQuestion.topicId);

  const handleSubmit = () => {
    if (!selectedOption || hasSubmitted) return;
    setHasSubmitted(true);
    setTotalAttempts(prev => prev + 1);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScoreCount(prev => prev + 1);
    }
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

    // Pick next dynamic question
    const nextIdx = (INITIAL_SEED_QUESTIONS.indexOf(currentQuestion) + 1) % INITIAL_SEED_QUESTIONS.length;
    const nextQ = await AIGenerator.generateQuestion(INITIAL_SEED_QUESTIONS[nextIdx].topicId, 7);
    
    setCurrentQuestion(nextQ);
    setLoadingNewQuestion(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            AI Akıllı Soru Motoru
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">{currentTopic?.topicName || 'GCSE Adaptive Trainer'}</h1>
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <Award className="w-5 h-5 text-indigo-600" />
          <div className="text-xs">
            <span className="text-slate-500 font-medium">Doğruluk Oranı: </span>
            <span className="font-extrabold text-indigo-900">
              {totalAttempts > 0 ? Math.round((scoreCount / totalAttempts) * 100) : 100}% ({scoreCount}/{totalAttempts})
            </span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        
        {/* Question Header & Grade Tag */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full font-mono text-xs font-bold">
            Target Grade {currentQuestion.gradeLevel} Level Question
          </span>
          <span className="text-xs font-semibold text-slate-400">ID: {currentQuestion.id}</span>
        </div>

        {/* Question Body */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-5">
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
                className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
              >
                <KaTeXRenderer content={option} />
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
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {isCorrect ? 'Tebrikler! Doğru Cevap 🎉' : 'Neredeyse! Bu konuda biraz eksiklik var.'}
                </h4>
                <p className="text-xs opacity-90">
                  {isCorrect
                    ? 'Ustalık skorunuz yükseltildi. Yeni soru seviyesi ayarlanıyor.'
                    : 'Daha fazla bilgi butonuna basarak adım adım çözümü ve teorik özeti inceleyebilirsiniz.'}
                </p>
              </div>
            </div>

            {/* "Daha Fazla Bilgi" Button */}
            <button
              onClick={handleOpenDeepAnalysis}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105 shrink-0"
            >
              <Lightbulb className="w-4 h-4 text-slate-900" />
              <span>Daha Fazla Bilgi</span>
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          
          {/* Direct "Daha Fazla Bilgi" Trigger before answering */}
          {!hasSubmitted && (
            <button
              onClick={handleOpenDeepAnalysis}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-indigo-600 font-semibold text-xs transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>İpucu & Daha Fazla Bilgi İstiyorum</span>
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
                Cevabı Gönder
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={loadingNewQuestion}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
              >
                {loadingNewQuestion ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Yeni Soru Türetiliyor...</span>
                  </>
                ) : (
                  <>
                    <span>Sonraki Soruya Geç</span>
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

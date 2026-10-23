'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Flame,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  Sliders,
  BookOpen,
  Award,
} from 'lucide-react';
import { GCSE_SUBJECTS, GCSE_TOPICS } from '@/lib/curriculum/gcse-data';
import {
  getTopicFlashcards,
  getTopicStudyPod,
  TopicFlashcard,
  FlashcardCategory,
} from '@/lib/curriculum/study-pods-data';
import {
  UserStore,
  FlashcardTopicProgress,
  StudentTopicCoverage,
} from '@/lib/user-store';
import { FormattedText } from '@/components/FormattedText';
import { LevelCheckInModal } from '@/components/LevelCheckInModal';

function FlashcardsAndPodsContent() {
  const searchParams = useSearchParams();
  const initialTopicParam = searchParams.get('topicId') || searchParams.get('topic');
  const initialSubjectParam = searchParams.get('subject');
  const initialModeParam = searchParams.get('mode');

  const [activeMode, setActiveMode] = useState<'flashcards' | 'pods'>(
    initialModeParam === 'pods' ? 'pods' : 'flashcards'
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('maths');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('m-alg-1');
  const [onlyCoveredTopics, setOnlyCoveredTopics] = useState<boolean>(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);

  // Flashcard state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [flashcardProgressMap, setFlashcardProgressMap] = useState<
    Record<string, FlashcardTopicProgress>
  >({});
  const [coverageMap, setCoverageMap] = useState<Record<string, StudentTopicCoverage>>({});

  // Audio-Visual Pod state
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [activeDialogueIdx, setActiveDialogueIdx] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const speechActiveRef = useRef<boolean>(false);

  useEffect(() => {
    setFlashcardProgressMap(UserStore.getFlashcardProgressMap());
    setCoverageMap(UserStore.getTopicCoverageMap());

    if (initialTopicParam) {
      const found = GCSE_TOPICS.find((t) => t.id === initialTopicParam);
      if (found) {
        setSelectedSubjectId(found.subjectId);
        setSelectedTopicId(found.id);
      }
    } else if (initialSubjectParam) {
      const foundSubj = GCSE_SUBJECTS.find((s) => s.id === initialSubjectParam);
      if (foundSubj) {
        setSelectedSubjectId(foundSubj.id);
        const firstTopic = GCSE_TOPICS.find((t) => t.subjectId === foundSubj.id);
        if (firstTopic) setSelectedTopicId(firstTopic.id);
      }
    }

    const handleUpdates = () => {
      setFlashcardProgressMap(UserStore.getFlashcardProgressMap());
      setCoverageMap(UserStore.getTopicCoverageMap());
    };

    window.addEventListener('gcse_flashcards_updated', handleUpdates);
    window.addEventListener('gcse_coverage_updated', handleUpdates);
    return () => {
      window.removeEventListener('gcse_flashcards_updated', handleUpdates);
      window.removeEventListener('gcse_coverage_updated', handleUpdates);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [initialTopicParam, initialSubjectParam]);

  // Filter topics for selected subject
  const subjectTopics = useMemo(() => {
    const allInSubject = GCSE_TOPICS.filter((t) => t.subjectId === selectedSubjectId);
    if (!onlyCoveredTopics) return allInSubject;
    const coveredInSubject = allInSubject.filter(
      (t) => coverageMap[t.id] && coverageMap[t.id].status !== 'not_covered'
    );
    return coveredInSubject.length > 0 ? coveredInSubject : allInSubject;
  }, [selectedSubjectId, onlyCoveredTopics, coverageMap]);

  // Ensure selectedTopicId stays valid when subject changes
  useEffect(() => {
    if (!subjectTopics.some((t) => t.id === selectedTopicId)) {
      if (subjectTopics[0]) {
        setSelectedTopicId(subjectTopics[0].id);
      }
    }
  }, [subjectTopics, selectedTopicId]);

  const rawCards = useMemo(
    () => getTopicFlashcards(selectedTopicId),
    [selectedTopicId]
  );

  const filteredCards = useMemo(() => {
    const base =
      selectedCategory === 'All'
        ? rawCards
        : rawCards.filter((c) => c.category === selectedCategory);
    if (shuffledOrder.length === base.length) {
      return shuffledOrder.map((i) => base[i]).filter(Boolean);
    }
    return base;
  }, [rawCards, selectedCategory, shuffledOrder]);

  // Reset card index & stop audio when topic changes
  useEffect(() => {
    setCardIndex(0);
    setIsFlipped(false);
    setShuffledOrder([]);
    stopPodAudio();
    setActiveSlideIdx(0);
    setActiveDialogueIdx(0);
  }, [selectedTopicId, selectedCategory]);

  const currentCard: TopicFlashcard | undefined = filteredCards[cardIndex];
  const currentPod = useMemo(
    () => getTopicStudyPod(selectedTopicId),
    [selectedTopicId]
  );

  const topicProgress = flashcardProgressMap[selectedTopicId] || {
    topicId: selectedTopicId,
    masteredCardIds: [],
    learningCardIds: [],
    lastReviewedAt: '',
  };

  // Keyboard navigation for flashcards
  useEffect(() => {
    if (activeMode !== 'flashcards') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsFlipped(false);
        setCardIndex((prev) => (prev + 1) % Math.max(1, filteredCards.length));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsFlipped(false);
        setCardIndex(
          (prev) =>
            (prev - 1 + Math.max(1, filteredCards.length)) %
            Math.max(1, filteredCards.length)
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, filteredCards.length]);

  const handleRateCard = (rating: 'again' | 'good' | 'easy') => {
    if (!currentCard) return;
    const updated = UserStore.updateFlashcardCardStatus(
      selectedTopicId,
      currentCard.id,
      rating
    );
    setFlashcardProgressMap((prev) => ({
      ...prev,
      [selectedTopicId]: updated,
    }));
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev + 1) % Math.max(1, filteredCards.length));
    }, 150);
  };

  const handleShuffle = () => {
    const indices = filteredCards.map((_, idx) => idx);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledOrder(indices);
    setCardIndex(0);
    setIsFlipped(false);
  };

  // Web Speech API Dual-Host Audio Engine for Study Pods
  const stopPodAudio = () => {
    speechActiveRef.current = false;
    setIsPlayingAudio(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const speakDialogueLine = (slideIdx: number, lineIdx: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const slide = currentPod.slides[slideIdx];
    if (!slide) {
      stopPodAudio();
      return;
    }
    const line = slide.dialogue[lineIdx];
    if (!line) {
      // Advance to next slide if available
      if (slideIdx + 1 < currentPod.slides.length) {
        setActiveSlideIdx(slideIdx + 1);
        setActiveDialogueIdx(0);
        speakDialogueLine(slideIdx + 1, 0);
      } else {
        stopPodAudio();
      }
      return;
    }

    setActiveSlideIdx(slideIdx);
    setActiveDialogueIdx(lineIdx);

    window.speechSynthesis.cancel();
    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = 'en-GB';
    utterance.rate = playbackRate;
    // Give Alex (Coach) and Maya (Student) distinct pitch profiles
    utterance.pitch = line.speaker.includes('Alex') ? 0.96 : 1.12;

    const voices = window.speechSynthesis.getVoices();
    const ukVoices = voices.filter((v) => v.lang.includes('en-GB') || v.lang.includes('en'));
    if (ukVoices.length >= 2) {
      utterance.voice = line.speaker.includes('Alex') ? ukVoices[0] : ukVoices[1];
    } else if (ukVoices.length === 1) {
      utterance.voice = ukVoices[0];
    }

    utterance.onend = () => {
      if (!speechActiveRef.current) return;
      speakDialogueLine(slideIdx, lineIdx + 1);
    };

    utterance.onerror = () => {
      speechActiveRef.current = false;
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePlayPod = () => {
    if (isPlayingAudio) {
      stopPodAudio();
    } else {
      speechActiveRef.current = true;
      setIsPlayingAudio(true);
      speakDialogueLine(activeSlideIdx, activeDialogueIdx);
    }
  };

  const activeSlide = currentPod.slides[activeSlideIdx] || currentPod.slides[0];
  const currentTopicCoverage = coverageMap[selectedTopicId];

  return (
    <div className="space-y-6">
      {/* Top Studio Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/60 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive GCSE Revision Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Flashcards & Audio-Visual Exam Hack Pods
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Master the crucial formulas, 3-step problem solvers, and examiner traps across all 103 GCSE topics with 3D spaced-repetition flashcards and NotebookLM-style dual-host audio-visual presentations.
            </p>
          </div>

          {/* Mode Switcher + Level Calibration Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-indigo-800/80 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  stopPodAudio();
                  setActiveMode('flashcards');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeMode === 'flashcards'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>3D Flashcards ({rawCards.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('pods')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeMode === 'pods'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Audio & Visual Pod</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsLevelModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Sliders className="w-4 h-4" />
              <span>My Level & Covered Topics</span>
            </button>
          </div>
        </div>

        {/* Subject & Topic Selector Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {GCSE_SUBJECTS.map((subj) => {
              const isSelected = selectedSubjectId === subj.id;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-white text-indigo-950 shadow-md scale-[1.02]'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {subj.name.replace('GCSE ', '')}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-indigo-200">Select Topic:</span>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-indigo-400/40 text-white font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {subjectTopics.map((t) => {
                  const cov = coverageMap[t.id];
                  const badge =
                    cov?.status === 'confident'
                      ? '✅ '
                      : cov?.status === 'needs_practice'
                      ? '🔄 '
                      : '';
                  return (
                    <option key={t.id} value={t.id}>
                      {badge}
                      {t.unitName} — {t.topicName} (Grades {t.minGrade}–{t.maxGrade})
                    </option>
                  );
                })}
              </select>

              {currentTopicCoverage && currentTopicCoverage.status !== 'not_covered' && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold">
                  School Status:{' '}
                  {currentTopicCoverage.status === 'confident'
                    ? 'Covered & Confident'
                    : 'Covered (Need Practice)'}{' '}
                  • My Level: Grade {currentTopicCoverage.selfAssessedGrade}
                </span>
              )}
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-bold text-indigo-200 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyCoveredTopics}
                onChange={(e) => setOnlyCoveredTopics(e.target.checked)}
                className="rounded border-indigo-400 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Filter by topics I’ve covered at school</span>
            </label>
          </div>
        </div>
      </div>

      {/* MODE 1: INTERACTIVE 3D FLASHCARDS */}
      {activeMode === 'flashcards' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Interactive 3D Flip Card */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Filter Pills & Shuffle */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    'All',
                    'Formula & Rule',
                    'Exam Hack',
                    'Core Concept',
                    'Common Trap',
                    'Worked Micro-Problem',
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleShuffle}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-100"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle Deck</span>
              </button>
            </div>

            {/* Flashcard Stage */}
            {currentCard && (
              <div className="space-y-4">
                <div
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="cursor-pointer select-none min-h-[340px] sm:min-h-[380px] rounded-3xl p-6 sm:p-10 border-2 transition-all duration-300 shadow-lg flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 hover:shadow-xl border-indigo-200 dark:border-indigo-900/80"
                >
                  {/* Top Card Meta */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                          isFlipped
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                        }`}
                      >
                        {isFlipped ? '✨ Back: Answer & Exam Hack' : `📌 Front: ${currentCard.category}`}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                        Grade {currentCard.gradeLevel}
                      </span>
                    </div>

                    <span className="text-xs font-extrabold text-slate-400">
                      Card {cardIndex + 1} of {filteredCards.length}
                    </span>
                  </div>

                  {/* Center Card Content */}
                  <div className="my-auto py-6 space-y-5">
                    {!isFlipped ? (
                      <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                        <FormattedText text={currentCard.front} />
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                          <FormattedText text={currentCard.back} />
                        </div>

                        {currentCard.formulaHighlight && (
                          <div className="p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-bold text-sm sm:text-base">
                            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                              Golden Formula / Structure to Memorise
                            </div>
                            <FormattedText text={`$$${currentCard.formulaHighlight}$$`} />
                          </div>
                        )}

                        {currentCard.examTip && (
                          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-start gap-2.5">
                            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-extrabold">Examiner Hack: </span>
                              <FormattedText text={currentCard.examTip} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Flip Hint */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400">
                    <span>Click card or press Spacebar to flip</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                      {isFlipped ? 'Show Question Front ↺' : 'Reveal Answer & Formula →'}
                    </span>
                  </div>
                </div>

                {/* Spaced Repetition Confidence Rating + Prev/Next Controls */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setCardIndex(
                          (prev) =>
                            (prev - 1 + filteredCards.length) % filteredCards.length
                        );
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      title="Previous card"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-bold text-slate-500 px-2">
                      Rate how well you knew this card:
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleRateCard('again')}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-extrabold transition-all"
                    >
                      🔴 Still Learning
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRateCard('good')}
                      className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-extrabold transition-all"
                    >
                      🟡 Getting There
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRateCard('easy')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all"
                    >
                      🟢 Mastered!
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex((prev) => (prev + 1) % filteredCards.length);
                    }}
                    className="hidden sm:flex p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    title="Next card"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Topic Formula Cheat-Sheet & Deck Mastery */}
          <div className="space-y-4">
            {/* Deck Mastery Progress */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  Topic Flashcard Mastery
                </h3>
                <Award className="w-5 h-5 text-indigo-600" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {topicProgress.masteredCardIds.length} / {rawCards.length}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Cards Mastered
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <div className="text-2xl font-black text-rose-700 dark:text-rose-300">
                    {topicProgress.learningCardIds.length}
                  </div>
                  <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    Marked for Review
                  </div>
                </div>
              </div>

              {/* Switch to Audio Pod CTA */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white space-y-2.5">
                <div className="flex items-center gap-2 text-pink-300 text-xs font-extrabold uppercase">
                  <Headphones className="w-4 h-4" />
                  <span>Prefer Audio + Visuals?</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Listen to Alex & Maya break down the crucial formulas and 60-second exam shortcuts for{' '}
                  <strong>{currentPod.topicName}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMode('pods')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-indigo-950 font-extrabold text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-indigo-950" />
                  <span>Watch & Listen to Study Pod</span>
                </button>
              </div>

              {/* Direct Link to Custom Practice on This Topic */}
              <Link
                href={`/practice?topicId=${selectedTopicId}`}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Practice Adaptive Questions on This Topic</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Crucial 3 Rules Box */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Flame className="w-4 h-4" />
                <span>3 Rules That Solve 90% of Problems</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                {currentPod.threeThingsToKnow.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: NOTEBOOK-LM STYLE AUDIO & VISUAL STUDY POD */}
      {activeMode === 'pods' && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Visual Slide Presentation Deck */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800/70 shadow-xl min-h-[430px] flex flex-col justify-between relative overflow-hidden">
              {/* Slide Header & Step Dots */}
              <div className="flex items-center justify-between gap-3">
                <span className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs font-black uppercase tracking-wider">
                  {activeSlide.badge}
                </span>

                <div className="flex items-center gap-1.5">
                  {currentPod.slides.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        stopPodAudio();
                        setActiveSlideIdx(idx);
                        setActiveDialogueIdx(0);
                      }}
                      className={`h-2.5 rounded-full transition-all ${
                        idx === activeSlideIdx
                          ? 'w-8 bg-pink-400'
                          : 'w-2.5 bg-white/25 hover:bg-white/50'
                      }`}
                      title={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Slide Visual Centerpiece */}
              <div className="my-6 space-y-5">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {activeSlide.title}
                </h2>

                {/* Formula / Core Rule Spotlight Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-200 font-bold text-sm sm:text-base shadow-inner">
                  <div className="text-[10px] font-black uppercase tracking-wider text-indigo-200 mb-1.5">
                    Key Formula / Exam Blueprint
                  </div>
                  <FormattedText
                    text={
                      activeSlide.headlineFormula.includes('\\')
                        ? `$$${activeSlide.headlineFormula}$$`
                        : activeSlide.headlineFormula
                    }
                  />
                </div>

                {/* Visual Key Takeaways */}
                <div className="space-y-2.5">
                  {activeSlide.keyTakeaways.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-start gap-3 text-xs sm:text-sm text-slate-100 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <FormattedText text={pt} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Trap vs Grade 9 Comparison */}
                {activeSlide.comparison && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs">
                      <div className="font-black text-rose-300 uppercase mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Common Grade 5 Trap</span>
                      </div>
                      <p className="text-rose-100">{activeSlide.comparison.commonTrap}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs">
                      <div className="font-black text-emerald-300 uppercase mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Grade 9 Examiner Booster</span>
                      </div>
                      <p className="text-emerald-100">{activeSlide.comparison.grade9Fix}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Slide Footer Controls */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  disabled={activeSlideIdx === 0}
                  onClick={() => {
                    stopPodAudio();
                    setActiveSlideIdx((prev) => Math.max(0, prev - 1));
                    setActiveDialogueIdx(0);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev Slide</span>
                </button>

                <span className="text-xs font-bold text-indigo-200">
                  Visual Slide {activeSlideIdx + 1} of {currentPod.slides.length}
                </span>

                <button
                  type="button"
                  disabled={activeSlideIdx === currentPod.slides.length - 1}
                  onClick={() => {
                    stopPodAudio();
                    setActiveSlideIdx((prev) =>
                      Math.min(currentPod.slides.length - 1, prev + 1)
                    );
                    setActiveDialogueIdx(0);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next Slide</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: NotebookLM Dual-Host Audio Player & Interactive Transcript */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              {/* Audio Player Control Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={togglePlayPod}
                      className="w-11 h-11 rounded-2xl bg-white text-indigo-900 hover:scale-105 transition-transform flex items-center justify-center shadow-md"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-5 h-5 fill-indigo-900" />
                      ) : (
                        <Play className="w-5 h-5 fill-indigo-900 ml-0.5" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-pink-200">
                        {isPlayingAudio ? '🔊 Playing Audio Pod...' : '🎧 AI Study Pod Ready'}
                      </div>
                      <div className="text-sm font-extrabold">
                        Alex (Coach) & Maya (Student)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const nextRate =
                          playbackRate === 1.0 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1.0;
                        setPlaybackRate(nextRate);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-black"
                      title="Change narration speed"
                    >
                      {playbackRate}x
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMuted((prev) => !prev);
                        if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                      }}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30"
                      title="Mute / Unmute voice"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopPodAudio();
                        setActiveSlideIdx(0);
                        setActiveDialogueIdx(0);
                      }}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30"
                      title="Restart Pod"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversational Transcript for Active Slide */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  <span>Interactive Script (Click any line to speak)</span>
                  <span>Slide {activeSlideIdx + 1}</span>
                </div>

                <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                  {activeSlide.dialogue.map((line, idx) => {
                    const isCoach = line.speaker.includes('Alex');
                    const isCurrentLine = isPlayingAudio && activeDialogueIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          speechActiveRef.current = true;
                          setIsPlayingAudio(true);
                          speakDialogueLine(activeSlideIdx, idx);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                          isCurrentLine
                            ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/70 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[11px] font-black uppercase tracking-wider ${
                              isCoach
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-pink-600 dark:text-pink-400'
                            }`}
                          >
                            {isCoach ? '🎓 Alex (GCSE Coach)' : '🙋‍♀️ Maya (Year 11 Student)'}
                          </span>
                          {isCurrentLine && (
                            <span className="text-[10px] font-extrabold text-indigo-600 animate-pulse">
                              Speaking...
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                          {line.text}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    stopPodAudio();
                    setActiveMode('flashcards');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Drill Topic Flashcards</span>
                </button>
                <Link
                  href={`/practice?topicId=${selectedTopicId}`}
                  onClick={() => stopPodAudio()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Test My Mastery Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Level & Covered Topics Modal */}
      <LevelCheckInModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        initialSubjectId={selectedSubjectId}
        onCompleted={() => {
          setCoverageMap(UserStore.getTopicCoverageMap());
        }}
      />
    </div>
  );
}

export default function FlashcardsAndPodsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 font-bold">
          Loading GCSE Flashcards & Audio-Visual Study Pods...
        </div>
      }
    >
      <FlashcardsAndPodsContent />
    </Suspense>
  );
}

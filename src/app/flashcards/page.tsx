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
  Sparkles,
  Flame,
  Lightbulb,
  ArrowRight,
  Sliders,
  Award,
} from 'lucide-react';
import { GCSE_SUBJECTS, GCSE_TOPICS } from '@/lib/curriculum/gcse-data';
import {
  getTopicFlashcards,
  getTopicStudyPod,
  TopicFlashcard,
} from '@/lib/curriculum/study-pods-data';
import {
  UserStore,
  FlashcardTopicProgress,
  StudentTopicCoverage,
} from '@/lib/user-store';
import { FormattedText } from '@/components/FormattedText';
import { LevelCheckInModal } from '@/components/LevelCheckInModal';
import { PodVisualDiagram } from '@/components/PodVisualDiagram';

const MALE_VOICE_KEYWORDS = [
  'google uk english male',
  'daniel',
  'oliver',
  'arthur',
  'ryan',
  'george',
  'thomas',
  'james',
  'david',
  'mark',
  'aaron',
  'reed',
  'alex',
  'rishi',
  'tom',
  'gordon',
  'lee',
  'fred',
];

const FEMALE_VOICE_KEYWORDS = [
  'google uk english female',
  'serena',
  'kate',
  'martha',
  'sonia',
  'libby',
  'hazel',
  'samantha',
  'victoria',
  'karen',
  'moira',
  'tessa',
  'fiona',
  'ava',
  'allison',
  'susan',
  'zoe',
];

function isExplicitMaleVoice(nameLower: string): boolean {
  if (nameLower.includes('female')) return false;
  if (/\bmale\b/.test(nameLower)) return true;
  return MALE_VOICE_KEYWORDS.some((kw) => nameLower.includes(kw));
}

function isExplicitFemaleVoice(nameLower: string): boolean {
  if (nameLower.includes('female')) return true;
  return FEMALE_VOICE_KEYWORDS.some((kw) => nameLower.includes(kw));
}

/**
 * Picks two guaranteed distinct voices:
 * - Dan: Male UK/English voice
 * - Mia: Female UK/English voice
 */
function selectDanAndMiaVoices(voices: SpeechSynthesisVoice[]): {
  danVoice: SpeechSynthesisVoice | null;
  miaVoice: SpeechSynthesisVoice | null;
  sameUnderlyingVoice: boolean;
} {
  if (!voices || voices.length === 0) {
    return { danVoice: null, miaVoice: null, sameUnderlyingVoice: true };
  }

  const enVoices = voices.filter((v) =>
    v.lang.toLowerCase().replace('_', '-').startsWith('en')
  );
  const pool = enVoices.length > 0 ? enVoices : voices;

  const qualityScore = (v: SpeechSynthesisVoice): number => {
    const n = v.name.toLowerCase();
    const l = v.lang.toLowerCase();
    let s = 0;
    if (l.includes('gb') || l.includes('uk')) s += 35;
    if (n.includes('natural') || n.includes('neural') || n.includes('online')) s += 50;
    if (n.includes('google uk english')) s += 45;
    if (n.includes('premium') || n.includes('enhanced')) s += 30;
    if (n.includes('compact') || n.includes('zarvox') || n.includes('bells')) s -= 80;
    return s;
  };

  const maleCandidates = pool
    .filter((v) => isExplicitMaleVoice(v.name.toLowerCase()))
    .sort((a, b) => qualityScore(b) - qualityScore(a));

  const femaleCandidates = pool
    .filter((v) => isExplicitFemaleVoice(v.name.toLowerCase()))
    .sort((a, b) => qualityScore(b) - qualityScore(a));

  const sortedAll = [...pool].sort((a, b) => qualityScore(b) - qualityScore(a));

  const danVoice = maleCandidates[0] || sortedAll[0] || null;
  const miaVoice =
    femaleCandidates.find((v) => v.name !== danVoice?.name) ||
    sortedAll.find((v) => v.name !== danVoice?.name) ||
    danVoice;

  const sameUnderlyingVoice =
    !danVoice || !miaVoice || danVoice.name === miaVoice.name;

  return { danVoice, miaVoice, sameUnderlyingVoice };
}

function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2')
    .replace(/\\times/g, ' times ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\Delta/g, ' change in ')
    .replace(/\\lambda/g, ' wavelength ')
    .replace(/\\rightarrow/g, ' leads to ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];

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

  // Audio-Visual Pod state (default 1.25x so speech is brisk and energetic)
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [activeDialogueIdx, setActiveDialogueIdx] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.25);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [spokenCharProgress, setSpokenCharProgress] = useState<number>(0);

  // Refs to ensure instant speed changes and zero stale closures
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechActiveRef = useRef<boolean>(false);
  const playbackRateRef = useRef<number>(1.25);
  const isMutedRef = useRef<boolean>(false);
  const activeSlideIdxRef = useRef<number>(0);
  const activeDialogueIdxRef = useRef<number>(0);
  const spokenCharProgressRef = useRef<number>(0);
  const utteranceSessionIdRef = useRef<number>(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dialogueItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFlashcardProgressMap(UserStore.getFlashcardProgressMap());
    setCoverageMap(UserStore.getTopicCoverageMap());

    // Pre-warm browser voices list
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

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
      stopPodAudio();
    };
  }, [initialTopicParam, initialSubjectParam]);

  const subjectTopics = useMemo(() => {
    const allInSubject = GCSE_TOPICS.filter((t) => t.subjectId === selectedSubjectId);
    if (!onlyCoveredTopics) return allInSubject;
    const coveredInSubject = allInSubject.filter(
      (t) => coverageMap[t.id] && coverageMap[t.id].status !== 'not_covered'
    );
    return coveredInSubject.length > 0 ? coveredInSubject : allInSubject;
  }, [selectedSubjectId, onlyCoveredTopics, coverageMap]);

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

  useEffect(() => {
    setCardIndex(0);
    setIsFlipped(false);
    setShuffledOrder([]);
    stopPodAudio();
    setActiveSlideIdx(0);
    setActiveDialogueIdx(0);
    activeSlideIdxRef.current = 0;
    activeDialogueIdxRef.current = 0;
  }, [selectedTopicId, selectedCategory]);

  const currentCard: TopicFlashcard | undefined = filteredCards[cardIndex];
  const currentTopicObj = useMemo(
    () => GCSE_TOPICS.find((t) => t.id === selectedTopicId) || GCSE_TOPICS[0],
    [selectedTopicId]
  );
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

  // Auto-scroll active dialogue bubble inside the transcript container
  useEffect(() => {
    if (activeMode !== 'pods') return;
    const activeEl = dialogueItemRefs.current[activeDialogueIdx];
    const container = transcriptContainerRef.current;
    if (activeEl && container) {
      const elTop = activeEl.offsetTop;
      const elHeight = activeEl.offsetHeight;
      const containerHeight = container.clientHeight;
      const targetScroll = Math.max(0, elTop - containerHeight / 2 + elHeight / 2);
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    }
  }, [activeDialogueIdx, activeSlideIdx, activeMode]);

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

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const stopPodAudio = () => {
    utteranceSessionIdRef.current += 1;
    speechActiveRef.current = false;
    setIsPlayingAudio(false);
    setSpokenCharProgress(0);
    spokenCharProgressRef.current = 0;
    clearProgressTimer();

    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  /**
   * Offline fallback only if network neural audio cannot be reached.
   */
  const speakWithBrowserFallback = (
    slideIdx: number,
    lineIdx: number,
    line: { speaker: string; text: string },
    currentSessionId: number,
    startCharOffset = 0
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const fullText = cleanTextForSpeech(line.text);
    const remainingText =
      startCharOffset > 0 && startCharOffset < fullText.length
        ? fullText.slice(startCharOffset)
        : fullText;
    const baseOffset =
      startCharOffset > 0 && startCharOffset < fullText.length
        ? startCharOffset
        : 0;

    const isDanMale = line.speaker === 'Dan';
    const currentSpeed = playbackRateRef.current;

    const utterance = new SpeechSynthesisUtterance(remainingText);
    utterance.lang = 'en-GB';
    utterance.rate = currentSpeed;

    const voices = window.speechSynthesis.getVoices();
    const { danVoice, miaVoice, sameUnderlyingVoice } =
      selectDanAndMiaVoices(voices);

    if (isDanMale) {
      if (danVoice) utterance.voice = danVoice;
      utterance.pitch = sameUnderlyingVoice ? 0.85 : 0.96;
    } else {
      if (miaVoice) utterance.voice = miaVoice;
      utterance.pitch = sameUnderlyingVoice ? 1.15 : 1.04;
    }

    utterance.onboundary = (event) => {
      if (utteranceSessionIdRef.current !== currentSessionId) return;
      if (typeof event.charIndex === 'number') {
        const nextProgress = Math.min(
          line.text.length,
          baseOffset + event.charIndex
        );
        spokenCharProgressRef.current = nextProgress;
        setSpokenCharProgress(nextProgress);
      }
    };

    utterance.onend = () => {
      if (utteranceSessionIdRef.current !== currentSessionId) return;
      clearProgressTimer();
      setSpokenCharProgress(line.text.length);
      spokenCharProgressRef.current = line.text.length;
      if (!speechActiveRef.current) return;
      speakDialogueLine(slideIdx, lineIdx + 1, 0);
    };

    utterance.onerror = () => {
      if (utteranceSessionIdRef.current !== currentSessionId) return;
      clearProgressTimer();
    };

    window.speechSynthesis.speak(utterance);
  };

  /**
   * Speaks a dialogue line using real UK Neural Human Voices (/api/tts):
   * - Dan: British Male Neural Voice (Amazon Polly Brian)
   * - Mia: British Female Neural Voice (Amazon Polly Amy)
   * - Instant live speed control (1x - 2x) locked onto HTMLAudioElement.playbackRate
   */
  const speakDialogueLine = (
    slideIdx: number,
    lineIdx: number,
    startCharOffset = 0
  ) => {
    if (typeof window === 'undefined') return;

    const slide = currentPod.slides[slideIdx];
    if (!slide) {
      stopPodAudio();
      return;
    }
    const line = slide.dialogue[lineIdx];
    if (!line) {
      if (slideIdx + 1 < currentPod.slides.length) {
        activeSlideIdxRef.current = slideIdx + 1;
        activeDialogueIdxRef.current = 0;
        setActiveSlideIdx(slideIdx + 1);
        setActiveDialogueIdx(0);
        speakDialogueLine(slideIdx + 1, 0, 0);
      } else {
        stopPodAudio();
      }
      return;
    }

    activeSlideIdxRef.current = slideIdx;
    activeDialogueIdxRef.current = lineIdx;
    setActiveSlideIdx(slideIdx);
    setActiveDialogueIdx(lineIdx);
    setSpokenCharProgress(startCharOffset);
    spokenCharProgressRef.current = startCharOffset;
    clearProgressTimer();

    const currentSessionId = ++utteranceSessionIdRef.current;

    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (isMutedRef.current) return;

    const fullText = cleanTextForSpeech(line.text);
    const ttsUrl = `/api/tts?speaker=${encodeURIComponent(
      line.speaker
    )}&text=${encodeURIComponent(fullText)}`;

    const audio = new Audio(ttsUrl);
    audioRef.current = audio;

    const applyLockedSpeed = () => {
      audio.playbackRate = playbackRateRef.current;
      if ('preservesPitch' in audio) {
        (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch =
          true;
      }
    };

    applyLockedSpeed();
    audio.onloadedmetadata = applyLockedSpeed;
    audio.onplay = applyLockedSpeed;

    audio.ontimeupdate = () => {
      if (utteranceSessionIdRef.current !== currentSessionId) return;
      if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
        const pct = Math.min(1, audio.currentTime / audio.duration);
        const nextChar = Math.min(
          line.text.length,
          Math.floor(pct * line.text.length)
        );
        spokenCharProgressRef.current = nextChar;
        setSpokenCharProgress(nextChar);
      }
    };

    audio.onended = () => {
      if (utteranceSessionIdRef.current !== currentSessionId) return;
      clearProgressTimer();
      setSpokenCharProgress(line.text.length);
      spokenCharProgressRef.current = line.text.length;
      if (!speechActiveRef.current) return;
      speakDialogueLine(slideIdx, lineIdx + 1, 0);
    };

    audio.onerror = () => {
      if (utteranceSessionIdRef.current !== currentSessionId) return;
      audioRef.current = null;
      speakWithBrowserFallback(
        slideIdx,
        lineIdx,
        line,
        currentSessionId,
        startCharOffset
      );
    };

    audio.play().catch(() => {
      if (utteranceSessionIdRef.current !== currentSessionId) return;
      audioRef.current = null;
      speakWithBrowserFallback(
        slideIdx,
        lineIdx,
        line,
        currentSessionId,
        startCharOffset
      );
    });
  };

  const togglePlayPod = () => {
    if (isPlayingAudio) {
      stopPodAudio();
    } else {
      speechActiveRef.current = true;
      setIsPlayingAudio(true);
      speakDialogueLine(activeSlideIdxRef.current, activeDialogueIdxRef.current, 0);
    }
  };

  /**
   * Instant speed change: updates playbackRateRef and immediately applies
   * the new speed in real time to the active HTMLAudioElement stream!
   */
  const handleSpeedChange = (newRate: number) => {
    playbackRateRef.current = newRate;
    setPlaybackRate(newRate);

    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
      return;
    }

    if (isPlayingAudio && speechActiveRef.current) {
      const slide = currentPod.slides[activeSlideIdxRef.current];
      const line = slide?.dialogue[activeDialogueIdxRef.current];
      let resumeOffset = spokenCharProgressRef.current;
      if (line && resumeOffset > 0 && resumeOffset < line.text.length - 5) {
        const prevSpace = line.text.lastIndexOf(' ', resumeOffset);
        resumeOffset = prevSpace > 0 ? prevSpace + 1 : 0;
      } else {
        resumeOffset = 0;
      }
      speakDialogueLine(
        activeSlideIdxRef.current,
        activeDialogueIdxRef.current,
        resumeOffset
      );
    }
  };

  const activeSlide = currentPod.slides[activeSlideIdx] || currentPod.slides[0];
  const activeDialogueLine =
    activeSlide.dialogue[activeDialogueIdx] || activeSlide.dialogue[0];
  const currentTopicCoverage = coverageMap[selectedTopicId];

  return (
    <div className="space-y-6">
      {/* Top Studio Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/60 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>GCSE Study Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Flashcards & Audio Lessons
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Learn the key formulas, 3-step methods, and worked examples for every GCSE topic.
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
                <span>Flashcards ({rawCards.length})</span>
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
                <span>Audio Lesson</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsLevelModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Sliders className="w-4 h-4" />
              <span>My Level & Topics</span>
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
              <span className="text-xs font-bold text-indigo-200">Topic:</span>
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
                  {currentTopicCoverage.status === 'confident'
                    ? 'Confident'
                    : 'Needs Practice'}{' '}
                  • Grade {currentTopicCoverage.selfAssessedGrade}
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
              <span>Only topics covered in school</span>
            </label>
          </div>
        </div>
      </div>

      {/* MODE 1: INTERACTIVE 3D FLASHCARDS */}
      {activeMode === 'flashcards' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
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
                <span>Shuffle</span>
              </button>
            </div>

            {currentCard && (
              <div className="space-y-4">
                <div
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="cursor-pointer select-none min-h-[340px] sm:min-h-[380px] rounded-3xl p-6 sm:p-10 border-2 transition-all duration-300 shadow-lg flex flex-col justify-between relative overflow-hidden bg-white dark:bg-slate-900 hover:shadow-xl border-indigo-200 dark:border-indigo-900/80"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                          isFlipped
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                        }`}
                      >
                        {isFlipped ? 'Answer' : currentCard.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                        Grade {currentCard.gradeLevel}
                      </span>
                    </div>

                    <span className="text-xs font-extrabold text-slate-400">
                      {cardIndex + 1} / {filteredCards.length}
                    </span>
                  </div>

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
                              Key Formula
                            </div>
                            <FormattedText text={`$$${currentCard.formulaHighlight}$$`} />
                          </div>
                        )}

                        {currentCard.examTip && (
                          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-start gap-2.5">
                            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-extrabold">Exam Tip: </span>
                              <FormattedText text={currentCard.examTip} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400">
                    <span>Click card or press Spacebar to flip</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                      {isFlipped ? 'Show Question ↺' : 'Show Answer →'}
                    </span>
                  </div>
                </div>

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
                      How well did you know this?
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
                      🟡 Almost Got It
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRateCard('easy')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all"
                    >
                      🟢 Got It!
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

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  Your Progress
                </h3>
                <Award className="w-5 h-5 text-indigo-600" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {topicProgress.masteredCardIds.length} / {rawCards.length}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Mastered
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <div className="text-2xl font-black text-rose-700 dark:text-rose-300">
                    {topicProgress.learningCardIds.length}
                  </div>
                  <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    To Review
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white space-y-2.5">
                <div className="flex items-center gap-2 text-pink-300 text-xs font-extrabold uppercase">
                  <Headphones className="w-4 h-4" />
                  <span>Audio Lesson</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Listen to Dan & Mia explain the key formulas and worked examples for{' '}
                  <strong>{currentPod.topicName}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMode('pods')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-indigo-950 font-extrabold text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-indigo-950" />
                  <span>Listen to Lesson</span>
                </button>
              </div>

              <Link
                href={`/practice?topicId=${selectedTopicId}`}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Practice Questions on This Topic</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Flame className="w-4 h-4" />
                <span>3 Key Steps</span>
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

      {/* MODE 2: AUDIO & VISUAL LESSON */}
      {activeMode === 'pods' && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Clean Topic Slide + Live Spoken Text + Topic Visual */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800/70 shadow-xl flex flex-col justify-between relative overflow-hidden space-y-5">
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
                        activeSlideIdxRef.current = idx;
                        activeDialogueIdxRef.current = 0;
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

              {/* Slide Title */}
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {activeSlide.title}
              </h2>

              {/* LIVE SPOKEN SUBTITLE BOX ON THE SLIDE */}
              {activeDialogueLine && (
                <div className="p-4 rounded-2xl bg-indigo-950/90 border-2 border-pink-400/50 shadow-lg space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-pink-300 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPlayingAudio
                            ? 'bg-emerald-400 animate-ping'
                            : 'bg-amber-400'
                        }`}
                      />
                      <span>{activeDialogueLine.speaker}</span>
                    </span>
                    <span className="text-[11px] font-bold text-indigo-300">
                      {activeDialogueIdx + 1} / {activeSlide.dialogue.length}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold leading-relaxed text-white">
                    {isPlayingAudio && spokenCharProgress > 0 ? (
                      <>
                        <span className="text-amber-300 underline decoration-pink-500/60 decoration-2 underline-offset-4">
                          {activeDialogueLine.text.slice(0, spokenCharProgress)}
                        </span>
                        <span className="text-slate-200">
                          {activeDialogueLine.text.slice(spokenCharProgress)}
                        </span>
                      </>
                    ) : (
                      activeDialogueLine.text
                    )}
                  </p>
                </div>
              )}

              {/* TOPIC-SPECIFIC VISUAL BOARD (Formulas, 3 Steps, Worked Steps, or Mistake vs Tip) */}
              <PodVisualDiagram
                topicName={currentPod.topicName}
                unitName={currentTopicObj.unitName}
                visualType={activeSlide.visualType}
                headlineFormula={activeSlide.headlineFormula}
                goldenFormulae={currentPod.goldenFormulae}
                keyTakeaways={activeSlide.keyTakeaways}
                keywords={currentTopicObj.keywords}
                comparison={activeSlide.comparison}
                activeDialogueIdx={activeDialogueIdx}
                isPlaying={isPlayingAudio}
              />

              {/* Slide Footer Controls */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  disabled={activeSlideIdx === 0}
                  onClick={() => {
                    stopPodAudio();
                    const prev = Math.max(0, activeSlideIdx - 1);
                    activeSlideIdxRef.current = prev;
                    activeDialogueIdxRef.current = 0;
                    setActiveSlideIdx(prev);
                    setActiveDialogueIdx(0);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <span className="text-xs font-bold text-indigo-200">
                  Slide {activeSlideIdx + 1} of {currentPod.slides.length}
                </span>

                <button
                  type="button"
                  disabled={activeSlideIdx === currentPod.slides.length - 1}
                  onClick={() => {
                    stopPodAudio();
                    const next = Math.min(
                      currentPod.slides.length - 1,
                      activeSlideIdx + 1
                    );
                    activeSlideIdxRef.current = next;
                    activeDialogueIdxRef.current = 0;
                    setActiveSlideIdx(next);
                    setActiveDialogueIdx(0);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Simple Player, Instant Speed Buttons (up to 2x), Auto-Scrolling Dialogue */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              {/* Audio Player Control Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlayPod}
                      className="w-12 h-12 rounded-2xl bg-white text-indigo-900 hover:scale-105 transition-transform flex items-center justify-center shadow-md shrink-0"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-5 h-5 fill-indigo-900" />
                      ) : (
                        <Play className="w-5 h-5 fill-indigo-900 ml-0.5" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-pink-200">
                        {isPlayingAudio ? 'Playing Lesson' : 'Audio Lesson'}
                      </div>
                      <div className="text-base font-extrabold">Dan & Mia</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const nextMuted = !isMuted;
                        isMutedRef.current = nextMuted;
                        setIsMuted(nextMuted);
                        if (nextMuted) {
                          stopPodAudio();
                        }
                      }}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30"
                      title="Mute / Unmute"
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
                        activeSlideIdxRef.current = 0;
                        activeDialogueIdxRef.current = 0;
                        setActiveSlideIdx(0);
                        setActiveDialogueIdx(0);
                      }}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30"
                      title="Restart"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Instant Speed Selector Bar (1x, 1.25x, 1.5x, 1.75x, 2x) */}
                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <span className="text-xs font-bold text-pink-100">Speed:</span>
                  <div className="flex items-center gap-1">
                    {SPEED_OPTIONS.map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSpeedChange(spd)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                          playbackRate === spd
                            ? 'bg-white text-indigo-900 shadow-xs'
                            : 'bg-white/15 hover:bg-white/25 text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Auto-Scrolling Dialogue List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  <span>Lesson Script</span>
                  <span>Slide {activeSlideIdx + 1}</span>
                </div>

                <div
                  ref={transcriptContainerRef}
                  className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scroll-smooth"
                >
                  {activeSlide.dialogue.map((line, idx) => {
                    const isDan = line.speaker === 'Dan';
                    const isCurrentLine = activeDialogueIdx === idx;
                    return (
                      <button
                        key={idx}
                        ref={(el) => {
                          dialogueItemRefs.current[idx] = el;
                        }}
                        type="button"
                        onClick={() => {
                          speechActiveRef.current = true;
                          setIsPlayingAudio(true);
                          speakDialogueLine(activeSlideIdx, idx, 0);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                          isCurrentLine
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/90 ring-2 ring-indigo-500/40 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 opacity-75 hover:opacity-100 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-xs font-black uppercase tracking-wider ${
                              isDan
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-pink-600 dark:text-pink-400'
                            }`}
                          >
                            {isDan ? 'Dan' : 'Mia'}
                          </span>
                          {isCurrentLine && isPlayingAudio && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold">
                              Speaking
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-semibold">
                          {isCurrentLine && isPlayingAudio && spokenCharProgress > 0 ? (
                            <>
                              <span className="bg-amber-200/70 dark:bg-amber-500/30 text-slate-950 dark:text-white px-0.5 rounded">
                                {line.text.slice(0, spokenCharProgress)}
                              </span>
                              <span>{line.text.slice(spokenCharProgress)}</span>
                            </>
                          ) : (
                            line.text
                          )}
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
                  <span>Flashcards</span>
                </button>
                <Link
                  href={`/practice?topicId=${selectedTopicId}`}
                  onClick={() => stopPodAudio()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Practice Questions</span>
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
          Loading Flashcards & Audio Lessons...
        </div>
      }
    >
      <FlashcardsAndPodsContent />
    </Suspense>
  );
}

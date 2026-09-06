import { GCSE_TOPICS, SeedQuestion, INITIAL_SEED_QUESTIONS } from '../curriculum/gcse-data';

export interface UserTopicMastery {
  topicId: string;
  masteryScore: number; // 0 to 100
  totalAttempted: number;
  totalCorrect: number;
  lastAttemptAt?: string;
}

export interface DiagnosticResult {
  estimatedGrade: number; // 1.0 to 9.0
  gradeLabel: string;
  strongTopicIds: string[];
  weaknessTopicIds: string[];
  recommendedDailyQuestions: number;
  summaryText: string;
}

export class AdaptiveEngine {
  /**
   * Recalculate topic mastery score (0-100%) after an attempt.
   * Gives higher weight to recent performance and question grade difficulty.
   */
  static calculateNewMastery(
    currentMastery: number,
    isCorrect: boolean,
    questionGradeLevel: number,
    userTargetGrade: number
  ): number {
    // Grade difficulty scaling multiplier (0.8 to 1.3)
    const difficultyMultiplier = 0.8 + (questionGradeLevel / 9.0) * 0.5;
    
    // Impact factor
    const baseDelta = isCorrect ? 15.0 : -10.0;
    const adjustedDelta = baseDelta * difficultyMultiplier;

    let updated = currentMastery + adjustedDelta;
    if (updated > 100) updated = 100;
    if (updated < 0) updated = 0;

    return Math.round(updated * 10) / 10;
  }

  /**
   * Calculate overall estimated GCSE grade (1.0 to 9.0) from topic masteries.
   */
  static calculateEstimatedGrade(masteries: UserTopicMastery[]): number {
    if (!masteries || masteries.length === 0) return 5.0; // Default baseline

    const validMasteries = masteries.filter(m => m.totalAttempted > 0);
    if (validMasteries.length === 0) return 5.0;

    const avgMastery = validMasteries.reduce((sum, m) => sum + m.masteryScore, 0) / validMasteries.length;
    
    // Scale 0-100% mastery to Grade 1.0 - 9.0
    const estimated = 1.0 + (avgMastery / 100.0) * 8.0;
    return Math.min(9.0, Math.max(1.0, Math.round(estimated * 10) / 10));
  }

  /**
   * Recommends next topics to focus on, prioritizing weakest topics & target grade gaps.
   */
  static getRecommendedTopics(
    subjectId: string,
    masteries: UserTopicMastery[],
    targetGrade: number,
    limit: number = 3
  ): { topicId: string; reason: string }[] {
    const subjectTopics = GCSE_TOPICS.filter(t => t.subjectId === subjectId);
    
    const topicScores = subjectTopics.map(topic => {
      const existing = masteries.find(m => m.topicId === topic.id);
      const score = existing ? existing.masteryScore : 0.0;
      const attempted = existing ? existing.totalAttempted : 0;
      return { topicId: topic.id, topicName: topic.topicName, score, attempted };
    });

    // Sort by lowest mastery score first (weakest topic priority)
    topicScores.sort((a, b) => a.score - b.score);

    return topicScores.slice(0, limit).map(t => ({
      topicId: t.topicId,
      reason: t.attempted === 0 
        ? 'Henüz çalışılmadı (Seviye Tesbiti gerekli)' 
        : `Düşük Ustalık Skoru (%${t.score} - Hedef Grade ${targetGrade}'e ulaşmak için geliştirilmeli)`,
    }));
  }

  /**
   * Selects an adaptive question tailored to the student's mastery level for a specific topic.
   * Ensures the student demonstrates mastery before promoting to higher grade questions.
   */
  static getAdaptiveQuestionForTopic(
    topicId: string,
    currentGradeLevel: number = 4
  ): SeedQuestion {
    const topicQuestions = INITIAL_SEED_QUESTIONS.filter(q => q.topicId === topicId);
    
    if (topicQuestions.length > 0) {
      // Find question closest to current grade level
      const sorted = [...topicQuestions].sort(
        (a, b) => Math.abs(a.gradeLevel - currentGradeLevel) - Math.abs(b.gradeLevel - currentGradeLevel)
      );
      return sorted[0];
    }

    // Fallback seed question if specific topic seed is sparse
    const topicObj = GCSE_TOPICS.find(t => t.id === topicId);
    const fallback = INITIAL_SEED_QUESTIONS.find(q => q.gradeLevel <= currentGradeLevel) || INITIAL_SEED_QUESTIONS[0];
    
    return {
      ...fallback,
      id: `adaptive-${topicId}-${Date.now()}`,
      topicId: topicId,
      gradeLevel: Math.min(9, Math.max(4, currentGradeLevel)),
      questionText: topicObj 
        ? `[Grade ${currentGradeLevel} GCSE Assessment] Regarding ${topicObj.topicName}: ${fallback.questionText.replace(/Solve the quadratic|A 2.0 kg block|Which CPU|In Shakespeare’s|What was a primary|At which type/g, 'Evaluate the key principles of')}`
        : fallback.questionText,
    };
  }

  /**
   * Generates 5 quick snapshot questions spanning different subjects & topics.
   */
  static getQuickSnapshotQuestions(count: number = 5): SeedQuestion[] {
    const shuffled = [...INITIAL_SEED_QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Generates a diagnostic result based on diagnostic test attempts.
   */
  static evaluateDiagnosticTest(attempts: { questionGrade: number; isCorrect: boolean; topicId: string }[]): DiagnosticResult {
    let totalScore = 0;
    let maxPossible = 0;
    const topicMap: Record<string, { correct: number; total: number }> = {};

    attempts.forEach(att => {
      const weight = att.questionGrade;
      maxPossible += weight;
      if (att.isCorrect) totalScore += weight;

      if (!topicMap[att.topicId]) topicMap[att.topicId] = { correct: 0, total: 0 };
      topicMap[att.topicId].total += 1;
      if (att.isCorrect) topicMap[att.topicId].correct += 1;
    });

    const ratio = maxPossible > 0 ? totalScore / maxPossible : 0.5;
    const estimatedGrade = Math.min(9.0, Math.max(1.0, Math.round((1.0 + ratio * 8.0) * 10) / 10));

    const strongTopicIds: string[] = [];
    const weaknessTopicIds: string[] = [];

    Object.entries(topicMap).forEach(([tId, stat]) => {
      if (stat.correct / stat.total >= 0.7) {
        strongTopicIds.push(tId);
      } else {
        weaknessTopicIds.push(tId);
      }
    });

    return {
      estimatedGrade,
      gradeLabel: `Grade ${Math.floor(estimatedGrade)}`,
      strongTopicIds,
      weaknessTopicIds,
      recommendedDailyQuestions: estimatedGrade >= 7 ? 20 : 15,
      summaryText: `Based on your diagnostic assessment, your current working level is estimated at Grade ${Math.floor(estimatedGrade)}. Your adaptive study path has been calibrated to help you reach Grade 9!`,
    };
  }
}

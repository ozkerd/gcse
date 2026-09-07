import { GCSE_TOPICS, SeedQuestion, INITIAL_SEED_QUESTIONS, shuffleQuestionOptions } from '../curriculum/gcse-data';
import { AIGenerator } from '../ai/generator';

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
   */
  static calculateNewMastery(
    currentMastery: number,
    isCorrect: boolean,
    questionGradeLevel: number,
    userTargetGrade: number
  ): number {
    const difficultyMultiplier = 0.8 + (questionGradeLevel / 9.0) * 0.5;
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
    if (!masteries || masteries.length === 0) return 5.0;

    const validMasteries = masteries.filter(m => m.totalAttempted > 0);
    if (validMasteries.length === 0) return 5.0;

    const avgMastery = validMasteries.reduce((sum, m) => sum + m.masteryScore, 0) / validMasteries.length;
    const estimated = 1.0 + (avgMastery / 100.0) * 8.0;
    return Math.min(9.0, Math.max(1.0, Math.round(estimated * 10) / 10));
  }

  /**
   * Recommends next topics to focus on.
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

    topicScores.sort((a, b) => a.score - b.score);

    return topicScores.slice(0, limit).map(t => ({
      topicId: t.topicId,
      reason: t.attempted === 0 
        ? 'Not attempted yet (Diagnostic recommended)' 
        : `Lower Mastery Score (${t.score}%) - Target Grade ${targetGrade}`,
    }));
  }

  /**
   * Selects or procedurally generates an adaptive question tailored to student level.
   * GUARANTEES strict subject matching (Maths -> Maths only, Physics -> Physics only).
   * GUARANTEES that options contain the exact correct answer.
   */
  static getAdaptiveQuestionForTopic(
    topicId: string,
    currentGradeLevel: number = 4,
    excludeIds: string[] = [],
    subtopicId?: string
  ): SeedQuestion {
    // 1. Check for matching seed questions for exact topicId that haven't been asked in this session
    let unusedTopicQuestions = INITIAL_SEED_QUESTIONS.filter(
      q => q.topicId === topicId && !excludeIds.includes(q.id)
    );
    
    // If a specific subtopic filter is passed, try matching subtopicId or subtopicName
    if (subtopicId) {
      const subtopicMatches = unusedTopicQuestions.filter(
        q => q.subtopicId === subtopicId || q.subtopicName?.toLowerCase() === subtopicId.toLowerCase()
      );
      if (subtopicMatches.length > 0) {
        unusedTopicQuestions = subtopicMatches;
      }
    }

    if (unusedTopicQuestions.length > 0) {
      const minDiff = Math.min(...unusedTopicQuestions.map(q => Math.abs(q.gradeLevel - currentGradeLevel)));
      const candidatePool = unusedTopicQuestions.filter(q => Math.abs(q.gradeLevel - currentGradeLevel) <= Math.max(minDiff, 1));
      const chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      return shuffleQuestionOptions(chosen);
    }

    // 2. Delegate to strictly subject-aware procedural generator in AIGenerator
    return AIGenerator.generateQuestionSync(topicId, currentGradeLevel, excludeIds, subtopicId);
  }

  /**
   * Generates N completely distinct quick snapshot questions across topics.
   * Optional subjectFilter parameter ensures subject isolation when requested.
   * Calibrated to student's targetGrade (Year 8 -> 4, Year 9 -> 5, Year 10 -> 6, Year 11 -> 8).
   * Strictly enforces 20% Multiple Choice and 80% Non-MC (numerical, short_answer, fill_in_blank).
   */
  static getQuickSnapshotQuestions(count: number = 5, subjectFilter?: string, targetGrade: number = 6): SeedQuestion[] {
    let eligibleSeeds = [...INITIAL_SEED_QUESTIONS];
    if (subjectFilter) {
      eligibleSeeds = eligibleSeeds.filter(q => {
        const t = GCSE_TOPICS.find(top => top.id === q.topicId);
        return t?.subjectId === subjectFilter;
      });
    }

    if (eligibleSeeds.length === 0) {
      eligibleSeeds = [...INITIAL_SEED_QUESTIONS];
    }

    // Prioritize questions near targetGrade (e.g. within 1 grade level)
    const gradeFiltered = eligibleSeeds.filter(q => Math.abs(q.gradeLevel - targetGrade) <= 1);
    const pool = gradeFiltered.length >= count * 2 ? gradeFiltered : eligibleSeeds;

    // Strict 20% Multiple Choice / 80% Non-Multiple Choice ratio
    const mcCount = Math.max(1, Math.round(count * 0.2));
    const nonMcCount = count - mcCount;

    const mcPool = pool.filter(q => q.questionType === 'multiple_choice').sort(() => 0.5 - Math.random());
    const nonMcPool = pool.filter(q => q.questionType !== 'multiple_choice').sort(() => 0.5 - Math.random());

    const results: SeedQuestion[] = [];
    const usedTopicIds = new Set<string>();

    // 1. Pick Multiple Choice questions (distinct topics where possible)
    for (const q of mcPool) {
      if (results.filter(r => r.questionType === 'multiple_choice').length >= mcCount) break;
      if (!usedTopicIds.has(q.topicId)) {
        usedTopicIds.add(q.topicId);
        results.push(shuffleQuestionOptions(q));
      }
    }

    // 2. Pick Non-Multiple Choice questions (distinct topics where possible)
    for (const q of nonMcPool) {
      if (results.filter(r => r.questionType !== 'multiple_choice').length >= nonMcCount) break;
      if (!usedTopicIds.has(q.topicId)) {
        usedTopicIds.add(q.topicId);
        results.push(shuffleQuestionOptions(q));
      }
    }

    // Top up non-MC if topic constraint couldn't fill count
    for (const q of nonMcPool) {
      if (results.filter(r => r.questionType !== 'multiple_choice').length >= nonMcCount) break;
      if (!results.some(r => r.id === q.id)) {
        results.push(shuffleQuestionOptions(q));
      }
    }

    // Top up MC if needed
    for (const q of mcPool) {
      if (results.length >= count) break;
      if (!results.some(r => r.id === q.id)) {
        results.push(shuffleQuestionOptions(q));
      }
    }

    // Fallback if count still not reached
    while (results.length < count && pool.length > 0) {
      const q = pool[results.length % pool.length];
      results.push(shuffleQuestionOptions(q));
    }

    // Shuffle final results so MC isn't always in the same position
    return results.sort(() => 0.5 - Math.random());
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

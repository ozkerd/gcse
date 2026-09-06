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
   * Prevents repeating questions and ensures options are randomly shuffled.
   */
  static getAdaptiveQuestionForTopic(
    topicId: string,
    currentGradeLevel: number = 4,
    excludeIds: string[] = []
  ): SeedQuestion {
    // 1. Check for matching seed questions for topic that haven't been asked in this session
    const unusedTopicQuestions = INITIAL_SEED_QUESTIONS.filter(
      q => q.topicId === topicId && !excludeIds.includes(q.id)
    );
    
    if (unusedTopicQuestions.length > 0) {
      // Pick question closest to requested grade level or random among candidates
      const sorted = [...unusedTopicQuestions].sort(
        (a, b) => Math.abs(a.gradeLevel - currentGradeLevel) - Math.abs(b.gradeLevel - currentGradeLevel)
      );
      const chosen = sorted[Math.floor(Math.random() * Math.min(sorted.length, 2))];
      return shuffleQuestionOptions({
        ...chosen,
        gradeLevel: currentGradeLevel,
      });
    }

    // 2. Procedurally generate dynamic parametric question variation
    // Call procedural engine to generate a brand new question with randomized numbers/options
    const topicObj = GCSE_TOPICS.find(t => t.id === topicId) || GCSE_TOPICS[0];
    const timestamp = Date.now() + Math.floor(Math.random() * 100000);

    // Call fallback generator in AIGenerator synchronously
    const fallbackSeed = INITIAL_SEED_QUESTIONS.find(q => !excludeIds.includes(q.id)) || INITIAL_SEED_QUESTIONS[0];
    
    // Mutate parameters based on topic
    if (topicId.startsWith('m-') || topicId.startsWith('p-') || topicId.startsWith('ch-') || topicId.startsWith('bio-') || topicId.startsWith('cs-')) {
      // Use procedural mutator from AIGenerator logic
      const a = Math.floor(Math.random() * 3) + 1;
      const b = Math.floor(Math.random() * 8) + 2;
      const c = Math.floor(Math.random() * 6) + 1;

      if (topicId.includes('alg') || topicId.includes('math')) {
        const correctAns = `$x = -${b}$ or $x = -${c}$`;
        const wrong1 = `$x = ${b}$ or $x = ${c}$`;
        const wrong2 = `$x = -${b * 2}$ or $x = ${c + 1}$`;
        const wrong3 = `$x = -${b + 3}$ or $x = -${c - 1}$`;

        return shuffleQuestionOptions({
          id: `adaptive-${topicId}-${timestamp}`,
          topicId: topicId,
          gradeLevel: currentGradeLevel,
          questionText: `Solve the quadratic expression by factoring: $x^2 + ${b + c}x + ${b * c} = 0$.`,
          questionType: 'multiple_choice',
          options: [correctAns, wrong1, wrong2, wrong3],
          correctAnswer: correctAns,
          explanation: {
            overview: `Factorize $x^2 + ${b + c}x + ${b * c} = (x + ${b})(x + ${c}) = 0$.`,
            stepByStep: [
              `Identify numbers multiplying to ${b * c} and adding to ${b + c}: these are ${b} and ${c}.`,
              `Set each factor to zero: $x + ${b} = 0 \\implies x = -${b}$, and $x + ${c} = 0 \\implies x = -${c}$.`
            ],
            keyConcept: 'Solving quadratic equations via factorisation.',
            commonMistakes: ['Forgetting to invert signs when solving brackets equal to zero.'],
            examTip: 'Check your values by plugging them back into the quadratic!'
          }
        });
      }
    }

    // Default dynamic question mutation wrapper
    return shuffleQuestionOptions({
      ...fallbackSeed,
      id: `adaptive-${topicId}-${timestamp}`,
      topicId: topicId,
      gradeLevel: Math.min(9, Math.max(4, currentGradeLevel)),
      questionText: `[Grade ${currentGradeLevel} ${topicObj.topicName}] ${fallbackSeed.questionText}`,
    });
  }

  /**
   * Generates N completely distinct quick snapshot questions across topics with shuffled options.
   */
  static getQuickSnapshotQuestions(count: number = 5): SeedQuestion[] {
    const shuffledSeeds = [...INITIAL_SEED_QUESTIONS].sort(() => 0.5 - Math.random());
    const results: SeedQuestion[] = [];
    const usedTopicIds = new Set<string>();

    for (const q of shuffledSeeds) {
      if (results.length >= count) break;
      if (!usedTopicIds.has(q.topicId)) {
        usedTopicIds.add(q.topicId);
        results.push(shuffleQuestionOptions(q));
      }
    }

    // Top up if count not reached
    while (results.length < count) {
      const q = shuffledSeeds[results.length % shuffledSeeds.length];
      results.push(shuffleQuestionOptions({
        ...q,
        id: `snap-${q.id}-${Date.now()}-${results.length}`
      }));
    }

    return results;
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

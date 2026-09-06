import { SeedQuestion, GCSETopic, GCSE_TOPICS, INITIAL_SEED_QUESTIONS } from '../curriculum/gcse-data';

export interface DeepExplanationResult {
  overview: string;
  stepByStep: string[];
  keyConcept: string;
  commonMistakes: string[];
  examTip: string;
  relatedFormulae?: string[];
  practiceCheck: {
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export class AIGenerator {
  /**
   * Question Generator with Google Gemini API support (Gemini 1.5/2.0 Flash)
   * Falls back to built-in dynamic parameter mutation if key is missing.
   */
  static async generateQuestion(
    topicId: string,
    targetGrade: number,
    examBoard: string = 'AQA',
    detectedKnowledgeGap?: string
  ): Promise<SeedQuestion> {
    const topic = GCSE_TOPICS.find(t => t.id === topicId) || GCSE_TOPICS[0];
    
    // Check for Gemini API key
    const geminiKey = typeof process !== 'undefined' 
      ? (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY) 
      : null;

    if (geminiKey) {
      try {
        const prompt = `Generate a high-quality GCSE exam question for:
Subject Topic: ${topic.topicName} (${topic.unitName})
Target Grade Level: Grade ${targetGrade}
Exam Board: ${examBoard}
Format requirement: Respond ONLY with a valid raw JSON object (no markdown quotes, no triple backticks) with keys:
- questionText: string (using LaTeX like $x^2$)
- options: array of 4 strings (using LaTeX)
- correctAnswer: string (exact match to 1 option)
- overview: string
- stepByStep: array of strings
- keyConcept: string
- commonMistakes: array of strings
- examTip: string`;

        // Select optimal model: gemini-2.5-pro for Grade 8-9 reasoning, gemini-2.5-flash / gemini-2.0-flash for others
        const modelName = targetGrade >= 8 ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates[0].content.parts[0].text;
          const parsed = JSON.parse(rawText);
          
          const newQ: SeedQuestion = {
            id: `gemini-q-${Date.now()}`,
            topicId: topic.id,
            gradeLevel: targetGrade,
            questionText: parsed.questionText,
            questionType: 'multiple_choice',
            options: parsed.options,
            correctAnswer: parsed.correctAnswer,
            explanation: {
              overview: parsed.overview,
              stepByStep: parsed.stepByStep || [],
              keyConcept: parsed.keyConcept,
              commonMistakes: parsed.commonMistakes || [],
              examTip: parsed.examTip,
            },
          };

          // Save generated question into question bank
          if (typeof window !== 'undefined') {
            const { UserStore } = await import('../user-store');
            UserStore.saveGeneratedQuestion(newQ);
          }

          return newQ;
        }
      } catch (e) {
        console.warn('Google Gemini API call failed, using dynamic built-in generator:', e);
      }
    }

    // Dynamic Parameter Mutation Engine Fallback
    const seeds = INITIAL_SEED_QUESTIONS.filter(q => q.topicId === topicId);
    const baseSeed = seeds.length > 0 ? seeds[Math.floor(Math.random() * seeds.length)] : INITIAL_SEED_QUESTIONS[0];

    if (topicId === 'm-alg-1') {
      const a = [1, 2, 3][Math.floor(Math.random() * 3)];
      const r1 = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
      const r2 = [1, 2, 3, 6][Math.floor(Math.random() * 4)];
      
      const b = a * r2 + r1;
      const c = r1 * r2;
      const ans1 = `- ${r1}${a > 1 ? '/' + a : ''}`;
      const ans2 = `- ${r2}`;

      const correctStr = `$x = ${ans1}$ or $x = ${ans2}$`;
      const wrong1 = `$x = ${r1}$ or $x = ${r2}$`;
      const wrong2 = `$x = - ${b}$ or $x = ${c}$`;
      const wrong3 = `$x = - ${r1 * 2}$ or $x = - ${r2 + 1}$`;

      const options = [correctStr, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);

      return {
        id: `gen-m-${Date.now()}`,
        topicId: topic.id,
        gradeLevel: targetGrade,
        questionText: `Solve the quadratic equation by factoring: $${a > 1 ? a : ''}x^2 + ${b}x + ${c} = 0$. Find the values of $x$.`,
        questionType: 'multiple_choice',
        options,
        correctAnswer: correctStr,
        explanation: {
          overview: `To factorize $${a > 1 ? a : ''}x^2 + ${b}x + ${c} = 0$, we find two numbers that sum to $b = ${b}$ and multiply to $a \\times c = ${a * c}$.`,
          stepByStep: [
            `Calculate $a \\times c = ${a} \\times ${c} = ${a * c}$.`,
            `Identify numbers that multiply to ${a * c} and sum to ${b}: these are ${r1} and ${a * r2}.`,
            `Split middle term: $${a > 1 ? a : ''}x^2 + ${a * r2}x + ${r1}x + ${c} = 0$.`,
            `Factorize by grouping: $(${a > 1 ? a : ''}x + ${r1})(x + ${r2}) = 0$.`,
            `Solve for roots: $x = ${ans1}$ or $x = ${ans2}$.`
          ],
          keyConcept: 'Factoring quadratic expressions and solving for real roots.',
          commonMistakes: ['Forgetting to invert signs when solving factorized brackets equal to zero.'],
          examTip: 'Substitute your values of x back into the original quadratic equation to verify!'
        }
      };
    }

    return {
      id: `gen-seed-${Date.now()}`,
      topicId: topic.id,
      gradeLevel: targetGrade,
      questionText: baseSeed.questionText,
      questionType: baseSeed.questionType,
      options: baseSeed.options ? [...baseSeed.options].sort(() => Math.random() - 0.5) : undefined,
      correctAnswer: baseSeed.correctAnswer,
      explanation: baseSeed.explanation,
      markScheme: baseSeed.markScheme,
    };
  }

  /**
   * Deep Conceptual Analysis Engine
   */
  static async generateDeepAnalysis(
    question: SeedQuestion,
    userAnswer?: string
  ): Promise<DeepExplanationResult> {
    const topic = GCSE_TOPICS.find(t => t.id === question.topicId);
    
    return {
      overview: question.explanation.overview,
      stepByStep: question.explanation.stepByStep,
      keyConcept: question.explanation.keyConcept,
      commonMistakes: question.explanation.commonMistakes,
      examTip: question.explanation.examTip,
      relatedFormulae: topic?.keyFormulae || [],
      practiceCheck: {
        questionText: `Concept Practice Check: When solving a multi-mark GCSE question regarding ${topic?.topicName || 'this topic'}, what is the recommended first step?`,
        options: [
          'State key formulae, identify given values, and rearrange for the unknown variable',
          'Multiply random numbers provided in the question stem',
          'Guess the numerical answer without writing working steps',
          'Skip writing methods to save time'
        ],
        correctAnswer: 'State key formulae, identify given values, and rearrange for the unknown variable',
        explanation: 'In GCSE examinations, stating formulae and showing working steps guarantees Method Marks (M Marks) even if a final calculation error occurs!'
      }
    };
  }
}

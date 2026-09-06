import { SeedQuestion, GCSETopic, GCSE_TOPICS, INITIAL_SEED_QUESTIONS, shuffleQuestionOptions } from '../curriculum/gcse-data';

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
   * Question Generator with Google Gemini API support & Dynamic Procedural Parametric Generator.
   * Ensures option positions are randomized (A, B, C, D) and questions vary dynamically.
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
        const prompt = `Generate a unique, high-quality GCSE exam question for:
Subject Topic: ${topic.topicName} (${topic.unitName})
Target Grade Level: Grade ${targetGrade}
Exam Board: ${examBoard}
Format requirement: Respond ONLY with a valid raw JSON object (no markdown quotes, no triple backticks) with keys:
- questionText: string (using LaTeX like $x^2$)
- options: array of 4 distinct strings (using LaTeX)
- correctAnswer: string (exact match to 1 option)
- overview: string
- stepByStep: array of strings
- keyConcept: string
- commonMistakes: array of strings
- examTip: string`;

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
            id: `gemini-q-${Date.now()}-${Math.floor(Math.random()*1000)}`,
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

          if (typeof window !== 'undefined') {
            const { UserStore } = await import('../user-store');
            UserStore.saveGeneratedQuestion(newQ);
          }

          return shuffleQuestionOptions(newQ);
        }
      } catch (e) {
        console.warn('Google Gemini API call failed, using dynamic built-in generator:', e);
      }
    }

    // -------------------------------------------------------------
    // Procedural Dynamic Parameter Mutation Fallback Engine
    // Generates infinite unique question variations locally
    // -------------------------------------------------------------
    const timestamp = Date.now() + Math.floor(Math.random() * 10000);

    // 1. Quadratic Equations Mutator (m-alg-1)
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
      const wrong2 = `$x = -${b}$ or $x = ${c}$`;
      const wrong3 = `$x = -${r1 * 2}$ or $x = -${r2 + 1}$`;

      return shuffleQuestionOptions({
        id: `proc-m-quad-${timestamp}`,
        topicId: topic.id,
        gradeLevel: targetGrade,
        questionText: `Solve the quadratic equation by factoring: $${a > 1 ? a : ''}x^2 + ${b}x + ${c} = 0$. Find the values of $x$.`,
        questionType: 'multiple_choice',
        options: [correctStr, wrong1, wrong2, wrong3],
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
      });
    }

    // 2. Index Laws Mutator (m-alg-2)
    if (topicId === 'm-alg-2') {
      const c1 = [2, 3, 4, 5, 6][Math.floor(Math.random() * 5)];
      const c2 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      const p1 = [2, 3, 4, 5, 6][Math.floor(Math.random() * 5)];
      const p2 = [3, 4, 5, 7, 8][Math.floor(Math.random() * 5)];

      const prodCoeff = c1 * c2;
      const sumPower = p1 + p2;
      const prodPower = p1 * p2;

      const correctStr = `$${prodCoeff}x^{${sumPower}}$`;
      const wrong1 = `$${prodCoeff}x^{${prodPower}}$`;
      const wrong2 = `$${c1 + c2}x^{${sumPower}}$`;
      const wrong3 = `$${c1 + c2}x^{${prodPower}}$`;

      return shuffleQuestionOptions({
        id: `proc-m-ind-${timestamp}`,
        topicId: topic.id,
        gradeLevel: targetGrade,
        questionText: `Simplify the algebraic expression: $${c1}x^{${p1}} \\times ${c2}x^{${p2}}$.`,
        questionType: 'multiple_choice',
        options: [correctStr, wrong1, wrong2, wrong3],
        correctAnswer: correctStr,
        explanation: {
          overview: `Multiply the numerical coefficients ($${c1} \\times ${c2} = ${prodCoeff}$) and add the powers ($${p1} + ${p2} = ${sumPower}$).`,
          stepByStep: [
            `Coefficients: $${c1} \\times ${c2} = ${prodCoeff}$.`,
            `First Law of Indices ($a^m \\times a^n = a^{m+n}$): $x^{${p1}} \\times x^{${p2}} = x^{${p1}+${p2}} = x^{${sumPower}}$.`,
            `Result: $${prodCoeff}x^{${sumPower}}$.`
          ],
          keyConcept: 'First Index Law: add powers when multiplying terms with the same base.',
          commonMistakes: ['Multiplying powers instead of adding them.'],
          examTip: 'Remember: multiply coefficients, add powers!'
        }
      });
    }

    // 3. Ohm's Law Electricity Mutator (p-eng-2)
    if (topicId === 'p-eng-2') {
      const v = [6, 12, 24, 230][Math.floor(Math.random() * 4)];
      const i = [0.2, 0.5, 2, 4, 5][Math.floor(Math.random() * 5)];
      const r = v / i;

      const correctStr = `$${r}\\text{ }\\Omega$`;
      const wrong1 = `$${(v * i).toFixed(1)}\\text{ }\\Omega$`;
      const wrong2 = `$${(i / v).toFixed(3)}\\text{ }\\Omega$`;
      const wrong3 = `$${(r + 4).toFixed(1)}\\text{ }\\Omega$`;

      return shuffleQuestionOptions({
        id: `proc-p-ohm-${timestamp}`,
        topicId: topic.id,
        gradeLevel: targetGrade,
        questionText: `A resistor connected in a circuit has a potential difference of $${v}\\text{ V}$ across it and a current of $${i}\\text{ A}$ flowing through it. Calculate the resistance $R$.`,
        questionType: 'multiple_choice',
        options: [correctStr, wrong1, wrong2, wrong3],
        correctAnswer: correctStr,
        explanation: {
          overview: `State Ohm’s Law equation $V = I \\times R$ and rearrange for $R = V / I$.`,
          stepByStep: [
            `Given: $V = ${v}\\text{ V}$, $I = ${i}\\text{ A}$.`,
            `Formula: $R = V / I$.`,
            `Substitute: $R = ${v} / ${i} = ${r}\\text{ }\\Omega$.`
          ],
          keyConcept: 'Resistance is potential difference divided by current ($R = V / I$).',
          commonMistakes: ['Multiplying V by I instead of dividing.'],
          examTip: 'Check resistance units are Ohms (\\Omega).'
        }
      });
    }

    // 4. Microscopy & Magnification Mutator (bio-cell-1)
    if (topicId === 'bio-cell-1') {
      const actualMm = [0.02, 0.04, 0.05, 0.08][Math.floor(Math.random() * 4)];
      const mag = [100, 400, 600, 1000][Math.floor(Math.random() * 4)];
      const imageMm = actualMm * mag;

      const correctStr = `$\\times ${mag}$`;
      const wrong1 = `$\\times ${mag / 2}$`;
      const wrong2 = `$\\times ${mag * 2}$`;
      const wrong3 = `$\\times ${Math.round(imageMm * 10)}$`;

      return shuffleQuestionOptions({
        id: `proc-b-mag-${timestamp}`,
        topicId: topic.id,
        gradeLevel: targetGrade,
        questionText: `A light microscope image of a plant cell measures $${imageMm}\\text{ mm}$ in width. If the actual width of the cell is $${actualMm}\\text{ mm}$, calculate the magnification.`,
        questionType: 'multiple_choice',
        options: [correctStr, wrong1, wrong2, wrong3],
        correctAnswer: correctStr,
        explanation: {
          overview: `Use the formula $\\text{Magnification} = \\frac{\\text{Image Size}}{\\text{Actual Size}}$.`,
          stepByStep: [
            `Image size = $${imageMm}\\text{ mm}$.`,
            `Actual size = $${actualMm}\\text{ mm}$.`,
            `Magnification = $${imageMm} / ${actualMm} = ${mag}$.`
          ],
          keyConcept: 'Formula triangle I = A x M.',
          commonMistakes: ['Dividing actual size by image size.'],
          examTip: 'Ensure both sizes are in the same unit before calculating!'
        }
      });
    }

    // 5. Binary Conversion Mutator (cs-sys-2)
    if (topicId === 'cs-sys-2') {
      const val = Math.floor(Math.random() * 200) + 20;
      const binStr = val.toString(2).padStart(8, '0');

      const correctStr = `$${val}$`;
      const wrong1 = `$${val + 8}$`;
      const wrong2 = `$${val - 4}$`;
      const wrong3 = `$${val + 16}$`;

      return shuffleQuestionOptions({
        id: `proc-cs-bin-${timestamp}`,
        topicId: topic.id,
        gradeLevel: targetGrade,
        questionText: `Convert the 8-bit unsigned binary number $${binStr}_2$ into denary (decimal).`,
        questionType: 'multiple_choice',
        options: [correctStr, wrong1, wrong2, wrong3],
        correctAnswer: correctStr,
        explanation: {
          overview: `Sum place values ($128, 64, 32, 16, 8, 4, 2, 1$) corresponding to binary 1 bits.`,
          stepByStep: [
            `Binary: $${binStr}_2$.`,
            `Sum active bit place values to get $${val}$.`
          ],
          keyConcept: 'Binary place values double from right to left starting at 1.',
          commonMistakes: ['Miscalculating bit place values.'],
          examTip: 'Write powers of 2 (128, 64, 32, 16, 8, 4, 2, 1) above each bit.'
        }
      });
    }

    // 6. Generic Seed Pool with Dynamic Option Shuffling
    const topicSeeds = INITIAL_SEED_QUESTIONS.filter(q => q.topicId === topicId);
    const pool = topicSeeds.length > 0 ? topicSeeds : INITIAL_SEED_QUESTIONS;
    const base = pool[Math.floor(Math.random() * pool.length)];

    const mutatedQuestion: SeedQuestion = {
      ...base,
      id: `gen-var-${topic.id}-${timestamp}`,
      topicId: topic.id,
      gradeLevel: targetGrade,
    };

    return shuffleQuestionOptions(mutatedQuestion);
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
        options: shuffleQuestionOptions({
          id: 'check-opt',
          topicId: 'check',
          gradeLevel: 5,
          questionText: '',
          questionType: 'multiple_choice',
          options: [
            'State key formulae, identify given values, and rearrange for the unknown variable',
            'Multiply random numbers provided in the question stem',
            'Guess the numerical answer without writing working steps',
            'Skip writing methods to save time'
          ],
          correctAnswer: 'State key formulae, identify given values, and rearrange for the unknown variable',
          explanation: { overview: '', stepByStep: [], keyConcept: '', commonMistakes: [], examTip: '' }
        }).options || [],
        correctAnswer: 'State key formulae, identify given values, and rearrange for the unknown variable',
        explanation: 'In GCSE examinations, stating formulae and showing working steps guarantees Method Marks (M Marks) even if a final calculation error occurs!'
      }
    };
  }
}

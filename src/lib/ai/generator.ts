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

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
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
          
          return {
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
          overview: `$${a > 1 ? a : ''}x^2 + ${b}x + ${c} = 0$ denklemini çarpanlarına ayırmak için toplamı $b = ${b}$ ve çarpımı $a \\times c = ${a * c}$ olan iki sayı buluyoruz.`,
          stepByStep: [
            `$a \\times c = ${a} \\times ${c} = ${a * c}$ değerini hesaplayın.`,
            `Çarpımları ${a * c} ve toplamları ${b} olan sayılar: ${r1} ve ${a * r2}.`,
            `Orta terimi açın: $${a > 1 ? a : ''}x^2 + ${a * r2}x + ${r1}x + ${c} = 0$.`,
            `Ortak çarpan parantezine alın: $(${a > 1 ? a : ''}x + ${r1})(x + ${r2}) = 0$.`,
            `Kökler: $x = ${ans1}$ veya $x = ${ans2}$.`
          ],
          keyConcept: 'İkinci dereceden denklemlerde çarpanlara ayırma yöntemi ve kök bulma kuralı.',
          commonMistakes: ['Kökleri bulurken işaretleri tersine çevirmeyi unutmak.'],
          examTip: 'Bulduğunuz x değerlerini orijinal denklemde yerine koyarak sağlama yapın!'
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
   * "Daha Fazla Bilgi" (More Info & Deep Conceptual Analysis Engine)
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
        questionText: `Pekiştirme Sorusu: ${topic?.topicName || 'Bu konu'} ile ilgili benzer bir mantık sorulduğunda ilk yapılması gereken nedir?`,
        options: [
          'Sorudaki verilen ve istenen büyüklükleri listelemek ve formülü düzenlemek',
          'Rastgele sayılan değerleri çarpmak',
          'Formül kullanmadan doğrudan tahmin yürütmek',
          'Doğrudan cevabı boş bırakmak'
        ],
        correctAnswer: 'Sorudaki verilen ve istenen büyüklükleri listelemek ve formülü düzenlemek',
        explanation: 'GCSE sınavlarında adımları ve formülü doğru yazmak, nihai cevap yanlış olsa bile işlem puanı (Method Marks) kazanmanızı sağlar!'
      }
    };
  }
}

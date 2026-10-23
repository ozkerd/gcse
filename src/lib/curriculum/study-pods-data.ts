import { GCSE_TOPICS, GCSE_SUBJECTS, INITIAL_SEED_QUESTIONS, GCSETopic } from './gcse-data';

export type FlashcardCategory =
  | 'Formula & Rule'
  | 'Core Concept'
  | 'Exam Hack'
  | 'Common Trap'
  | 'Worked Micro-Problem';

export interface TopicFlashcard {
  id: string;
  topicId: string;
  category: FlashcardCategory;
  front: string;
  back: string;
  formulaHighlight?: string;
  examTip?: string;
  gradeLevel: number;
}

export interface PodDialogueLine {
  speaker: 'Alex (Coach)' | 'Maya (Student)';
  text: string;
}

export interface PodVisualSlide {
  id: string;
  slideNumber: number;
  badge: string;
  title: string;
  visualType: 'formula_spotlight' | 'three_pillars' | 'worked_hack' | 'trap_vs_top';
  headlineFormula: string;
  keyTakeaways: string[];
  comparison?: {
    commonTrap: string;
    grade9Fix: string;
  };
  dialogue: PodDialogueLine[];
}

export interface TopicStudyPod {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  durationEstimate: string;
  crucialSummary: string;
  goldenFormulae: string[];
  threeThingsToKnow: string[];
  slides: PodVisualSlide[];
}

// Subject-level curated Golden Formulae & Exam Hacks fallback when a topic doesn't list explicit keyFormulae
const SUBJECT_CRUCIAL_HACKS: Record<
  string,
  {
    defaultFormulae: string[];
    solverRule: string;
    threePillars: [string, string, string];
  }
> = {
  maths: {
    defaultFormulae: [
      'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      'a^2 + b^2 = c^2 \\quad | \\quad \\text{SOH CAH TOA}',
      '\\text{Percentage Change} = \\frac{\\text{Difference}}{\\text{Original}} \\times 100',
    ],
    solverRule:
      'In GCSE Maths, 90% of multi-mark problems unlock the moment you write down the governing equation, substitute the known values in brackets, and isolate the single unknown.',
    threePillars: [
      'Identify the exact mathematical model (Formula / Identity) triggered by command words.',
      'Substitute known quantities using brackets to protect negative signs and powers.',
      'State unrounded working first, then round to the required significant figures with units.',
    ],
  },
  physics: {
    defaultFormulae: [
      'E_k = \\frac{1}{2}mv^2 \\quad | \\quad \\Delta E_p = mg\\Delta h',
      'V = I \\times R \\quad | \\quad P = V \\times I = I^2R',
      'F = m \\times a \\quad | \\quad v = f \\times \\lambda',
    ],
    solverRule:
      'Every GCSE Physics calculation is a 3-variable or 4-variable puzzle: convert to SI units first (kJ → J, g → kg, cm → m), write the raw formula, substitute, and rearrange.',
    threePillars: [
      'Convert all values to standard SI units (kg, m, s, A, V, J) BEFORE touching your calculator.',
      'Write the equation and substitute numbers directly underneath to secure the method mark.',
      'Check the final unit and order of magnitude (e.g. a car cannot move at 50,000 m/s).',
    ],
  },
  chemistry: {
    defaultFormulae: [
      '\\text{Moles } (n) = \\frac{\\text{Mass } (m)}{M_r}',
      '\\text{Concentration} = \\frac{\\text{Moles}}{\\text{Volume in dm}^3} \\quad (\\text{cm}^3 \\div 1000 = \\text{dm}^3)',
      'q = m \\times c \\times \\Delta T \\quad | \\quad \\%\\text{ Yield} = \\frac{\\text{Actual}}{\\text{Theoretical}} \\times 100',
    ],
    solverRule:
      'In GCSE Chemistry, almost every quantitative or bonding question boils down to Moles = Mass / Mr, electron shell stability, or energy transfer during bond breaking vs bond making.',
    threePillars: [
      'Always divide volume in cm³ by 1000 to convert into dm³ before calculating moles or concentration.',
      'Use the balanced symbol equation mole ratio as your bridge between reactant and product.',
      'Link structure & bonding (ionic lattice, giant covalent, simple molecular) directly to melting point or conductivity.',
    ],
  },
  biology: {
    defaultFormulae: [
      '\\text{Magnification } (M) = \\frac{\\text{Image Size } (I)}{\\text{Actual Size } (A)} \\quad (\\text{mm} \\times 1000 = \\mu\\text{m})',
      '\\text{Rate} = \\frac{\\text{Change in Quantity}}{\\text{Time}} \\quad | \\quad \\text{BMI} = \\frac{\\text{Mass (kg)}}{\\text{Height (m)}^2}',
      '6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{light}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2',
    ],
    solverRule:
      'GCSE Biology mark schemes reward exact specification terminology: link structure → function → adaptation, and always convert mm to micrometres (×1000) in microscopy calculations.',
    threePillars: [
      'Use exact biological keywords (e.g. "active transport against a concentration gradient using ATP from respiration").',
      'In microscopy & rate questions, make sure Image and Actual sizes share the same unit (μm).',
      'For practical evaluations, always name the Independent, Dependent, and two specific Control variables.',
    ],
  },
  'english-lang': {
    defaultFormulae: [
      '\\text{PEEZL: Point} \\rightarrow \\text{Evidence} \\rightarrow \\text{Explain} \\rightarrow \\text{Zoom Word} \\rightarrow \\text{Link to Reader}',
      '\\text{Structure Shift: Opening Focus} \\rightarrow \\text{Pivotal Shift} \\rightarrow \\text{Cyclical/Cliffhanger Ending}',
      '\\text{Persuasive Rhetoric: DAFOREST + Counter-Argument + Cyclical Hook}',
    ],
    solverRule:
      'Top-band English Language responses never just spot techniques—they zoom into a single word class (verb/metaphor/plosive) and explain the exact psychological shift in the reader.',
    threePillars: [
      'Embed micro-quotations (2–4 words) inside your sentence rather than copying long blocks.',
      'Zoom in on a specific word choice and unpack two layers of connotation.',
      'Track structural shifts by asking: "What does the writer force us to look at first, next, and last—and why?"',
    ],
  },
  'english-lit': {
    defaultFormulae: [
      '\\text{Conceptual Thesis} + \\text{Embedded Quote} + \\text{Method Analysis} + \\text{Jacobean/Victorian Context (AO3)}',
      '\\text{Writer\'s Intent: "[Author] uses [Character/Symbol] as a microcosm to critique..."}',
      '\\text{Whole-Text Arc: Act 1 Establish} \\rightarrow \\text{Act 3 Turning Point} \\rightarrow \\text{Final Resolution}',
    ],
    solverRule:
      'Treat every character as a deliberate construct by the writer (Shakespeare, Dickens, Priestley) designed to challenge the audience’s morality or social hierarchy.',
    threePillars: [
      'Start every paragraph with a conceptual thesis linked to the writer’s big message ("Shakespeare weaponises...").',
      'Pair one quote from the extract with one memorised quote from elsewhere in the text.',
      'Weave AO3 context naturally into your analysis of the writer’s purpose—never bolt it on at the end.',
    ],
  },
  cs: {
    defaultFormulae: [
      '\\text{File Size (bits)} = \\text{Sample Rate (Hz)} \\times \\text{Bit Depth} \\times \\text{Duration (s)}',
      '\\text{Image Size (bits)} = \\text{Width} \\times \\text{Height} \\times \\text{Colour Depth}',
      '\\text{Hexadecimal} \\leftrightarrow \\text{4-bit Binary Nibble} \\quad (8, 4, 2, 1)',
    ],
    solverRule:
      'In GCSE Computer Science, binary/data calculations and algorithm trace tables follow strict deterministic rules: show every nibble conversion and track variables row-by-row.',
    threePillars: [
      'Convert between Bytes, KB, MB, and bits carefully (divide by 8 for bits → bytes).',
      'When tracing algorithms, update one variable column at a time and check boundary conditions (< vs <=).',
      'State both the technical mechanism AND the security/performance impact in systems questions.',
    ],
  },
  business: {
    defaultFormulae: [
      '\\text{Total Revenue (TR)} = \\text{Price} \\times \\text{Quantity} \\quad | \\quad \\text{Profit} = \\text{TR} - \\text{Total Costs}',
      '\\text{Break-Even Output} = \\frac{\\text{Fixed Costs}}{\\text{Selling Price} - \\text{Variable Cost per Unit}}',
      '\\text{ARR (\\%)} = \\frac{\\text{Average Annual Profit}}{\\text{Initial Outlay}} \\times 100',
    ],
    solverRule:
      'High-mark GCSE Business answers combine exact financial formula accuracy with contextualised "It depends on..." evaluation chains (AJIM).',
    threePillars: [
      'Memorise Break-Even, Gross/Net Profit Margin, Cash Flow, and ARR equations cold.',
      'Apply every point to the specific business case study (e.g. a small bakery vs a PLC).',
      'Finish 9/12-mark essays with a weighed judgement: what is the most decisive factor in the short vs long run?',
    ],
  },
  economics: {
    defaultFormulae: [
      '\\text{PED} = \\frac{\\% \\Delta \\text{Quantity Demanded}}{\\% \\Delta \\text{Price}} \\quad (|\\text{PED}| > 1 = \\text{Elastic})',
      '\\text{PES} = \\frac{\\% \\Delta \\text{Quantity Supplied}}{\\% \\Delta \\text{Price}}',
      '\\text{Real GDP Growth} = \\text{Nominal Growth} - \\text{Inflation Rate}',
    ],
    solverRule:
      'GCSE Economics rewards clear chain-of-reasoning diagrams (Demand/Supply shifts) paired with Elasticity (PED/PES) to explain who bears the burden of a tax or price change.',
    threePillars: [
      'Always calculate percentage change as (New - Original) / Original × 100.',
      'Use elasticity (PED/PES) to evaluate whether a price change will raise or lower total revenue.',
      'Balance macroeconomic policies by discussing trade-offs (e.g. lower unemployment vs demand-pull inflation).',
    ],
  },
  history: {
    defaultFormulae: [
      '\\text{Source Utility (NOP)} = \\text{Nature/Origin/Purpose} + \\text{Content Quote} + \\text{Own Historical Knowledge}',
      '\\text{Causation Essay} = \\text{Trigger Factor} \\times \\text{Underlying Catalyst} \\rightarrow \\text{Sustained Judgement}',
      '\\text{Consequence Chain} = \\text{Immediate Impact} \\rightarrow \\text{Turning Point} \\rightarrow \\text{Long-Term Legacy}',
    ],
    solverRule:
      'In GCSE History, a source is NEVER completely useless: evaluate what its bias or purpose reveals about contemporary attitudes, then verify it with precise factual dates/laws.',
    threePillars: [
      'Anchor every paragraph with 2–3 specific factual details (dates, acts, statistics, key figures).',
      'Evaluate provenance (Who, When, Why) to explain why a source is useful for a specific enquiry.',
      'In 16-mark essays, compare how factors interacted rather than listing them in isolation.',
    ],
  },
  geography: {
    defaultFormulae: [
      '\\text{CASE Protocol} = \\text{Named Case Study} + \\text{2 Specific Figures} + \\text{Social/Economic/Environmental Impact}',
      '\\text{Natural Increase (\\%)} = \\frac{\\text{Birth Rate} - \\text{Death Rate}}{10}',
      '\\text{Discharge } (Q) = \\text{Cross-Sectional Area } (A) \\times \\text{Velocity } (V)',
    ],
    solverRule:
      'GCSE Geography 6- and 9-mark questions require named LIC/NEE and HIC case studies backed by real figures and clear physical or socio-economic cause-and-effect chains.',
    threePillars: [
      'Quote specific statistics and place names from your case studies to unlock Level 3 marks.',
      'Distinguish clearly between Primary effects (immediate) and Secondary effects (knock-on).',
      'Evaluate sustainability by weighing economic cost against long-term environmental protection.',
    ],
  },
};

export function getTopicFlashcards(topicId: string): TopicFlashcard[] {
  const topic = GCSE_TOPICS.find((t) => t.id === topicId) || GCSE_TOPICS[0];
  const subjectHack =
    SUBJECT_CRUCIAL_HACKS[topic.subjectId] || SUBJECT_CRUCIAL_HACKS.maths;
  const seedQuestions = INITIAL_SEED_QUESTIONS.filter((q) => q.topicId === topic.id);

  const cards: TopicFlashcard[] = [];

  // 1. Core Topic Overview & What You Need to Know
  cards.push({
    id: `${topic.id}-fc-core`,
    topicId: topic.id,
    category: 'Core Concept',
    front: `What is the core focus of "${topic.topicName}" (${topic.unitName}) and what do examiners test most?`,
    back: `${topic.description}. Examiners test your ability to apply the core rules to unfamiliar scenarios and state working clearly for Grades ${topic.minGrade}–${topic.maxGrade}.`,
    formulaHighlight: (topic.keyFormulae && topic.keyFormulae[0]) || subjectHack.defaultFormulae[0],
    examTip: subjectHack.solverRule,
    gradeLevel: topic.minGrade,
  });

  // 2. Formulae cards (from topic.keyFormulae or subject default formulae)
  const formulaeList =
    topic.keyFormulae && topic.keyFormulae.length > 0
      ? topic.keyFormulae
      : subjectHack.defaultFormulae;

  formulaeList.forEach((formula, idx) => {
    cards.push({
      id: `${topic.id}-fc-formula-${idx + 1}`,
      topicId: topic.id,
      category: 'Formula & Rule',
      front:
        idx === 0
          ? `Golden Formula #1 for ${topic.topicName}: What is the key formula/structure you must know by heart?`
          : `Essential Rule #${idx + 1} for ${topic.topicName}: How do you connect the key variables in this topic?`,
      back: `Memorise and write this down before substituting numbers: ${formula}. Knowing any two parts lets you rearrange and solve the missing value in seconds!`,
      formulaHighlight: formula,
      examTip: subjectHack.threePillars[idx % 3],
      gradeLevel: Math.min(9, topic.minGrade + idx + 1),
    });
  });

  // 3. The "3-Piece Exam Hack" Card
  cards.push({
    id: `${topic.id}-fc-hack-pillars`,
    topicId: topic.id,
    category: 'Exam Hack',
    front: `What are the 3 golden steps to solve 90% of GCSE exam questions on ${topic.topicName}?`,
    back: `1️⃣ ${subjectHack.threePillars[0]}\n2️⃣ ${subjectHack.threePillars[1]}\n3️⃣ ${subjectHack.threePillars[2]}`,
    formulaHighlight: formulaeList[0],
    examTip: 'Follow this 3-step checklist on every 3–5 mark question to guarantee method marks even under time pressure.',
    gradeLevel: Math.min(9, topic.minGrade + 2),
  });

  // 4. Extract high-yield flashcards from distinct subtopics in seedQuestions
  const seenSubtopics = new Set<string>();
  for (const q of seedQuestions) {
    const subKey = q.subtopicId || q.id;
    if (seenSubtopics.has(subKey)) continue;
    seenSubtopics.add(subKey);

    // Add a Key Concept / Common Trap card or Worked Micro-Problem card
    if (cards.length < 9 && q.explanation?.keyConcept) {
      cards.push({
        id: `${topic.id}-fc-concept-${cards.length}`,
        topicId: topic.id,
        category: cards.length % 2 === 0 ? 'Common Trap' : 'Core Concept',
        front: q.subtopicName
          ? `${q.subtopicName}: What is the key rule & common examiner trap to watch out for?`
          : `Key Rule in ${topic.topicName}: How do you avoid losing marks on Grade ${q.gradeLevel} questions?`,
        back: `✅ Rule: ${q.explanation.keyConcept}\n⚠️ Trap to Avoid: ${
          q.explanation.commonMistakes?.[0] ||
          'Skipping intermediate working steps or forgetting standard units.'
        }`,
        examTip: q.explanation.examTip,
        gradeLevel: q.gradeLevel,
      });
    }

    if (cards.length < 12) {
      const stepsText =
        q.explanation?.stepByStep && q.explanation.stepByStep.length > 0
          ? q.explanation.stepByStep.slice(0, 3).join(' → ')
          : q.explanation?.overview || '';
      cards.push({
        id: `${topic.id}-fc-micro-${cards.length}`,
        topicId: topic.id,
        category: 'Worked Micro-Problem',
        front: `Quick Practice (${q.subtopicName || topic.topicName}):\n${q.questionText}`,
        back: `🎯 Correct Answer: ${q.correctAnswer}\n\n💡 Fast Method: ${stepsText}`,
        examTip: q.explanation?.examTip,
        gradeLevel: q.gradeLevel,
      });
    }

    if (cards.length >= 12) break;
  }

  return cards;
}

export function getTopicStudyPod(topicId: string): TopicStudyPod {
  const topic = GCSE_TOPICS.find((t) => t.id === topicId) || GCSE_TOPICS[0];
  const subject =
    GCSE_SUBJECTS.find((s) => s.id === topic.subjectId) || GCSE_SUBJECTS[0];
  const subjectHack =
    SUBJECT_CRUCIAL_HACKS[topic.subjectId] || SUBJECT_CRUCIAL_HACKS.maths;
  const seedQuestions = INITIAL_SEED_QUESTIONS.filter((q) => q.topicId === topic.id);

  // Pick a representative worked question (preferably Grade 6-8)
  const sampleQ =
    seedQuestions.find((q) => q.gradeLevel >= 6 && q.gradeLevel <= 8) ||
    seedQuestions[0];

  const goldenFormulae =
    topic.keyFormulae && topic.keyFormulae.length > 0
      ? topic.keyFormulae
      : subjectHack.defaultFormulae;

  const topConcept =
    sampleQ?.explanation?.keyConcept ||
    `${topic.topicName} connects core ${subject.name} principles to real GCSE exam scenarios.`;
  const topTrap =
    sampleQ?.explanation?.commonMistakes?.[0] ||
    'Rushing into the final answer without writing the governing formula or unit conversion first.';
  const topExamTip =
    sampleQ?.explanation?.examTip ||
    'Always show your substitution step clearly—it secures method marks even if your arithmetic slips.';

  const slides: PodVisualSlide[] = [
    {
      id: `${topic.id}-slide-1`,
      slideNumber: 1,
      badge: '1. THE CRUCIAL CORE & EXAM SECRET',
      title: `${topic.topicName}: Why It’s Easy Marks Once It Clicks`,
      visualType: 'formula_spotlight',
      headlineFormula: goldenFormulae[0],
      keyTakeaways: [
        `Core Scope: ${topic.description}`,
        `Target Band: Tested heavily across Grades ${topic.minGrade} to ${topic.maxGrade} (${topic.tier} Tier).`,
        `The Secret: ${subjectHack.solverRule}`,
      ],
      dialogue: [
        {
          speaker: 'Alex (Coach)',
          text: `Welcome back! Today we are breaking down ${topic.topicName} in ${subject.name}. Honestly, students overcomplicate this topic all the time, but once you know the core trick, it is guaranteed marks.`,
        },
        {
          speaker: 'Maya (Student)',
          text: `Okay, tell me the shortcut! When I open an exam paper and see a question on ${topic.topicName}, what is the very first thing that should pop into my head?`,
        },
        {
          speaker: 'Alex (Coach)',
          text: `Focus straight on the core relationship: ${topConcept} Every tough-looking scenario is just a disguise. Look for the values they give you, match them to our golden rule, and the problem practically solves itself.`,
        },
      ],
    },
    {
      id: `${topic.id}-slide-2`,
      slideNumber: 2,
      badge: '2. THE 3-PIECE SOLVER KIT',
      title: 'Know These 3 Rules, Solve 90% of Questions',
      visualType: 'three_pillars',
      headlineFormula: goldenFormulae.slice(0, 2).join('   |   '),
      keyTakeaways: [
        `Rule 1: ${subjectHack.threePillars[0]}`,
        `Rule 2: ${subjectHack.threePillars[1]}`,
        `Rule 3: ${subjectHack.threePillars[2]}`,
      ],
      dialogue: [
        {
          speaker: 'Maya (Student)',
          text: `So I don't need to memorise twenty different variations? Just these three building blocks?`,
        },
        {
          speaker: 'Alex (Coach)',
          text: `Exactly! Think of it like a three-piece puzzle. First: ${subjectHack.threePillars[0]} Second: ${subjectHack.threePillars[1]} And third: ${subjectHack.threePillars[2]}`,
        },
        {
          speaker: 'Maya (Student)',
          text: `That makes it way less overwhelming. If they give me two pieces of information in the question stem, I just plug them in to find the third!`,
        },
      ],
    },
    {
      id: `${topic.id}-slide-3`,
      slideNumber: 3,
      badge: '3. LIVE 60-SECOND EXAM HACK',
      title: `Worked Exam Scenario: ${sampleQ?.subtopicName || topic.topicName}`,
      visualType: 'worked_hack',
      headlineFormula: sampleQ
        ? `Target Answer: ${sampleQ.correctAnswer}`
        : goldenFormulae[0],
      keyTakeaways: sampleQ?.explanation?.stepByStep?.slice(0, 3) || [
        'Step 1: Highlight the given quantities and units in the question stem.',
        'Step 2: Write down the governing formula/rule to bank your first method mark.',
        'Step 3: Substitute and simplify cleanly to reach the final answer.',
      ],
      dialogue: [
        {
          speaker: 'Alex (Coach)',
          text: `Let's test this on a real GCSE-style question right now: "${
            sampleQ?.questionText || `Calculate or explain the outcome for ${topic.topicName}.`
          }"`,
        },
        {
          speaker: 'Maya (Student)',
          text: `Hold on—let me apply our 3-step hack. First, I spot what the question gives us and write down the method.`,
        },
        {
          speaker: 'Alex (Coach)',
          text: `Spot on! Follow the steps on screen: ${
            sampleQ?.explanation?.stepByStep?.slice(0, 2).join(' Then, ') ||
            sampleQ?.explanation?.overview ||
            'Substitute the knowns and solve step by step.'
          } That lands us directly on ${sampleQ?.correctAnswer || 'full marks'}!`,
        },
      ],
    },
    {
      id: `${topic.id}-slide-4`,
      slideNumber: 4,
      badge: '4. EXAMINER TRAP VS GRADE 9 BOOSTER',
      title: 'How to Never Drop Silly Marks Again',
      visualType: 'trap_vs_top',
      headlineFormula: `Examiner Tip: ${topExamTip}`,
      keyTakeaways: [
        `The #1 Trap: ${topTrap}`,
        `Grade 9 Habit: ${topExamTip}`,
        `Key Vocabulary: ${(topic.keywords || [topic.topicName, topic.unitName]).join(', ')}`,
      ],
      comparison: {
        commonTrap: topTrap,
        grade9Fix: topExamTip,
      },
      dialogue: [
        {
          speaker: 'Maya (Student)',
          text: `Before we jump into the flashcards and custom questions, what is the biggest trap students fall into on exam day for ${topic.topicName}?`,
        },
        {
          speaker: 'Alex (Coach)',
          text: `Examiners report the same mistake every year: ${topTrap} Don't let that be you!`,
        },
        {
          speaker: 'Maya (Student)',
          text: `Got it! Instead, I'll remember our Grade 9 booster: ${topExamTip} Let's test my level with the flashcards and adaptive questions now!`,
        },
      ],
    },
  ];

  return {
    topicId: topic.id,
    topicName: topic.topicName,
    subjectId: topic.subjectId,
    subjectName: subject.name,
    durationEstimate: '2 min Audio & Visual Pod',
    crucialSummary: subjectHack.solverRule,
    goldenFormulae,
    threeThingsToKnow: subjectHack.threePillars,
    slides,
  };
}

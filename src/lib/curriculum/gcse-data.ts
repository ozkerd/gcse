export type ExamBoard = 'AQA' | 'Edexcel' | 'OCR' | 'Eduqas' | 'CIE (Cambridge)';

export interface GCSESubject {
  id: string;
  name: string;
  code: string;
  supportedBoards: ExamBoard[];
  icon: string;
  description: string;
  color: string;
}

export interface GCSETopic {
  id: string;
  subjectId: string;
  unitName: string;
  topicName: string;
  tier: 'Foundation' | 'Higher' | 'Both';
  minGrade: number;
  maxGrade: number;
  description: string;
  keyFormulae?: string[];
  examBoards?: ExamBoard[];
}

export interface SeedQuestion {
  id: string;
  topicId: string;
  gradeLevel: number;
  questionText: string;
  questionType: 'multiple_choice' | 'numerical' | 'text';
  options?: string[];
  correctAnswer: string;
  explanation: {
    overview: string;
    stepByStep: string[];
    keyConcept: string;
    commonMistakes: string[];
    examTip: string;
  };
  markScheme?: string;
}

export const EXAM_BOARDS: ExamBoard[] = ['AQA', 'Edexcel', 'OCR', 'Eduqas', 'CIE (Cambridge)'];

export const GCSE_SUBJECTS: GCSESubject[] = [
  {
    id: 'maths',
    name: 'GCSE Mathematics',
    code: '8300 / 1MA1',
    supportedBoards: ['AQA', 'Edexcel', 'OCR', 'Eduqas', 'CIE (Cambridge)'],
    icon: 'Calculator',
    description: 'Algebra, Geometry, Ratio & Proportion, Probability, Vectors & Calculus preview',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'physics',
    name: 'GCSE Physics',
    code: '8463 / 1PH0',
    supportedBoards: ['AQA', 'Edexcel', 'OCR', 'CIE (Cambridge)'],
    icon: 'Zap',
    description: 'Energy, Electricity, Particle Model, Atomic Structure, Forces, Waves, Magnetism, Space',
    color: 'from-purple-600 to-violet-600',
  },
  {
    id: 'chemistry',
    name: 'GCSE Chemistry',
    code: '8462 / 1CH0',
    supportedBoards: ['AQA', 'Edexcel', 'OCR', 'CIE (Cambridge)'],
    icon: 'FlaskConical',
    description: 'Atomic structure, Bonding, Quantitative chemistry, Chemical changes, Organic chemistry',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'biology',
    name: 'GCSE Biology',
    code: '8461 / 1BI0',
    supportedBoards: ['AQA', 'Edexcel', 'OCR', 'CIE (Cambridge)'],
    icon: 'Dna',
    description: 'Cell biology, Organisation, Infection & response, Bioenergetics, Homeostasis, Genetics',
    color: 'from-green-600 to-emerald-600',
  },
  {
    id: 'cs',
    name: 'GCSE Computer Science',
    code: 'J277 / 8525',
    supportedBoards: ['OCR', 'AQA', 'Edexcel', 'CIE (Cambridge)'],
    icon: 'Cpu',
    description: 'Systems Architecture, Data Representation, Networking, Cybersecurity, Python & Pseudocode',
    color: 'from-amber-600 to-orange-600',
  },
  {
    id: 'english-lit',
    name: 'GCSE English Literature',
    code: '8702',
    supportedBoards: ['AQA', 'Edexcel', 'Eduqas', 'OCR'],
    icon: 'BookOpen',
    description: 'Shakespeare, 19th-Century Novel, Modern Texts, Power & Conflict Poetry',
    color: 'from-rose-600 to-pink-600',
  },
  {
    id: 'history',
    name: 'GCSE History',
    code: '8145',
    supportedBoards: ['AQA', 'Edexcel', 'OCR'],
    icon: 'Landmark',
    description: 'Germany 1890–1945, Cold War, Conflict in the Middle East, Elizabethan England',
    color: 'from-yellow-700 to-amber-700',
  },
  {
    id: 'geography',
    name: 'GCSE Geography',
    code: '8035',
    supportedBoards: ['AQA', 'Edexcel', 'OCR'],
    icon: 'Globe',
    description: 'Living with the physical environment, Challenges in the human environment, Fieldwork',
    color: 'from-cyan-600 to-blue-600',
  },
];

export const GCSE_TOPICS: GCSETopic[] = [
  // Mathematics
  {
    id: 'm-alg-1',
    subjectId: 'maths',
    unitName: 'Algebra',
    topicName: 'Quadratic Equations & Factoring',
    tier: 'Higher',
    minGrade: 6,
    maxGrade: 9,
    description: 'Factoring quadratics $ax^2+bx+c=0$, completing the square, quadratic formula.',
    keyFormulae: ['x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'],
  },
  {
    id: 'm-alg-2',
    subjectId: 'maths',
    unitName: 'Algebra',
    topicName: 'Simultaneous Equations (Linear & Non-Linear)',
    tier: 'Higher',
    minGrade: 7,
    maxGrade: 9,
    description: 'Solving linear and non-linear simultaneous equations algebraically.',
  },
  {
    id: 'm-geo-1',
    subjectId: 'maths',
    unitName: 'Geometry',
    topicName: 'Trigonometry in 3D & Non-Right Triangles',
    tier: 'Higher',
    minGrade: 7,
    maxGrade: 9,
    description: 'Sine rule, Cosine rule, Area of triangle $\\frac{1}{2}ab\\sin(C)$, 3D Pythagoras.',
    keyFormulae: ['\\frac{a}{\\sin A} = \\frac{b}{\\sin B}', 'c^2 = a^2 + b^2 - 2ab\\cos C'],
  },

  // Physics
  {
    id: 'p-eng-1',
    subjectId: 'physics',
    unitName: 'Energy',
    topicName: 'Specific Heat Capacity & Energy Transfers',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 8,
    description: 'Calculating $\\Delta E = m c \\Delta \\theta$, work done, conservation of energy.',
    keyFormulae: ['\\Delta E = m c \\Delta \\theta', 'E_k = \\frac{1}{2}m v^2'],
  },

  // Computer Science
  {
    id: 'cs-sys-1',
    subjectId: 'cs',
    unitName: 'Systems Architecture',
    topicName: 'CPU Architecture (Von Neumann & FDE Cycle)',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Registers (MAR, MDR, PC, Accumulator), ALU, Control Unit, Fetch-Decode-Execute cycle.',
  },

  // Chemistry
  {
    id: 'ch-atom-1',
    subjectId: 'chemistry',
    unitName: 'Atomic Structure',
    topicName: 'Isotopes, Relative Atomic Mass & Electronic Structure',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 8,
    description: 'Subatomic particles, mass numbers, calculating RAM from isotopic abundances.',
  },

  // Biology
  {
    id: 'bio-cell-1',
    subjectId: 'biology',
    unitName: 'Cell Biology',
    topicName: 'Mitosis, Stem Cells & Microscopy Calculations',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Cell division cycle, stem cell differentiation, Magnification = Image / Actual.',
  },

  // English Literature
  {
    id: 'eng-lit-1',
    subjectId: 'english-lit',
    unitName: 'Shakespearean Drama',
    topicName: 'Macbeth: Ambition, Guilt & The Supernatural',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Analyzing Lady Macbeth, dramatic irony, tragedy conventions, and Jacobean context.',
  },
  {
    id: 'eng-lit-2',
    subjectId: 'english-lit',
    unitName: 'Poetry Anthology',
    topicName: 'Power & Conflict Poetry: Ozymandias & Bayonet Charge',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Comparing poetic devices, structural shifts, imagery, and power dynamics.',
  },

  // History
  {
    id: 'hist-1',
    subjectId: 'history',
    unitName: 'Period Study',
    topicName: 'Germany 1890–1945: Weimar Republic & Rise of the Nazi Party',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Treaty of Versailles impact, 1923 Hyperinflation, Munich Putsch, and Wall Street Crash.',
  },
  {
    id: 'hist-2',
    subjectId: 'history',
    unitName: 'Conflict & Tension',
    topicName: 'The Cold War 1945–1972: Cuban Missile Crisis & Berlin Wall',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Yalta/Potsdam, Truman Doctrine, Cuban Missile Crisis brinkmanship, and Detente.',
  },

  // Geography
  {
    id: 'geo-1',
    subjectId: 'geography',
    unitName: 'Physical Environment',
    topicName: 'Plate Tectonics, Earthquakes & Volcanic Hazards',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Constructive, destructive, and conservative plate boundaries; tectonic management.',
  },
  {
    id: 'geo-2',
    subjectId: 'geography',
    unitName: 'Human Environment',
    topicName: 'Urban Issues, Sustainable Cities & Megacities',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Urban growth in LICs/NEEs, Freiburg sustainable urban living case study.',
  },
];

export const INITIAL_SEED_QUESTIONS: SeedQuestion[] = [
  {
    id: 'sq-m-1',
    topicId: 'm-alg-1',
    gradeLevel: 7,
    questionText: 'Solve the quadratic equation by factoring: $2x^2 + 7x + 3 = 0$. Find the possible values of $x$.',
    questionType: 'multiple_choice',
    options: [
      '$x = -3$ or $x = -1/2$',
      '$x = 3$ or $x = 1/2$',
      '$x = -7$ or $x = 3$',
      '$x = -2$ or $x = -3/2$'
    ],
    correctAnswer: '$x = -3$ or $x = -1/2$',
    explanation: {
      overview: 'To solve $2x^2 + 7x + 3 = 0$, we need two numbers that multiply to $a \\times c = 2 \\times 3 = 6$ and add up to $b = 7$.',
      stepByStep: [
        'Multiply $a$ and $c$: $2 \\times 3 = 6$.',
        'Find numbers that multiply to $6$ and add to $7$: these are $6$ and $1$.',
        'Rewrite the middle term: $2x^2 + 6x + x + 3 = 0$.',
        'Factor by grouping: $2x(x + 3) + 1(x + 3) = 0$.',
        'Combine terms: $(2x + 1)(x + 3) = 0$.',
        'Set each factor to zero: $2x + 1 = 0 \\implies x = -1/2$, and $x + 3 = 0 \\implies x = -3$.'
      ],
      keyConcept: 'Factoring non-unit quadratics $ax^2+bx+c=0$ requires splitting the middle term $bx$ using two numbers whose product is $ac$ and sum is $b$.',
      commonMistakes: [
        'Forgetting to change the signs when setting factors equal to zero.',
        'Trying to split the middle term without considering the coefficient $a=2$.'
      ],
      examTip: 'Always substitute your values of $x$ back into the original equation to check if the result equals $0$!'
    },
    markScheme: 'M1 for splitting middle term into 6x + x\nM1 for factoring into (2x+1)(x+3)\nA1 for both correct answers x = -0.5 and x = -3'
  },
  {
    id: 'sq-p-1',
    topicId: 'p-eng-1',
    gradeLevel: 6,
    questionText: 'A $2.0\\text{ kg}$ block of aluminum requires $18,000\\text{ J}$ of thermal energy to increase its temperature by $10^\\circ\\text{C}$. Calculate the specific heat capacity $c$ of aluminum.',
    questionType: 'multiple_choice',
    options: [
      '$900\\text{ J/kg}^\\circ\\text{C}$',
      '$450\\text{ J/kg}^\\circ\\text{C}$',
      '$3,600\\text{ J/kg}^\\circ\\text{C}$',
      '$90\\text{ J/kg}^\\circ\\text{C}$'
    ],
    correctAnswer: '$900\\text{ J/kg}^\\circ\\text{C}$',
    explanation: {
      overview: 'We use the specific heat capacity equation $\\Delta E = m c \\Delta \\theta$ and rearrange for $c$.',
      stepByStep: [
        'Identify given values: $\\Delta E = 18,000\\text{ J}$, $m = 2.0\\text{ kg}$, $\\Delta \\theta = 10^\\circ\\text{C}$.',
        'State formula: $\\Delta E = m \\times c \\times \\Delta \\theta$.',
        'Rearrange for $c$: $c = \\frac{\\Delta E}{m \\times \\Delta \\theta}$.',
        'Substitute values: $c = \\frac{18,000}{2.0 \\times 10} = \\frac{18,000}{20} = 900\\text{ J/kg}^\\circ\\text{C}$.'
      ],
      keyConcept: 'Specific Heat Capacity is the amount of energy required to raise the temperature of $1\\text{ kg}$ of a substance by $1^\\circ\\text{C}$.',
      commonMistakes: [
        'Forgetting to multiply mass by temperature change in the denominator.',
        'Not converting mass to kilograms if given in grams.'
      ],
      examTip: 'Check the units specified in the question. Mass must be in kg and Energy in Joules (J).'
    },
    markScheme: 'C1 for identifying equation\nC1 for correct rearrangement c = E / (m * delta_T)\nA1 for correct answer 900 J/kg°C'
  },
  {
    id: 'sq-cs-1',
    topicId: 'cs-sys-1',
    gradeLevel: 5,
    questionText: 'Which CPU register holds the memory address of the NEXT instruction to be fetched from RAM during the Fetch-Decode-Execute cycle?',
    questionType: 'multiple_choice',
    options: [
      'Program Counter (PC)',
      'Memory Address Register (MAR)',
      'Memory Data Register (MDR)',
      'Accumulator (ACC)'
    ],
    correctAnswer: 'Program Counter (PC)',
    explanation: {
      overview: 'The Program Counter (PC) stores the address of the next instruction to be fetched.',
      stepByStep: [
        'The Program Counter (PC) holds the memory address of the next instruction.',
        'During the Fetch phase, the address in the PC is copied to the Memory Address Register (MAR).',
        'The PC is then incremented to point to the next instruction in RAM.',
        'The instruction at that address is loaded into the Memory Data Register (MDR).'
      ],
      keyConcept: 'Program Counter (PC) increments after each fetch cycle to ensure sequential execution of program instructions.',
      commonMistakes: [
        'Confusing the Program Counter (PC) with the Memory Address Register (MAR). MAR holds the address being currently read, while PC holds the NEXT address.'
      ],
      examTip: 'Remember: PC points to the NEXT instruction, MAR holds the CURRENT address on the bus!'
    }
  },
  {
    id: 'sq-eng-1',
    topicId: 'eng-lit-1',
    gradeLevel: 8,
    questionText: 'In Shakespeare’s *Macbeth*, what does the metaphor "O, full of scorpions is my mind, dear wife!" signify about Macbeth’s mental state in Act 3, Scene 2?',
    questionType: 'multiple_choice',
    options: [
      'His intense paranoia and torment following the murder of King Duncan',
      'His determination to defeat Macduff on the battlefield',
      'His grief over Lady Macbeth’s illness',
      'His physical poisoning by the three Witches'
    ],
    correctAnswer: 'His intense paranoia and torment following the murder of King Duncan',
    explanation: {
      overview: 'The metaphor comparing his thoughts to scorpions conveys intense pain, paranoia, and psychological degradation.',
      stepByStep: [
        'Analyze the imagery of "scorpions": dangerous, venomous creatures causing continuous stinging pain.',
        'Contextualize Act 3 Scene 2: Banquo is still alive and Macbeth feels insecure in his crown.',
        'Recognize that guilt and fear of losing power are tormenting his mind constantly.'
      ],
      keyConcept: 'Shakespeare uses animalistic imagery to highlight Macbeth’s declining moral state and psychological disintegration.',
      commonMistakes: [
        'Interpreting the line literally as a physical ailment rather than psychological turmoil.'
      ],
      examTip: 'Always link language analysis (metaphors, motifs) directly to Jacobean context and character development!'
    }
  },
  {
    id: 'sq-hist-1',
    topicId: 'hist-1',
    gradeLevel: 7,
    questionText: 'What was a primary economic consequence of the French occupation of the Ruhr in 1923 for the Weimar Republic in Germany?',
    questionType: 'multiple_choice',
    options: [
      'Hyperinflation caused by the German government printing money to pay striking workers',
      'The immediate collapse of the League of Nations',
      'The rise of Gustav Stresemann as Chancellor of France',
      'An economic boom due to increased domestic coal production'
    ],
    correctAnswer: 'Hyperinflation caused by the German government printing money to pay striking workers',
    explanation: {
      overview: 'Passive resistance in the Ruhr led the Weimar government to print banknotes to compensate workers, triggering hyperinflation.',
      stepByStep: [
        'In Jan 1923, French and Belgian troops occupied the Ruhr industrial region due to defaulted reparation payments.',
        'German workers engaged in passive resistance (striking).',
        'The government printed paper currency to pay strikers and cover lost tax revenue.',
        'This hyper-inflated the German Mark, rendering money virtually worthless.'
      ],
      keyConcept: 'Passive resistance and reckless money printing transformed an economic shortfall into hyperinflation in 1923.',
      commonMistakes: [
        'Confusing the 1923 Hyperinflation Crisis with the 1929 Great Depression.'
      ],
      examTip: 'Structure 1923 history answers by linking Cause (Ruhr invasion) -> Reaction (Passive resistance) -> Effect (Hyperinflation).'
    }
  },
  {
    id: 'sq-geo-1',
    topicId: 'geo-1',
    gradeLevel: 6,
    questionText: 'At which type of plate margin do oceanic and continental plates collide, causing the denser oceanic plate to sink beneath the continental plate into the mantle?',
    questionType: 'multiple_choice',
    options: [
      'Destructive (Subduction) Margin',
      'Constructive (Divergent) Margin',
      'Conservative (Transform) Margin',
      'Collision (Continental-Continental) Margin'
    ],
    correctAnswer: 'Destructive (Subduction) Margin',
    explanation: {
      overview: 'At destructive margins, the denser oceanic plate subducts under the lighter continental plate.',
      stepByStep: [
        'Oceanic crust is denser than continental crust.',
        'When they converge, the oceanic plate is forced downwards into the asthenosphere (subduction).',
        'Friction creates deep ocean trenches and explosive composite volcanoes.'
      ],
      keyConcept: 'Subduction occurs at destructive plate boundaries where density differences force one plate beneath another.',
      commonMistakes: [
        'Thinking conservative margins create volcanoes (they only cause earthquakes due to lateral sliding).'
      ],
      examTip: 'Use precise geological terms like "subduction zone", "trench", and "mantle convection" for top marks.'
    }
  }
];


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
  keywords?: string[];
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
    keywords: ['quadratic', 'quadratics', 'factoring', 'completing the square', 'roots', 'algebra'],
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
    keywords: ['simultaneous', 'linear', 'non-linear', 'substitution', 'elimination'],
  },
  {
    id: 'm-num-1',
    subjectId: 'maths',
    unitName: 'Number',
    topicName: 'Indices, Powers & Standard Form',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Laws of indices $a^m \\times a^n = a^{m+n}$, fractional/negative powers $x^{-n} = \\frac{1}{x^n}$, $A \\times 10^n$.',
    keyFormulae: ['a^m \\times a^n = a^{m+n}', 'x^{-n} = \\frac{1}{x^n}', 'x^{1/n} = \\sqrt[n]{x}'],
    keywords: ['indices', 'index', 'powers', 'power', 'exponents', 'fractional indices', 'standard form', 'scientific notation'],
  },
  {
    id: 'm-alg-3',
    subjectId: 'maths',
    unitName: 'Algebra',
    topicName: 'Sequences, Nth Term & Arithmetic Progressions',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Finding the $n$-th term of linear and quadratic sequences $an^2+bn+c$, Fibonacci sequences.',
    keyFormulae: ['u_n = a + (n-1)d', 'an^2 + bn + c'],
    keywords: ['sequence', 'sequences', 'nth term', 'n-th term', 'arithmetic', 'quadratic sequence', 'fibonacci', 'progression'],
  },
  {
    id: 'm-num-2',
    subjectId: 'maths',
    unitName: 'Number',
    topicName: 'Surds & Simplifying Irrational Expressions',
    tier: 'Higher',
    minGrade: 7,
    maxGrade: 9,
    description: 'Simplifying surds $\\sqrt{ab} = \\sqrt{a}\\sqrt{b}$, rationalising the denominator $\\frac{1}{\\sqrt{a}+b}$.',
    keyFormulae: ['\\sqrt{ab} = \\sqrt{a}\\sqrt{b}', '\\frac{1}{\\sqrt{a}} = \\frac{\\sqrt{a}}{a}'],
    keywords: ['surds', 'surd', 'irrational', 'square root', 'rationalise denominator'],
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
    keywords: ['trigonometry', 'sine rule', 'cosine rule', 'sohcahtoa', '3d pythagoras', 'non-right triangles'],
  },
  {
    id: 'm-geo-2',
    subjectId: 'maths',
    unitName: 'Geometry',
    topicName: 'Vector Geometry & Geometric Proofs',
    tier: 'Higher',
    minGrade: 7,
    maxGrade: 9,
    description: 'Vector addition, scalar multiplication, proving collinear points and parallel line segments.',
    keyFormulae: ['\\vec{AB} = \\vec{OB} - \\vec{OA}'],
    keywords: ['vector', 'vectors', 'vector geometry', 'collinear', 'parallel vectors', 'geometric proof'],
  },
  {
    id: 'm-prob-1',
    subjectId: 'maths',
    unitName: 'Probability',
    topicName: 'Probability Trees, Venn Diagrams & Conditional Probability',
    tier: 'Both',
    minGrade: 5,
    maxGrade: 9,
    description: 'Independent and conditional events, probability tree diagrams, set notation $P(A \\cap B)$.',
    keyFormulae: ['P(A \\text{ and } B) = P(A) \\times P(B|A)'],
    keywords: ['probability', 'probability tree', 'tree diagram', 'venn diagram', 'conditional probability', 'events'],
  },
  {
    id: 'm-stat-1',
    subjectId: 'maths',
    unitName: 'Statistics',
    topicName: 'Histograms, Cumulative Frequency & Box Plots',
    tier: 'Both',
    minGrade: 5,
    maxGrade: 9,
    description: 'Frequency density = frequency / class width, cumulative frequency curves, interquartile range (IQR).',
    keyFormulae: ['\\text{Frequency Density} = \\frac{\\text{Frequency}}{\\text{Class Width}}'],
    keywords: ['statistics', 'histogram', 'histograms', 'frequency density', 'cumulative frequency', 'box plot', 'iqr', 'median'],
  },
  {
    id: 'm-num-3',
    subjectId: 'maths',
    unitName: 'Ratio & Proportion',
    topicName: 'Ratio, Direct & Inverse Proportion',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Sharing in a ratio, compound units (speed, density, pressure), proportional constants $y = k x^n$.',
    keyFormulae: ['y = k x', 'y = \\frac{k}{x}'],
    keywords: ['ratio', 'proportion', 'direct proportion', 'inverse proportion', 'compound measures', 'speed', 'density'],
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
    keywords: ['energy', 'heat capacity', 'specific heat capacity', 'conduction', 'convection', 'work done', 'kinetic energy'],
  },
  {
    id: 'p-elec-1',
    subjectId: 'physics',
    unitName: 'Electricity',
    topicName: 'Ohm’s Law, Resistance & Circuit Rules',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Current $I = Q/t$, potential difference $V = IR$, series and parallel circuits.',
    keyFormulae: ['V = I R', 'P = I V', 'E = P t'],
    keywords: ['electricity', 'ohms law', 'resistance', 'current', 'voltage', 'circuits', 'resistor'],
  },
  {
    id: 'p-force-1',
    subjectId: 'physics',
    unitName: 'Forces',
    topicName: 'Newton’s Laws, Velocity & Momentum',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Resultant forces $F = ma$, velocity-time graphs, momentum $p = mv$ and conservation.',
    keyFormulae: ['F = m a', 'p = m v', 'W = m g'],
    keywords: ['forces', 'newton', 'momentum', 'velocity', 'acceleration', 'gravity', 'terminal velocity'],
  },
  {
    id: 'p-wave-1',
    subjectId: 'physics',
    unitName: 'Waves',
    topicName: 'Wave Equation, Refraction & EM Spectrum',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Wave speed $v = f \\lambda$, transverse/longitudinal waves, electromagnetic spectrum applications.',
    keyFormulae: ['v = f \\lambda', 'T = \\frac{1}{f}'],
    keywords: ['waves', 'wave speed', 'refraction', 'em spectrum', 'light', 'sound', 'frequency', 'wavelength'],
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
    keywords: ['atoms', 'atomic structure', 'isotopes', 'relative atomic mass', 'electrons', 'protons', 'neutrons'],
  },
  {
    id: 'ch-quant-1',
    subjectId: 'chemistry',
    unitName: 'Quantitative Chemistry',
    topicName: 'Moles, Stoichiometry & Molar Concentration',
    tier: 'Higher',
    minGrade: 6,
    maxGrade: 9,
    description: 'Moles $n = \\frac{m}{M_r}$, concentration $C = \\frac{n}{V}$, Avogadro constant $6.02 \\times 10^{23}$.',
    keyFormulae: ['n = \\frac{m}{M_r}', 'C = \\frac{n}{V}'],
    keywords: ['moles', 'quantitative', 'stoichiometry', 'concentration', 'titration', 'avogadro'],
  },
  {
    id: 'ch-react-1',
    subjectId: 'chemistry',
    unitName: 'Chemical Changes',
    topicName: 'Electrolysis, Acids, Reactivity & Neutralisation',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Reactivity series, electrolysis of molten/aqueous compounds, pH scale and titrations.',
    keyFormulae: ['\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water}'],
    keywords: ['electrolysis', 'acids', 'bases', 'reactivity', 'ph', 'salts', 'neutralisation'],
  },
  {
    id: 'ch-org-1',
    subjectId: 'chemistry',
    unitName: 'Organic Chemistry',
    topicName: 'Alkanes, Alkenes & Fractional Distillation',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Crude oil refining, general formula of alkanes $C_n H_{2n+2}$ and alkenes $C_n H_{2n}$, cracking.',
    keyFormulae: ['C_n H_{2n+2}', 'C_n H_{2n}'],
    keywords: ['organic chemistry', 'alkanes', 'alkenes', 'crude oil', 'fractional distillation', 'cracking', 'polymers'],
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
    keyFormulae: ['\\text{Magnification} = \\frac{\\text{Image Size}}{\\text{Actual Size}}'],
    keywords: ['mitosis', 'stem cells', 'microscopy', 'cells', 'magnification', 'cell division', 'diffusoin', 'osmosis'],
  },
  {
    id: 'bio-org-1',
    subjectId: 'biology',
    unitName: 'Organisation',
    topicName: 'Enzymes, Digestive System & Heart Circulation',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Lock and key enzyme theory, denaturation, double circulatory system, blood vessels.',
    keywords: ['enzymes', 'digestion', 'heart', 'circulatory system', 'blood', 'arteries', 'veins'],
  },
  {
    id: 'bio-gen-1',
    subjectId: 'biology',
    unitName: 'Genetics & Evolution',
    topicName: 'DNA, Inheritance, Punnett Squares & Natural Selection',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Structure of DNA, dominant/recessive alleles, Punnett square crosses, Darwinian evolution.',
    keywords: ['genetics', 'dna', 'inheritance', 'punnett square', 'evolution', 'natural selection', 'alleles'],
  },
  {
    id: 'bio-eco-1',
    subjectId: 'biology',
    unitName: 'Ecology',
    topicName: 'Photosynthesis, Respiration & Ecosystems',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Photosynthesis equation $6CO_2+6H_2O \\rightarrow C_6H_{12}O_6+6O_2$, aerobic/anaerobic respiration.',
    keyFormulae: ['6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2'],
    keywords: ['photosynthesis', 'respiration', 'ecology', 'ecosystem', 'biodiversity', 'food chain'],
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
    keywords: ['cpu', 'von neumann', 'fetch decode execute', 'registers', 'mar', 'mdr', 'pc', 'ram'],
  },
  {
    id: 'cs-data-1',
    subjectId: 'cs',
    unitName: 'Data Representation',
    topicName: 'Binary, Hexadecimal, Sound & Image Representation',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Binary additions, Two’s complement, hexadecimal conversion, resolution, color depth, sampling rate.',
    keywords: ['binary', 'hexadecimal', 'data representation', 'ascii', 'unicode', 'resolution', 'sampling rate'],
  },
  {
    id: 'cs-net-1',
    subjectId: 'cs',
    unitName: 'Computer Networks',
    topicName: 'Network Topologies, Security & Protocols',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Star/mesh topologies, TCP/IP layer model, Wi-Fi, Ethernet, malware, phishing, SQL injection.',
    keywords: ['networks', 'topologies', 'protocols', 'tcp ip', 'cybersecurity', 'malware', 'phishing', 'sql injection'],
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
    keywords: ['macbeth', 'lady macbeth', 'shakespeare', 'ambition', 'guilt', 'witches', 'tragedy'],
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
    keywords: ['ozymandias', 'poetry', 'bayonet charge', 'power and conflict', 'remains', 'london'],
  },
  {
    id: 'eng-lit-3',
    subjectId: 'english-lit',
    unitName: 'Modern Drama',
    topicName: 'An Inspector Calls: Social Responsibility & Class System',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Priestley’s socialist critique, Birling family dynamics, Inspector Goole as dramatic device.',
    keywords: ['an inspector calls', 'inspector calls', 'priestley', 'birling', 'socialism', 'responsibility'],
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
    keywords: ['germany', 'weimar', 'hitler', 'nazi', 'versailles', 'hyperinflation', 'munich putsch'],
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
    keywords: ['cold war', 'cuban missile crisis', 'berlin wall', 'khrushchev', 'truman', 'detente', 'ussr'],
  },
  {
    id: 'hist-3',
    subjectId: 'history',
    unitName: 'British Depth Study',
    topicName: 'Elizabethan England c1568–1603: Religious Settlement & Spanish Armada',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Queen Elizabeth I, Catholic plots, Mary Queen of Scots execution, defeat of the Armada 1588.',
    keywords: ['elizabeth', 'elizabethan', 'armada', 'mary queen of scots', 'tudors', 'spanish armada'],
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
    keywords: ['tectonics', 'plate tectonics', 'earthquakes', 'volcanoes', 'subduction', 'fault lines'],
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
    keywords: ['urban', 'cities', 'megacities', 'sustainability', 'freiburg', 'favela', 'urbanisation'],
  },
  {
    id: 'geo-3',
    subjectId: 'geography',
    unitName: 'Physical Landscapes',
    topicName: 'River Processes, Erosion & Flood Management',
    tier: 'Both',
    minGrade: 4,
    maxGrade: 9,
    description: 'Upper/middle/lower river courses, meanders, oxbow lakes, hard & soft engineering.',
    keywords: ['rivers', 'erosion', 'flood', 'meanders', 'oxbow lake', 'hard engineering', 'coasts'],
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
      commonMistakes: ['Thinking conservative margins create volcanoes (they only cause earthquakes).'],
      examTip: 'Use precise geological terms like "subduction zone", "trench", and "mantle convection" for top marks.'
    },
    markScheme: 'Use precise geological terms like subduction zone, trench, and mantle convection for top marks.'
  },
  {
    id: 'sq-m-2-g4',
    topicId: 'm-alg-1',
    gradeLevel: 4,
    questionText: 'Factorize the expression $x^2 + 5x + 6$.',
    questionType: 'multiple_choice',
    options: [
      '$(x + 2)(x + 3)$',
      '$(x + 1)(x + 6)$',
      '$(x - 2)(x - 3)$',
      '$(x + 5)(x + 1)$'
    ],
    correctAnswer: '$(x + 2)(x + 3)$',
    explanation: {
      overview: 'We need two numbers that add to 5 and multiply to 6. These are 2 and 3.',
      stepByStep: [
        'Find factors of 6: 1 x 6, 2 x 3.',
        'Check sums: 1 + 6 = 7, 2 + 3 = 5.',
        'Write in double brackets: $(x + 2)(x + 3)$.'
      ],
      keyConcept: 'Simple quadratics $x^2+bx+c$ factor into $(x+p)(x+q)$ where $p+q=b$ and $p \\times q=c$.',
      commonMistakes: ['Confusing factors that add to c instead of multiplying to c.'],
      examTip: 'Expand your brackets using FOIL to verify!'
    }
  },
  {
    id: 'sq-m-3-g9',
    topicId: 'm-geo-1',
    gradeLevel: 9,
    questionText: 'In triangle ABC, side $a = 7\\text{ cm}$, side $b = 10\\text{ cm}$, and angle $C = 60^\\circ$. Calculate the exact length of side $c$.',
    questionType: 'multiple_choice',
    options: [
      '$\\sqrt{79}\\text{ cm}$',
      '$\\sqrt{149}\\text{ cm}$',
      '$\\sqrt{51}\\text{ cm}$',
      '$9.5\\text{ cm}$'
    ],
    correctAnswer: '$\\sqrt{79}\\text{ cm}$',
    explanation: {
      overview: 'Apply the Cosine Rule: $c^2 = a^2 + b^2 - 2ab\\cos(C)$.',
      stepByStep: [
        '$c^2 = 7^2 + 10^2 - 2(7)(10)\\cos(60^\\circ)$.',
        '$c^2 = 49 + 100 - 140 \\times (0.5) = 149 - 70 = 79$.',
        '$c = \\sqrt{79}\\text{ cm}$.'
      ],
      keyConcept: 'Cosine rule links 3 sides and 1 angle of any non-right triangle.',
      commonMistakes: ['Forgetting that $\\cos(60^\\circ) = 0.5$.'],
      examTip: 'Keep exact surd values unless asked to round to 3 sig figs.'
    }
  },
  {
    id: 'sq-bio-1-g5',
    topicId: 'bio-cell-1',
    gradeLevel: 5,
    questionText: 'An image of a plant cell under a light microscope measures $30\\text{ mm}$ in width. If the actual width of the cell is $0.05\\text{ mm}$, what is the magnification?',
    questionType: 'multiple_choice',
    options: [
      '$\\times 600$',
      '$\\times 150$',
      '$\\times 60$',
      '$\\times 1,500$'
    ],
    correctAnswer: '$\\times 600$',
    explanation: {
      overview: 'Use the triangle formula: $\\text{Magnification} = \\frac{\\text{Image Size}}{\\text{Actual Size}}$.',
      stepByStep: [
        'Image size = $30\\text{ mm}$.',
        'Actual size = $0.05\\text{ mm}$.',
        'Magnification = $30 / 0.05 = 600$.'
      ],
      keyConcept: 'Always check that Image Size and Actual Size are in the same units before dividing!',
      commonMistakes: ['Dividing Actual by Image instead of Image by Actual.'],
      examTip: 'Remember the formula triangle I = A x M.'
    }
  },
  {
    id: 'sq-ch-1-g7',
    topicId: 'ch-atom-1',
    gradeLevel: 7,
    questionText: 'A sample of copper contains $69\\%$ $^{63}\\text{Cu}$ and $31\\%$ $^{65}\\text{Cu}$. Calculate the relative atomic mass ($A_r$) of copper to 1 decimal place.',
    questionType: 'multiple_choice',
    options: [
      '$63.6$',
      '$64.0$',
      '$63.5$',
      '$64.2$'
    ],
    correctAnswer: '$63.6$',
    explanation: {
      overview: '$A_r = \\frac{\\sum (\\text{isotope mass} \\times \\text{abundance})}{100}$.',
      stepByStep: [
        '$(63 \\times 69) + (65 \\times 31) = 4347 + 2015 = 6362$.',
        '$6362 / 100 = 63.62$.',
        'To 1 decimal place = $63.6$.'
      ],
      keyConcept: 'Relative atomic mass is a weighted average of isotopic masses.',
      commonMistakes: ['Simply taking the mean (63 + 65)/2 = 64 without weighting by abundance.'],
      examTip: 'Check your final answer lies between the lowest and highest isotopic masses!'
    }
  },
  {
    id: 'sq-m-indices-g5',
    topicId: 'm-alg-2',
    gradeLevel: 5,
    questionText: 'Simplify the expression $3x^4 \\times 5x^7$.',
    questionType: 'multiple_choice',
    options: [
      '$15x^{11}$',
      '$15x^{28}$',
      '$8x^{11}$',
      '$8x^{28}$'
    ],
    correctAnswer: '$15x^{11}$',
    explanation: {
      overview: 'When multiplying terms with indices: multiply coefficients ($3 \\times 5$) and add exponents ($4 + 7$).',
      stepByStep: [
        'Multiply coefficients: $3 \\times 5 = 15$.',
        'Apply first law of indices ($a^m \\times a^n = a^{m+n}$): $x^4 \\times x^7 = x^{4+7} = x^{11}$.',
        'Combine: $15x^{11}$.'
      ],
      keyConcept: 'First index law: $a^m \\times a^n = a^{m+n}$. Coefficients multiply normally.',
      commonMistakes: ['Multiplying the powers ($4 \\times 7 = 28$) instead of adding them.'],
      examTip: 'Remember: multiply base numbers, add powers!'
    }
  },
  {
    id: 'sq-m-surds-g8',
    topicId: 'm-alg-3',
    gradeLevel: 8,
    questionText: 'Expand and simplify $(\\sqrt{5} + 3)(\\sqrt{5} - 2)$.',
    questionType: 'multiple_choice',
    options: [
      '$\\sqrt{5} - 1$',
      '$11 + \\sqrt{5}$',
      '$\\sqrt{5} + 5$',
      '$5 + 3\\sqrt{5}$'
    ],
    correctAnswer: '$\\sqrt{5} - 1$',
    explanation: {
      overview: 'Use FOIL to expand: $(\\sqrt{5} \\times \\sqrt{5}) - 2\\sqrt{5} + 3\\sqrt{5} - 6$.',
      stepByStep: [
        'First: $\\sqrt{5} \\times \\sqrt{5} = 5$.',
        'Outer: $\\sqrt{5} \\times (-2) = -2\\sqrt{5}$.',
        'Inner: $3 \\times \\sqrt{5} = 3\\sqrt{5}$.',
        'Last: $3 \\times (-2) = -6$.',
        'Combine integers: $5 - 6 = -1$.',
        'Combine surds: $-2\\sqrt{5} + 3\\sqrt{5} = \\sqrt{5}$.',
        'Final result: $\\sqrt{5} - 1$.'
      ],
      keyConcept: '$\\sqrt{a} \\times \\sqrt{a} = a$. Collect like surd terms together.',
      commonMistakes: ['Thinking $\\sqrt{5} \\times \\sqrt{5} = 25$ instead of $5$.'],
      examTip: 'Write out each FOIL term separately to avoid sign errors.'
    }
  },
  {
    id: 'sq-m-vec-g8',
    topicId: 'm-geo-2',
    gradeLevel: 8,
    questionText: 'Vector $\\mathbf{a} = \\begin{pmatrix} 4 \\\\ -3 \\end{pmatrix}$ and vector $\\mathbf{b} = \\begin{pmatrix} -2 \\\\ 5 \\end{pmatrix}$. Calculate $3\\mathbf{a} - 2\\mathbf{b}$.',
    questionType: 'multiple_choice',
    options: [
      '$\\begin{pmatrix} 16 \\\\ -19 \\end{pmatrix}$',
      '$\\begin{pmatrix} 8 \\\\ 1 \\end{pmatrix}$',
      '$\\begin{pmatrix} 16 \\\\ 1 \\end{pmatrix}$',
      '$\\begin{pmatrix} 6 \\\\ -19 \\end{pmatrix}$'
    ],
    correctAnswer: '$\\begin{pmatrix} 16 \\\\ -19 \\end{pmatrix}$',
    explanation: {
      overview: 'Multiply vector components by scalars and subtract top and bottom values.',
      stepByStep: [
        '$3\\mathbf{a} = 3 \\begin{pmatrix} 4 \\\\ -3 \\end{pmatrix} = \\begin{pmatrix} 12 \\\\ -9 \\end{pmatrix}$.',
        '$2\\mathbf{b} = 2 \\begin{pmatrix} -2 \\\\ 5 \\end{pmatrix} = \\begin{pmatrix} -4 \\\\ 10 \\end{pmatrix}$.',
        'Subtract x-components: $12 - (-4) = 16$.',
        'Subtract y-components: $-9 - 10 = -19$.',
        'Result: $\\begin{pmatrix} 16 \\\\ -19 \\end{pmatrix}$.'
      ],
      keyConcept: 'Scalar multiplication scales x and y components. Double negatives become addition.',
      commonMistakes: ['Subtracting $12 - 4 = 8$ instead of $12 - (-4) = 16$.'],
      examTip: 'Watch minus signs carefully in vector arithmetic!'
    }
  },
  {
    id: 'sq-p-elec-g5',
    topicId: 'p-eng-2',
    gradeLevel: 5,
    questionText: 'A resistor in a circuit has a potential difference of $12\\text{ V}$ across it and a current of $0.5\\text{ A}$ flowing through it. Calculate the resistance $R$.',
    questionType: 'multiple_choice',
    options: [
      '$24\\text{ }\\Omega$',
      '$6\\text{ }\\Omega$',
      '$0.0417\\text{ }\\Omega$',
      '$14.4\\text{ }\\Omega$'
    ],
    correctAnswer: '$24\\text{ }\\Omega$',
    explanation: {
      overview: 'Use Ohm’s Law equation: $V = I \\times R$, so $R = \\frac{V}{I}$.',
      stepByStep: [
        'Identify values: $V = 12\\text{ V}$, $I = 0.5\\text{ A}$.',
        'Rearrange for $R$: $R = V / I$.',
        'Substitute values: $R = 12 / 0.5 = 24\\text{ }\\Omega$.'
      ],
      keyConcept: 'Dividing by $0.5$ is equivalent to multiplying by $2$.',
      commonMistakes: ['Multiplying $12 \\times 0.5 = 6$ instead of dividing.'],
      examTip: 'Units for resistance are Ohms ($\\Omega$).'
    }
  },
  {
    id: 'sq-cs-bin-g5',
    topicId: 'cs-sys-2',
    gradeLevel: 5,
    questionText: 'Convert the 8-bit unsigned binary number $10110101_2$ into denary (decimal).',
    questionType: 'multiple_choice',
    options: [
      '$181$',
      '$173$',
      '$165$',
      '$197$'
    ],
    correctAnswer: '$181$',
    explanation: {
      overview: 'Sum place values ($128, 64, 32, 16, 8, 4, 2, 1$) corresponding to binary 1s.',
      stepByStep: [
        'Place values: $128(1) + 64(0) + 32(1) + 16(1) + 8(0) + 4(1) + 2(0) + 1(1)$.',
        'Add active bits: $128 + 32 + 16 + 4 + 1 = 181$.'
      ],
      keyConcept: 'Each bit represents powers of 2 from right ($2^0$) to left ($2^7$).',
      commonMistakes: ['Starting place values from 0 instead of 1 at the rightmost bit.'],
      examTip: 'Write place values $128, 64, 32, 16, 8, 4, 2, 1$ above the binary bits!'
    }
  },
  {
    id: 'sq-eng-aic-g7',
    topicId: 'eng-lit-2',
    gradeLevel: 7,
    questionText: 'In J.B. Priestley’s *An Inspector Calls*, how does Mr. Arthur Birling embody capitalist arrogance in Act 1?',
    questionType: 'multiple_choice',
    options: [
      'By declaring the Titanic "unsinkable, absolutely unsinkable" and dismissing war risks',
      'By expressing regret for firing Eva Smith from his factory',
      'By supporting the trade union movement and higher wages',
      'By welcoming Inspector Goole as an esteemed old friend'
    ],
    correctAnswer: 'By declaring the Titanic "unsinkable, absolutely unsinkable" and dismissing war risks',
    explanation: {
      overview: 'Priestley uses dramatic irony in Birling’s foolish speeches to critique capitalism and upper-class complacency.',
      stepByStep: [
        'Recognize dramatic irony: the 1945 audience knows the Titanic sank in 1912 and WWI occurred.',
        'Birling’s confident mistakes make his capitalist worldview look short-sighted and foolish.',
        'Priestley promotes socialism by discrediting Birling’s individualism.'
      ],
      keyConcept: 'Dramatic irony undermines Mr. Birling’s authority before Inspector Goole arrives.',
      commonMistakes: ['Confusing Arthur Birling’s views with Sheila or Eric’s views.'],
      examTip: 'Always link character quotes to Priestley’s political intentions in post-WWII Britain!'
    }
  },
  {
    id: 'sq-hist-coldwar-g8',
    topicId: 'hist-2',
    gradeLevel: 8,
    questionText: 'What was a direct outcome of the 1962 Cuban Missile Crisis between the USA and USSR?',
    questionType: 'multiple_choice',
    options: [
      'Establishment of the Washington-Moscow Direct Communications Hotline and Partial Test Ban Treaty',
      'The immediate construction of the Berlin Wall in 1962',
      'The invasion of South Vietnam by Soviet military forces',
      'The permanent withdrawal of the US from NATO'
    ],
    correctAnswer: 'Establishment of the Washington-Moscow Direct Communications Hotline and Partial Test Ban Treaty',
    explanation: {
      overview: 'The near-nuclear war prompted Kennedy and Khrushchev to improve direct communication and limit nuclear testing.',
      stepByStep: [
        'Crisis ended with USSR removing Cuban missiles and US secretly removing Jupiter missiles from Turkey.',
        'To prevent future accidental war, a direct "Hotline" telephone link was created in 1963.',
        'In Aug 1963, both superpowers signed the Partial Test Ban Treaty.'
      ],
      keyConcept: 'Détente efforts emerged from the shock of coming close to nuclear destruction.',
      commonMistakes: ['Thinking the Berlin Wall was built after Cuba (it was built in 1961).'],
      examTip: 'Structure 8-mark consequences questions into short-term vs long-term impacts.'
    }
  }
];

/**
 * Shuffles question options randomly so the correct answer is NOT always option A.
 */
export function shuffleQuestionOptions(q: SeedQuestion): SeedQuestion {
  if (!q.options || q.options.length === 0) return q;

  const shuffled = [...q.options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return {
    ...q,
    options: shuffled,
  };
}



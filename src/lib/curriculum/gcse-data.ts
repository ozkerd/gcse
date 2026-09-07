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
  subtopicId?: string;
  subtopicName?: string;
  gradeLevel: number;
  examBoard?: ExamBoard | string;
  paperYear?: number;
  paperName?: string;
  questionText: string;
  questionType: 'multiple_choice' | 'fill_in_blank' | 'short_answer' | 'numerical';
  options?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  fillInTemplate?: string;
  numericalTolerance?: number;
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
    "id": "maths",
    "name": "GCSE Mathematics",
    "code": "8300 / 1MA1",
    "supportedBoards": [
      "AQA",
      "Edexcel",
      "OCR",
      "Eduqas",
      "CIE (Cambridge)"
    ],
    "icon": "Calculator",
    "description": "Number, Algebra, Ratio & Proportion, Geometry, Probability, Statistics",
    "color": "from-blue-600 to-indigo-600"
  },
  {
    "id": "physics",
    "name": "GCSE Physics",
    "code": "8463 / 1PH0",
    "supportedBoards": [
      "AQA",
      "Edexcel",
      "OCR",
      "CIE (Cambridge)"
    ],
    "icon": "Zap",
    "description": "Energy, Electricity, Particle Model, Atomic Structure, Forces, Waves, Magnetism, Space",
    "color": "from-purple-600 to-violet-600"
  },
  {
    "id": "chemistry",
    "name": "GCSE Chemistry",
    "code": "8462 / 1CH0",
    "supportedBoards": [
      "AQA",
      "Edexcel",
      "OCR",
      "CIE (Cambridge)"
    ],
    "icon": "FlaskConical",
    "description": "Atomic structure, Bonding, Quantitative chemistry, Chemical changes, Organic chemistry",
    "color": "from-emerald-600 to-teal-600"
  },
  {
    "id": "biology",
    "name": "GCSE Biology",
    "code": "8461 / 1BI0",
    "supportedBoards": [
      "AQA",
      "Edexcel",
      "OCR",
      "CIE (Cambridge)"
    ],
    "icon": "Dna",
    "description": "Cell biology, Organisation, Infection, Bioenergetics, Homeostasis, Genetics, Ecology",
    "color": "from-green-600 to-emerald-600"
  },
  {
    "id": "cs",
    "name": "GCSE Computer Science",
    "code": "J277 / 8525",
    "supportedBoards": [
      "OCR",
      "AQA",
      "Edexcel",
      "CIE (Cambridge)"
    ],
    "icon": "Cpu",
    "description": "Systems Architecture, Data Representation, Networking, Cybersecurity, Systems Software",
    "color": "from-amber-600 to-orange-600"
  },
  {
    "id": "english-lit",
    "name": "GCSE English Literature",
    "code": "8702",
    "supportedBoards": [
      "AQA",
      "Edexcel",
      "Eduqas",
      "OCR"
    ],
    "icon": "BookOpen",
    "description": "Shakespeare, 19th-Century Novel, Modern Drama, Power & Conflict Poetry",
    "color": "from-rose-600 to-pink-600"
  },
  {
    "id": "english-lang",
    "name": "GCSE English Language",
    "code": "8700 / 1EN0",
    "supportedBoards": [
      "AQA",
      "Edexcel",
      "Eduqas",
      "OCR"
    ],
    "icon": "FileText",
    "description": "Non-Fiction Reading, Language Analysis, Text Structure, Creative & Persuasive Writing",
    "color": "from-red-600 to-rose-600"
  },
  {
    "id": "business",
    "name": "GCSE Business Studies",
    "code": "8132 / 1BS0",
    "supportedBoards": [
      "AQA",
      "Edexcel",
      "OCR"
    ],
    "icon": "Briefcase",
    "description": "Entrepreneurship, Marketing, Operations, Finance, Human Resources, External Influences",
    "color": "from-indigo-600 to-purple-600"
  },
  {
    "id": "economics",
    "name": "GCSE Economics",
    "code": "8136 / J205",
    "supportedBoards": [
      "AQA",
      "OCR",
      "Edexcel"
    ],
    "icon": "TrendingUp",
    "description": "Scarcity, Demand & Supply, Elasticity, Market Failure, Macroeconomics, International Trade",
    "color": "from-teal-600 to-cyan-600"
  },
  {
    "id": "history",
    "name": "GCSE History",
    "code": "8145",
    "supportedBoards": [
      "AQA",
      "Edexcel",
      "OCR"
    ],
    "icon": "Landmark",
    "description": "Germany 1890\u20131945, Nazi Dictatorship, Cold War, Elizabethan England, Medicine",
    "color": "from-yellow-700 to-amber-700"
  },
  {
    "id": "geography",
    "name": "GCSE Geography",
    "code": "8035",
    "supportedBoards": [
      "AQA",
      "Edexcel",
      "OCR"
    ],
    "icon": "Globe",
    "description": "Tectonics, Weather Hazards, Coasts, Rivers, Urban Issues, Economic World",
    "color": "from-cyan-600 to-blue-600"
  }
];

export const GCSE_TOPICS: GCSETopic[] = [
  {
    "id": "m-num-1",
    "subjectId": "maths",
    "unitName": "Number",
    "topicName": "HCF, LCM & Prime Factorisation",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Finding prime factors, highest common factors and lowest common multiples.",
    "keywords": [
      "hcf",
      "lcm",
      "prime factors",
      "factor tree"
    ]
  },
  {
    "id": "m-num-2",
    "subjectId": "maths",
    "unitName": "Number",
    "topicName": "Fractions, Decimals, Percentages & Recurring Decimals",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Fractions arithmetic, percentage change, reverse percentages, converting recurring decimals.",
    "keywords": [
      "fractions",
      "percentages",
      "decimals",
      "recurring decimals"
    ]
  },
  {
    "id": "m-num-3",
    "subjectId": "maths",
    "unitName": "Number",
    "topicName": "Indices, Powers & Standard Form",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Laws of indices, fractional/negative powers, scientific notation $A \\times 10^n$.",
    "keywords": [
      "indices",
      "powers",
      "standard form",
      "exponents"
    ]
  },
  {
    "id": "m-num-4",
    "subjectId": "maths",
    "unitName": "Number",
    "topicName": "Surds & Simplifying Irrational Expressions",
    "tier": "Higher",
    "minGrade": 7,
    "maxGrade": 9,
    "description": "Simplifying surds $\\sqrt{ab}$, rationalising the denominator.",
    "keywords": [
      "surds",
      "irrational",
      "rationalise denominator"
    ]
  },
  {
    "id": "m-num-5",
    "subjectId": "maths",
    "unitName": "Number",
    "topicName": "Estimation, Rounding & Upper/Lower Bounds",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Significant figures, error intervals, calculating bounds in calculations.",
    "keywords": [
      "estimation",
      "rounding",
      "bounds",
      "error interval"
    ]
  },
  {
    "id": "m-alg-1",
    "subjectId": "maths",
    "unitName": "Algebra",
    "topicName": "Linear Equations, Inequalities & Rearranging Formulae",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Solving multi-step equations, linear inequalities on number lines, changing the subject.",
    "keywords": [
      "algebra",
      "linear equations",
      "inequalities",
      "rearranging formulae"
    ]
  },
  {
    "id": "m-alg-2",
    "subjectId": "maths",
    "unitName": "Algebra",
    "topicName": "Quadratic Equations, Factoring & Completing Square",
    "tier": "Higher",
    "minGrade": 6,
    "maxGrade": 9,
    "description": "Factoring $ax^2+bx+c=0$, completing the square, quadratic formula.",
    "keywords": [
      "quadratics",
      "factoring",
      "completing square",
      "quadratic formula"
    ]
  },
  {
    "id": "m-alg-3",
    "subjectId": "maths",
    "unitName": "Algebra",
    "topicName": "Simultaneous Equations (Linear & Non-Linear)",
    "tier": "Higher",
    "minGrade": 7,
    "maxGrade": 9,
    "description": "Solving linear and non-linear simultaneous equations algebraically.",
    "keywords": [
      "simultaneous",
      "linear",
      "non-linear",
      "elimination"
    ]
  },
  {
    "id": "m-alg-4",
    "subjectId": "maths",
    "unitName": "Algebra",
    "topicName": "Sequences, Nth Term (Linear & Quadratic) & Progressions",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "$n$-th term formula for linear and quadratic sequences $an^2+bn+c$, Fibonacci.",
    "keywords": [
      "sequences",
      "nth term",
      "quadratic sequence",
      "arithmetic"
    ]
  },
  {
    "id": "m-alg-5",
    "subjectId": "maths",
    "unitName": "Algebra",
    "topicName": "Algebraic Fractions, Proof & Functions",
    "tier": "Higher",
    "minGrade": 8,
    "maxGrade": 9,
    "description": "Simplifying algebraic fractions, composite/inverse functions $f(g(x))$, formal algebraic proof.",
    "keywords": [
      "algebraic fractions",
      "functions",
      "composite functions",
      "algebraic proof"
    ]
  },
  {
    "id": "m-alg-6",
    "subjectId": "maths",
    "unitName": "Algebra",
    "topicName": "Quadratic, Cubic & Reciprocal Graphs",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Turning points, roots, intercepts, sketching cubic $y=x^3$ and reciprocal $y=1/x$ graphs.",
    "keywords": [
      "graphs",
      "turning point",
      "cubic",
      "reciprocal"
    ]
  },
  {
    "id": "m-num-6",
    "subjectId": "maths",
    "unitName": "Ratio & Proportion",
    "topicName": "Ratio Sharing & Compound Measures (Speed, Density, Pressure)",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Sharing in ratios, compound units speed $v=d/t$, density $\\rho=m/V$, pressure $P=F/A$.",
    "keywords": [
      "ratio",
      "speed",
      "density",
      "pressure",
      "compound measures"
    ]
  },
  {
    "id": "m-num-7",
    "subjectId": "maths",
    "unitName": "Ratio & Proportion",
    "topicName": "Direct & Inverse Proportion",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Proportional constants $y = k x^n$ and $y = k / x^n$, proportion graphs.",
    "keywords": [
      "direct proportion",
      "inverse proportion",
      "proportionality"
    ]
  },
  {
    "id": "m-geo-1",
    "subjectId": "maths",
    "unitName": "Geometry",
    "topicName": "Angles, Polygons, Circle Theorems & Geometric Proofs",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Interior/exterior polygon angles, 8 circle theorems (alternate segment, cyclic quad).",
    "keywords": [
      "geometry",
      "circle theorems",
      "polygons",
      "angles"
    ]
  },
  {
    "id": "m-geo-2",
    "subjectId": "maths",
    "unitName": "Geometry",
    "topicName": "Trigonometry in 3D & Non-Right Triangles",
    "tier": "Higher",
    "minGrade": 7,
    "maxGrade": 9,
    "description": "Sine rule, Cosine rule, Area $\\frac{1}{2}ab\\sin C$, 3D Pythagoras.",
    "keywords": [
      "trigonometry",
      "sine rule",
      "cosine rule",
      "3d pythagoras"
    ]
  },
  {
    "id": "m-geo-3",
    "subjectId": "maths",
    "unitName": "Geometry",
    "topicName": "Vector Geometry, Column Vectors & Vector Proofs",
    "tier": "Higher",
    "minGrade": 7,
    "maxGrade": 9,
    "description": "Vector addition, scalar multiplication, proving collinearity and parallel lines.",
    "keywords": [
      "vectors",
      "column vectors",
      "vector proof",
      "collinear"
    ]
  },
  {
    "id": "m-prob-1",
    "subjectId": "maths",
    "unitName": "Probability",
    "topicName": "Probability Trees, Venn Diagrams & Conditional Probability",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Tree diagrams without replacement, Venn diagrams, conditional $P(A|B)$.",
    "keywords": [
      "probability",
      "tree diagram",
      "venn diagram",
      "conditional probability"
    ]
  },
  {
    "id": "m-stat-1",
    "subjectId": "maths",
    "unitName": "Statistics",
    "topicName": "Histograms, Cumulative Frequency & Box Plots",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Frequency density $= F/W$, cumulative frequency curves, IQR, box plots.",
    "keywords": [
      "statistics",
      "histogram",
      "cumulative frequency",
      "box plot",
      "iqr"
    ]
  },
  {
    "id": "p-eng-1",
    "subjectId": "physics",
    "unitName": "Energy",
    "topicName": "Energy Stores, Transfers & Efficiency",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Kinetic energy $E_k=\\frac{1}{2}mv^2$, gravitational $E_p=mgh$, work done, efficiency.",
    "keywords": [
      "energy",
      "kinetic energy",
      "gravitational potential",
      "work done",
      "efficiency"
    ]
  },
  {
    "id": "p-eng-2",
    "subjectId": "physics",
    "unitName": "Energy",
    "topicName": "Specific Heat Capacity & Specific Latent Heat",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Thermal energy $\\Delta E = m c \\Delta T$, latent heat $E = m L$, heating curves.",
    "keywords": [
      "specific heat capacity",
      "latent heat",
      "thermal energy",
      "heating curve"
    ]
  },
  {
    "id": "p-elec-1",
    "subjectId": "physics",
    "unitName": "Electricity",
    "topicName": "Circuit Components, Series/Parallel & Ohm's Law",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Ohm\u2019s Law $V=IR$, series/parallel rules, IV characteristics (diode, filament bulb).",
    "keywords": [
      "electricity",
      "ohms law",
      "resistors",
      "series parallel"
    ]
  },
  {
    "id": "p-elec-2",
    "subjectId": "physics",
    "unitName": "Electricity",
    "topicName": "Mains Electricity, AC/DC & Electrical Power",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Live/neutral/earth wires, AC vs DC, electrical power $P=IV=I^2R$, energy $E=Pt$.",
    "keywords": [
      "mains electricity",
      "ac dc",
      "electrical power",
      "fuses"
    ]
  },
  {
    "id": "p-part-1",
    "subjectId": "physics",
    "unitName": "Particle Model",
    "topicName": "Particle Model, Density & Gas Pressure",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Density $\\rho=m/V$, state changes, gas pressure $pV=\\text{constant}$, internal energy.",
    "keywords": [
      "density",
      "particle model",
      "gas pressure",
      "boyles law"
    ]
  },
  {
    "id": "p-atom-1",
    "subjectId": "physics",
    "unitName": "Atomic Structure",
    "topicName": "Atomic Structure, Radioactive Decay & Half-life",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Alpha, beta, gamma radiation, half-life calculations, nuclear fission vs fusion.",
    "keywords": [
      "radioactivity",
      "alpha beta gamma",
      "half life",
      "nuclear fission"
    ]
  },
  {
    "id": "p-force-1",
    "subjectId": "physics",
    "unitName": "Forces",
    "topicName": "Resultant Forces, Newton's Laws & Vector Diagrams",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Newton's 1st, 2nd ($F=ma$) and 3rd laws, scalar vs vector, resolving forces.",
    "keywords": [
      "forces",
      "newtons laws",
      "resultant force",
      "scalars vectors"
    ]
  },
  {
    "id": "p-force-2",
    "subjectId": "physics",
    "unitName": "Forces",
    "topicName": "Velocity-Time Graphs, Stopping Distance & Momentum",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Acceleration $a=\\Delta v/t$, gradient/area on VT graphs, stopping distance, momentum $p=mv$.",
    "keywords": [
      "acceleration",
      "velocity time graph",
      "stopping distance",
      "momentum"
    ]
  },
  {
    "id": "p-wave-1",
    "subjectId": "physics",
    "unitName": "Waves",
    "topicName": "Wave Equation, Transverse/Longitudinal & Refraction",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Wave speed $v=f\\lambda$, transverse vs longitudinal, refraction wave front diagrams.",
    "keywords": [
      "waves",
      "wave equation",
      "refraction",
      "transverse longitudinal"
    ]
  },
  {
    "id": "p-wave-2",
    "subjectId": "physics",
    "unitName": "Waves",
    "topicName": "EM Spectrum, Lenses & Radiation",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "EM spectrum order, convex/concave ray diagrams, blackbody radiation.",
    "keywords": [
      "em spectrum",
      "gamma rays",
      "convex lens",
      "blackbody radiation"
    ]
  },
  {
    "id": "p-mag-1",
    "subjectId": "physics",
    "unitName": "Magnetism",
    "topicName": "Magnetism, Electromagnetism & Transformers",
    "tier": "Higher",
    "minGrade": 7,
    "maxGrade": 9,
    "description": "Fleming's left hand rule $F=BIL$, electric motors, transformers $V_p/V_s = N_p/N_s$.",
    "keywords": [
      "magnetism",
      "flemings left hand rule",
      "motor effect",
      "transformers"
    ]
  },
  {
    "id": "p-space-1",
    "subjectId": "physics",
    "unitName": "Space Physics",
    "topicName": "Space Physics, Solar System & Red Shift",
    "tier": "Higher",
    "minGrade": 7,
    "maxGrade": 9,
    "description": "Life cycle of stars, orbital motion, red-shift, expanding universe, Big Bang theory.",
    "keywords": [
      "space physics",
      "life cycle of stars",
      "red shift",
      "big bang"
    ]
  },
  {
    "id": "ch-atom-1",
    "subjectId": "chemistry",
    "unitName": "Atomic Structure",
    "topicName": "Atomic Structure, Isotopes & Relative Atomic Mass",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Protons, neutrons, electrons, isotopes, calculating relative atomic mass $A_r$.",
    "keywords": [
      "atomic structure",
      "isotopes",
      "relative atomic mass",
      "electrons"
    ]
  },
  {
    "id": "ch-atom-2",
    "subjectId": "chemistry",
    "unitName": "Periodic Table",
    "topicName": "Periodic Table Trends, Group 1 & Group 7",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Mendeleev, Group 1 alkali metals, Group 7 halogens displacement, Group 0 noble gases.",
    "keywords": [
      "periodic table",
      "alkali metals",
      "halogens",
      "noble gases"
    ]
  },
  {
    "id": "ch-bond-1",
    "subjectId": "chemistry",
    "unitName": "Bonding",
    "topicName": "Ionic, Covalent & Metallic Bonding, Nanoparticles",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Dot and cross diagrams, giant ionic lattices, simple molecules, giant covalent, alloys.",
    "keywords": [
      "ionic bonding",
      "covalent bonding",
      "metallic bonding",
      "nanoparticles"
    ]
  },
  {
    "id": "ch-quant-1",
    "subjectId": "chemistry",
    "unitName": "Quantitative Chemistry",
    "topicName": "Relative Formula Mass & Moles",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Calculating $M_r$, $\\text{Moles} = \\text{Mass}/M_r$, Avogadro constant $6.02 \\times 10^{23}$.",
    "keywords": [
      "moles",
      "relative formula mass",
      "avogadro",
      "stoichiometry"
    ]
  },
  {
    "id": "ch-quant-2",
    "subjectId": "chemistry",
    "unitName": "Quantitative Chemistry",
    "topicName": "Percentage Yield, Atom Economy & Gas Volumes",
    "tier": "Higher",
    "minGrade": 7,
    "maxGrade": 9,
    "description": "Percentage yield, atom economy, molar gas volume $24\\text{ dm}^3$, titration conc $\\text{mol/dm}^3$.",
    "keywords": [
      "percentage yield",
      "atom economy",
      "gas volume",
      "titrations"
    ]
  },
  {
    "id": "ch-react-1",
    "subjectId": "chemistry",
    "unitName": "Chemical Changes",
    "topicName": "Reactivity Series & Metal Extraction",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Displacement reactions, carbon reduction, oxidation (gain of oxygen / loss of electrons).",
    "keywords": [
      "reactivity series",
      "metal extraction",
      "displacement",
      "oxidation reduction"
    ]
  },
  {
    "id": "ch-react-2",
    "subjectId": "chemistry",
    "unitName": "Chemical Changes",
    "topicName": "Acids, Alkalis, Neutralisation & Titrations",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "pH scale, strong vs weak acids, neutralisation $\\text{H}^+ + \\text{OH}^- \\rightarrow \\text{H}_2\\text{O}$, making soluble salts.",
    "keywords": [
      "acids",
      "alkalis",
      "neutralisation",
      "titration",
      "ph scale"
    ]
  },
  {
    "id": "ch-react-3",
    "subjectId": "chemistry",
    "unitName": "Chemical Changes",
    "topicName": "Electrolysis of Molten & Aqueous Compounds",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Electrolysis of molten NaCl, aqueous $\\text{CuSO}_4$, aluminium extraction from bauxite.",
    "keywords": [
      "electrolysis",
      "cathode",
      "anode",
      "bauxite",
      "aluminium"
    ]
  },
  {
    "id": "ch-ener-1",
    "subjectId": "chemistry",
    "unitName": "Energy Changes",
    "topicName": "Exothermic & Endothermic Reactions & Bond Energy",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Reaction profiles, activation energy, calculating bond energy changes $\\Delta H$.",
    "keywords": [
      "exothermic",
      "endothermic",
      "reaction profile",
      "bond energy"
    ]
  },
  {
    "id": "ch-rate-1",
    "subjectId": "chemistry",
    "unitName": "Rates of Reaction",
    "topicName": "Rates of Reaction & Collision Theory",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Measuring reaction rates, collision theory, temperature, concentration, catalysts.",
    "keywords": [
      "rates of reaction",
      "collision theory",
      "catalyst",
      "surface area"
    ]
  },
  {
    "id": "ch-rate-2",
    "subjectId": "chemistry",
    "unitName": "Rates of Reaction",
    "topicName": "Dynamic Equilibrium & Le Chatelier's Principle",
    "tier": "Higher",
    "minGrade": 7,
    "maxGrade": 9,
    "description": "Reversible reactions, Haber process, Le Chatelier's principle (temp, pressure, conc).",
    "keywords": [
      "equilibrium",
      "le chatelier",
      "haber process",
      "reversible reaction"
    ]
  },
  {
    "id": "ch-org-1",
    "subjectId": "chemistry",
    "unitName": "Organic Chemistry",
    "topicName": "Crude Oil, Fractional Distillation & Alkanes",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Fractional distillation, alkanes $\\text{C}_n\\text{H}_{2n+2}$, combustion, catalytic cracking.",
    "keywords": [
      "crude oil",
      "fractional distillation",
      "alkanes",
      "cracking"
    ]
  },
  {
    "id": "bio-cell-1",
    "subjectId": "biology",
    "unitName": "Cell Biology",
    "topicName": "Cell Structure, Microscopy & Organelles",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Eukaryotes vs prokaryotes, plant/animal cells, light vs electron microscopes $I=AM$.",
    "keywords": [
      "cell structure",
      "microscopy",
      "organelles",
      "prokaryotes"
    ]
  },
  {
    "id": "bio-cell-2",
    "subjectId": "biology",
    "unitName": "Cell Biology",
    "topicName": "Mitosis, Cell Cycle & Stem Cells",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Mitosis stages, cell cycle, embryonic vs adult stem cells, therapeutic cloning.",
    "keywords": [
      "mitosis",
      "cell cycle",
      "stem cells",
      "cloning"
    ]
  },
  {
    "id": "bio-cell-3",
    "subjectId": "biology",
    "unitName": "Cell Biology",
    "topicName": "Transport in Cells: Diffusion, Osmosis & Active Transport",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Diffusion concentration gradient, osmosis in potato cylinders, active transport (ATP).",
    "keywords": [
      "diffusion",
      "osmosis",
      "active transport",
      "surface area"
    ]
  },
  {
    "id": "bio-org-1",
    "subjectId": "biology",
    "unitName": "Organisation",
    "topicName": "Digestive System, Enzymes & Food Tests",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Lock and key theory, enzyme denaturation, Benedict's, Iodine, Biuret, Sudan III tests.",
    "keywords": [
      "digestive system",
      "enzymes",
      "food tests",
      "bile"
    ]
  },
  {
    "id": "bio-org-2",
    "subjectId": "biology",
    "unitName": "Organisation",
    "topicName": "Heart, Blood Vessels & Circulation",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Double circulatory system, heart chambers, arteries/veins/capillaries, coronary heart disease.",
    "keywords": [
      "heart",
      "blood vessels",
      "circulation",
      "coronary artery"
    ]
  },
  {
    "id": "bio-org-3",
    "subjectId": "biology",
    "unitName": "Organisation",
    "topicName": "Plant Transport (Xylem/Phloem & Transpiration)",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Xylem water transport, phloem translocation, stomata, factors affecting transpiration rate.",
    "keywords": [
      "xylem",
      "phloem",
      "transpiration",
      "stomata"
    ]
  },
  {
    "id": "bio-inf-1",
    "subjectId": "biology",
    "unitName": "Infection",
    "topicName": "Pathogens, Monoclonal Antibodies & Vaccines",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Viruses, bacteria, fungi, protists (malaria), white blood cells, herd immunity, antibiotics.",
    "keywords": [
      "pathogens",
      "vaccines",
      "monoclonal antibodies",
      "antibiotics"
    ]
  },
  {
    "id": "bio-bioen-1",
    "subjectId": "biology",
    "unitName": "Bioenergetics",
    "topicName": "Photosynthesis & Limiting Factors",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Photosynthesis $6\\text{CO}_2+6\\text{H}_2\\text{O} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6+6\\text{O}_2$, inverse square law.",
    "keywords": [
      "photosynthesis",
      "limiting factors",
      "chlorophyll",
      "glucose"
    ]
  },
  {
    "id": "bio-bioen-2",
    "subjectId": "biology",
    "unitName": "Bioenergetics",
    "topicName": "Aerobic & Anaerobic Respiration",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Aerobic respiration, anaerobic lactic acid in muscles, fermentation in yeast, oxygen debt.",
    "keywords": [
      "aerobic respiration",
      "anaerobic respiration",
      "lactic acid",
      "fermentation"
    ]
  },
  {
    "id": "bio-homeo-1",
    "subjectId": "biology",
    "unitName": "Homeostasis",
    "topicName": "Nervous System & Reflex Arcs",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Central nervous system, sensory/relay/motor neurones, synapses, reflex arc path.",
    "keywords": [
      "nervous system",
      "reflex arc",
      "synapse",
      "neurone"
    ]
  },
  {
    "id": "bio-homeo-2",
    "subjectId": "biology",
    "unitName": "Homeostasis",
    "topicName": "Hormones, Blood Glucose & Diabetes",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Insulin and glucagon, Type 1 vs Type 2 diabetes, menstrual cycle hormones (FSH, LH, estrogen).",
    "keywords": [
      "hormones",
      "blood glucose",
      "insulin",
      "diabetes",
      "menstrual cycle"
    ]
  },
  {
    "id": "bio-gen-1",
    "subjectId": "biology",
    "unitName": "Genetics",
    "topicName": "DNA Structure, Inheritance & Punnett Squares",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "DNA double helix, genes, genome, homozygous/heterozygous, Punnett squares, polydactyly.",
    "keywords": [
      "dna",
      "punnett square",
      "homozygous",
      "allele",
      "genetics"
    ]
  },
  {
    "id": "cs-sys-1",
    "subjectId": "cs",
    "unitName": "Systems Architecture",
    "topicName": "CPU Architecture & FDE Cycle",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Registers (MAR, MDR, PC, ACC), ALU, CU, Fetch-Decode-Execute cycle.",
    "keywords": [
      "cpu",
      "von neumann",
      "fde cycle",
      "registers",
      "alu"
    ]
  },
  {
    "id": "cs-sys-2",
    "subjectId": "cs",
    "unitName": "Systems Architecture",
    "topicName": "RAM, ROM, Cache & Secondary Storage",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "RAM vs ROM, volatile memory, cache levels, optical vs magnetic vs solid state storage.",
    "keywords": [
      "ram",
      "rom",
      "cache",
      "secondary storage",
      "ssd"
    ]
  },
  {
    "id": "cs-net-1",
    "subjectId": "cs",
    "unitName": "Computer Networks",
    "topicName": "Network Topologies, Protocols & Layers",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Star and mesh topologies, TCP/IP layers, HTTP, HTTPS, FTP, SMTP, IP/MAC addresses.",
    "keywords": [
      "networks",
      "topologies",
      "protocols",
      "tcp ip",
      "https"
    ]
  },
  {
    "id": "cs-net-2",
    "subjectId": "cs",
    "unitName": "Computer Networks",
    "topicName": "Cybersecurity Threats & Prevention",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Phishing, SQL injection, malware, brute force, firewalls, encryption, pen testing.",
    "keywords": [
      "cybersecurity",
      "phishing",
      "malware",
      "sql injection",
      "encryption"
    ]
  },
  {
    "id": "cs-sys-3",
    "subjectId": "cs",
    "unitName": "Systems Software",
    "topicName": "Operating Systems & Utility Software",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "User interface, memory management, multitasking, defragmentation, backup software.",
    "keywords": [
      "operating system",
      "utility software",
      "defragmentation",
      "multitasking"
    ]
  },
  {
    "id": "cs-data-1",
    "subjectId": "cs",
    "unitName": "Data Representation",
    "topicName": "Binary, Hexadecimal & Data Representation",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "8-bit binary, hexadecimal conversion, two's complement, ASCII vs Unicode.",
    "keywords": [
      "binary",
      "hexadecimal",
      "twos complement",
      "ascii",
      "unicode"
    ]
  },
  {
    "id": "eng-lang-1",
    "subjectId": "english-lang",
    "unitName": "Non-Fiction Reading",
    "topicName": "Skimming, Scanning & Explicit vs Implicit Meaning",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Identifying explicit facts, inferring implicit meanings, summarising non-fiction extracts.",
    "keywords": [
      "reading",
      "explicit",
      "implicit",
      "inference",
      "summarising"
    ]
  },
  {
    "id": "eng-lang-2",
    "subjectId": "english-lang",
    "unitName": "Language Analysis",
    "topicName": "Analyzing Metaphors, Similes, Tone & Writer's Intent",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Analyzing word choice, figurative language, tone, connotation and reader impact.",
    "keywords": [
      "language analysis",
      "metaphor",
      "simile",
      "tone",
      "connotation"
    ]
  },
  {
    "id": "eng-lang-3",
    "subjectId": "english-lang",
    "unitName": "Textual Structure",
    "topicName": "Structural Devices, Pacing & Narrative Perspective",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Focus shifts, zoom in/out, narrative perspective, chronological order, volta.",
    "keywords": [
      "structure",
      "pacing",
      "narrative perspective",
      "focus shift",
      "volta"
    ]
  },
  {
    "id": "eng-lang-4",
    "subjectId": "english-lang",
    "unitName": "Evaluation & Comparison",
    "topicName": "Synthesising Information & Comparing Writers' Viewpoints",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Comparing perspectives across 19th and 21st century non-fiction texts.",
    "keywords": [
      "evaluation",
      "comparison",
      "synthesising",
      "viewpoints"
    ]
  },
  {
    "id": "eng-lang-5",
    "subjectId": "english-lang",
    "unitName": "Creative Writing",
    "topicName": "Descriptive & Narrative Writing (Sensory & Plot)",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Sensory imagery, drop-shift-zoom-end structure, ambitious vocabulary, punctuation.",
    "keywords": [
      "descriptive writing",
      "narrative",
      "sensory imagery",
      "creative writing"
    ]
  },
  {
    "id": "eng-lang-6",
    "subjectId": "english-lang",
    "unitName": "Transactional Writing",
    "topicName": "Discursive & Persuasive Writing (DAFORET Rhetoric)",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Speeches, articles, letters using Direct address, Anecdotes, Facts, Opinion, Rhetorical questions, Emotive language, Triples.",
    "keywords": [
      "persuasive writing",
      "transactional",
      "speeches",
      "articles",
      "daforet"
    ]
  },
  {
    "id": "bus-1",
    "subjectId": "business",
    "unitName": "Enterprise",
    "topicName": "Enterprise & Entrepreneurship (Risk, Reward & Added Value)",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Role of entrepreneur, calculating added value, financial vs non-financial rewards, risk management.",
    "keywords": [
      "enterprise",
      "entrepreneur",
      "added value",
      "risk reward"
    ]
  },
  {
    "id": "bus-2",
    "subjectId": "business",
    "unitName": "Market Research",
    "topicName": "Spotting a Business Opportunity (Market Segmentation)",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Primary vs secondary market research, quantitative vs qualitative data, market mapping.",
    "keywords": [
      "market research",
      "segmentation",
      "market map",
      "competitors"
    ]
  },
  {
    "id": "bus-3",
    "subjectId": "business",
    "unitName": "Business Planning",
    "topicName": "Break-Even Analysis, Revenue, Costs & Cash Flow",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Total costs = fixed + variable, revenue = price x quantity, break-even chart, cash flow forecast.",
    "keywords": [
      "break even",
      "cash flow",
      "revenue",
      "costs",
      "profit"
    ]
  },
  {
    "id": "bus-4",
    "subjectId": "business",
    "unitName": "Ownership",
    "topicName": "Business Ownership Structures (Sole Trader, LTD, PLC)",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Sole trader, partnership, Private Limited Company (LTD), Public Limited Company (PLC), liability.",
    "keywords": [
      "sole trader",
      "ltd",
      "plc",
      "limited liability",
      "franchise"
    ]
  },
  {
    "id": "bus-5",
    "subjectId": "business",
    "unitName": "External Influences",
    "topicName": "Economic Climate, Inflation, Interest Rates & Exchange Rates",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Impact of interest rates on borrowing/saving, exchange rates (SPICED), inflation, consumer spending.",
    "keywords": [
      "economic climate",
      "interest rates",
      "exchange rates",
      "inflation",
      "spiced"
    ]
  },
  {
    "id": "bus-6",
    "subjectId": "business",
    "unitName": "Business Growth",
    "topicName": "Growing the Business (Organic vs Inorganic & E-Commerce)",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Organic internal growth, mergers & acquisitions, e-commerce digital footprint, globalisation.",
    "keywords": [
      "organic growth",
      "mergers",
      "e-commerce",
      "globalisation"
    ]
  },
  {
    "id": "bus-7",
    "subjectId": "business",
    "unitName": "Marketing & Operations",
    "topicName": "Product Life Cycle, Pricing Strategies & Operational Quality",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "4 Ps (Product, Price, Place, Promotion), penetration pricing, skimming, JIT vs JIC stock control.",
    "keywords": [
      "marketing mix",
      "4 ps",
      "pricing strategies",
      "just in time",
      "jit"
    ]
  },
  {
    "id": "bus-8",
    "subjectId": "business",
    "unitName": "Finance & HR",
    "topicName": "Financial Statements, Income Statement & Employee Motivation",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Gross profit, net profit, balance sheet assets/liabilities, recruitment, Maslow/Taylor motivation.",
    "keywords": [
      "income statement",
      "gross profit",
      "net profit",
      "motivation",
      "recruitment"
    ]
  },
  {
    "id": "econ-1",
    "subjectId": "economics",
    "unitName": "Microeconomics",
    "topicName": "The Basic Economic Problem (Scarcity & Opportunity Cost)",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Finite resources vs infinite wants, factors of production (Land, Labour, Capital, Enterprise), PPC.",
    "keywords": [
      "scarcity",
      "opportunity cost",
      "factors of production",
      "ppc"
    ]
  },
  {
    "id": "econ-2",
    "subjectId": "economics",
    "unitName": "Microeconomics",
    "topicName": "How Markets Work: Demand, Supply & Equilibrium Price",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Demand curve, supply curve, market equilibrium price determination, excess supply/demand.",
    "keywords": [
      "demand",
      "supply",
      "equilibrium price",
      "market mechanism"
    ]
  },
  {
    "id": "econ-3",
    "subjectId": "economics",
    "unitName": "Microeconomics",
    "topicName": "Price Elasticity of Demand (PED) & Revenue Impact",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Calculating $\\text{PED} = \\%\\Delta Q_d / \\%\\Delta P$, elastic vs inelastic demand, total revenue.",
    "keywords": [
      "ped",
      "price elasticity",
      "elastic",
      "inelastic",
      "total revenue"
    ]
  },
  {
    "id": "econ-4",
    "subjectId": "economics",
    "unitName": "Microeconomics",
    "topicName": "Market Failure, Externalities & Government Intervention",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Negative externalities of production/consumption, public goods, indirect taxes, subsidies.",
    "keywords": [
      "market failure",
      "externalities",
      "taxes",
      "subsidies",
      "public goods"
    ]
  },
  {
    "id": "econ-5",
    "subjectId": "economics",
    "unitName": "Microeconomics",
    "topicName": "Costs, Revenues, Profits & Economies of Scale",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Total/Average cost, total revenue, profit $= TR - TC$, internal/external economies of scale.",
    "keywords": [
      "economies of scale",
      "total cost",
      "average cost",
      "profit maximisation"
    ]
  },
  {
    "id": "econ-6",
    "subjectId": "economics",
    "unitName": "Macroeconomics",
    "topicName": "Macroeconomic Objectives (GDP Growth, Inflation & Employment)",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Real GDP growth, Consumer Price Index (CPI) inflation, unemployment types, balance of payments.",
    "keywords": [
      "gdp",
      "inflation",
      "cpi",
      "unemployment",
      "macroeconomics"
    ]
  },
  {
    "id": "econ-7",
    "subjectId": "economics",
    "unitName": "Macroeconomics",
    "topicName": "Government Macroeconomic Policies (Fiscal & Monetary)",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Fiscal policy (taxing & government spending), Monetary policy (interest rates), Supply-side policies.",
    "keywords": [
      "fiscal policy",
      "monetary policy",
      "interest rates",
      "taxation",
      "supply side"
    ]
  },
  {
    "id": "econ-8",
    "subjectId": "economics",
    "unitName": "Macroeconomics",
    "topicName": "International Economics, Protectionism & Exchange Rates",
    "tier": "Both",
    "minGrade": 5,
    "maxGrade": 9,
    "description": "Free trade benefits, tariffs, quotas, exchange rate appreciation/depreciation effects on exports.",
    "keywords": [
      "international trade",
      "protectionism",
      "tariffs",
      "exchange rates",
      "exports"
    ]
  },
  {
    "id": "eng-lit-1",
    "subjectId": "english-lit",
    "unitName": "Shakespearean Drama",
    "topicName": "Macbeth: Ambition, Guilt & Supernatural",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Lady Macbeth, dramatic irony, blood motif, Jacobean context, Divine Right of Kings.",
    "keywords": [
      "macbeth",
      "lady macbeth",
      "ambition",
      "guilt",
      "witches"
    ]
  },
  {
    "id": "eng-lit-2",
    "subjectId": "english-lit",
    "unitName": "Shakespearean Drama",
    "topicName": "Romeo & Juliet: Love, Conflict & Fate",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Feud, violent passion, fate vs free will, patriarchal structures in Verona.",
    "keywords": [
      "romeo and juliet",
      "shakespeare",
      "conflict",
      "fate",
      "tybalt"
    ]
  },
  {
    "id": "eng-lit-3",
    "subjectId": "english-lit",
    "unitName": "19th-Century Novel",
    "topicName": "A Christmas Carol / Jekyll & Hyde: Social Inequality & Redemption",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Scrooge's transformation, Victorian poverty, Malthusian economic views / Duality of man.",
    "keywords": [
      "christmas carol",
      "scrooge",
      "jekyll and hyde",
      "duality",
      "victorian"
    ]
  },
  {
    "id": "eng-lit-4",
    "subjectId": "english-lit",
    "unitName": "Modern Drama",
    "topicName": "An Inspector Calls: Social Responsibility & Class System",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Priestley\u2019s socialist message, Birling family dynamics, dramatic irony of 1912 vs 1945.",
    "keywords": [
      "an inspector calls",
      "priestley",
      "birling",
      "socialism",
      "responsibility"
    ]
  },
  {
    "id": "eng-lit-5",
    "subjectId": "english-lit",
    "unitName": "Poetry Anthology",
    "topicName": "Power & Conflict Poetry: Ozymandias, Bayonet Charge & Exposure",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Comparing poetic devices, power of nature vs power of man, war trauma imagery.",
    "keywords": [
      "ozymandias",
      "bayonet charge",
      "exposure",
      "poetry",
      "power conflict"
    ]
  },
  {
    "id": "geo-1",
    "subjectId": "geography",
    "unitName": "Physical Environment",
    "topicName": "Plate Tectonics, Earthquakes & Volcanic Hazards",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Constructive, destructive, conservative plate margins, subduction, earthquake management.",
    "keywords": [
      "plate tectonics",
      "earthquakes",
      "volcanoes",
      "subduction"
    ]
  },
  {
    "id": "geo-2",
    "subjectId": "geography",
    "unitName": "Physical Environment",
    "topicName": "Weather Hazards, Tropical Storms & Climate Change",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Global atmospheric circulation, hurricane formation, climate change evidence and mitigation.",
    "keywords": [
      "tropical storms",
      "hurricanes",
      "climate change",
      "weather hazards"
    ]
  },
  {
    "id": "geo-3",
    "subjectId": "geography",
    "unitName": "Physical Landscapes",
    "topicName": "Coastal Landscapes, Erosion & Management",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Wave types, hydraulic action, abrasion, arches, stacks, sea walls, groynes, managed retreat.",
    "keywords": [
      "coasts",
      "erosion",
      "sea wall",
      "stack",
      "spit"
    ]
  },
  {
    "id": "geo-4",
    "subjectId": "geography",
    "unitName": "Physical Landscapes",
    "topicName": "River Processes, Landforms & Flood Management",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "V-shaped valleys, meanders, oxbow lakes, embankments, afforestation, hydrographs.",
    "keywords": [
      "rivers",
      "oxbow lake",
      "meander",
      "levees",
      "flooding"
    ]
  },
  {
    "id": "geo-5",
    "subjectId": "geography",
    "unitName": "Human Environment",
    "topicName": "Urban Issues, Megacities & Sustainable Cities",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Urbanisation in LICs/NEEs, Rio de Janeiro favelas, Freiburg sustainable urban living.",
    "keywords": [
      "urbanisation",
      "megacities",
      "favelas",
      "freiburg",
      "sustainability"
    ]
  },
  {
    "id": "hist-1",
    "subjectId": "history",
    "unitName": "Period Study (Germany)",
    "topicName": "Germany 1890\u20131945: Weimar Republic & Rise of Hitler",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Kaiser Wilhelm II, Treaty of Versailles, 1923 Hyperinflation, Wall Street Crash 1929, Hitler becoming Chancellor.",
    "keywords": [
      "germany",
      "weimar",
      "hitler",
      "versailles",
      "hyperinflation"
    ]
  },
  {
    "id": "hist-2",
    "subjectId": "history",
    "unitName": "Period Study (Germany)",
    "topicName": "Nazi Dictatorship 1933\u20131945: Terror, Control & Life in Nazi Germany",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Enabling Act 1933, Gestapo, SS, Goebbels propaganda, Hitler Youth, Nuremberg Laws, Kristallnacht.",
    "keywords": [
      "nazi germany",
      "enabling act",
      "gestapo",
      "propaganda",
      "hitler youth",
      "kristallnacht"
    ]
  },
  {
    "id": "hist-3",
    "subjectId": "history",
    "unitName": "Period Study (Russia)",
    "topicName": "Russia 1894\u20131945: Tsardom, Bolshevik Revolution & Stalinism",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Tsar Nicholas II, 1905 Revolution, Lenin, Bolshevik October 1917 Revolution, Stalin's Purges & Five-Year Plans.",
    "keywords": [
      "russia",
      "tsar",
      "lenin",
      "bolshevik",
      "stalin",
      "five year plans"
    ]
  },
  {
    "id": "hist-4",
    "subjectId": "history",
    "unitName": "Period Study (USA)",
    "topicName": "America 1920\u20131973: Opportunity, Great Depression & Civil Rights",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Roaring Twenties, Prohibition, Wall Street Crash 1929, New Deal, Martin Luther King & Civil Rights Movement.",
    "keywords": [
      "america",
      "prohibition",
      "new deal",
      "civil rights",
      "martin luther king"
    ]
  },
  {
    "id": "hist-5",
    "subjectId": "history",
    "unitName": "Conflict & Tension (WW1)",
    "topicName": "Conflict & Tension 1894\u20131918: First World War & Alliance Systems",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Triple Entente vs Triple Alliance, Assassination of Franz Ferdinand, Trench Warfare, Battle of Somme, Armistice 1918.",
    "keywords": [
      "ww1",
      "franz ferdinand",
      "somme",
      "trench warfare",
      "armistice"
    ]
  },
  {
    "id": "hist-6",
    "subjectId": "history",
    "unitName": "Conflict & Tension (Inter-war)",
    "topicName": "Conflict & Tension 1918\u20131939: League of Nations & Origins of WW2",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "League of Nations failures (Abyssinia & Manchuria), Hitler's foreign policy, Remilitarisation of Rhineland, Appeasement & Munich 1938.",
    "keywords": [
      "league of nations",
      "appeasement",
      "munich crisis",
      "rhineland",
      "origins of ww2"
    ]
  },
  {
    "id": "hist-7",
    "subjectId": "history",
    "unitName": "Conflict & Tension (Cold War)",
    "topicName": "The Cold War 1945\u20131972: Berlin Wall & Cuban Missile Crisis",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Yalta/Potsdam, Truman Doctrine, Berlin Blockade 1948, Berlin Wall 1961, Cuban Missile Crisis 1962, Vietnam War.",
    "keywords": [
      "cold war",
      "cuban missile crisis",
      "berlin wall",
      "truman doctrine",
      "vietnam"
    ]
  },
  {
    "id": "hist-8",
    "subjectId": "history",
    "unitName": "British Depth Study (Norman)",
    "topicName": "Norman England c1066\u20131100: Conquest, Feudalism & Domesday Book",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Battle of Hastings 1066, Harrying of the North, Feudal System, Motte and Bailey Castles, Domesday Book 1086.",
    "keywords": [
      "norman england",
      "william conqueror",
      "hastings",
      "feudalism",
      "domesday"
    ]
  },
  {
    "id": "hist-9",
    "subjectId": "history",
    "unitName": "British Depth Study (Elizabethan)",
    "topicName": "Elizabethan England c1568\u20131603: Religious Settlement & Spanish Armada",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Queen Elizabeth I, Religious Settlement 1559, Catholic plots, Mary Queen of Scots execution 1587, Spanish Armada 1588.",
    "keywords": [
      "elizabethan",
      "spanish armada",
      "mary queen of scots",
      "religious settlement"
    ]
  },
  {
    "id": "hist-10",
    "subjectId": "history",
    "unitName": "Thematic Study (Medicine)",
    "topicName": "Health & the People c1000\u2013Present: Medicine, Surgery & Public Health",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Medieval Black Death, Vesalius, Harvey, Jenner vaccination, Pasteur Germ Theory, Fleming Penicillin, NHS 1948.",
    "keywords": [
      "medicine",
      "health and people",
      "pasteur",
      "jenner",
      "penicillin",
      "nhs"
    ]
  },
  {
    "id": "hist-11",
    "subjectId": "history",
    "unitName": "Thematic Study (Power)",
    "topicName": "Power & the People c1170\u2013Present: Magna Carta, Civil War & Suffragettes",
    "tier": "Both",
    "minGrade": 4,
    "maxGrade": 9,
    "description": "Magna Carta 1215, Simon de Montfort, English Civil War & Oliver Cromwell, Chartists, Women's Suffrage Movement.",
    "keywords": [
      "power and people",
      "magna carta",
      "civil war",
      "chartists",
      "suffragettes"
    ]
  }
];



import seedQuestionsData from './gcse-seed-questions.json';

export const INITIAL_SEED_QUESTIONS: SeedQuestion[] = seedQuestionsData as unknown as SeedQuestion[];

export function shuffleQuestionOptions(q: SeedQuestion): SeedQuestion {
  if (!q.options || q.options.length === 0) return q;

  let opts = [...q.options];
  const hasExactAnswer = opts.some(o => o === q.correctAnswer);
  if (!hasExactAnswer) {
    opts[0] = q.correctAnswer;
  }

  const uniqueOpts: string[] = [];
  opts.forEach(opt => {
    if (!uniqueOpts.includes(opt)) {
      uniqueOpts.push(opt);
    }
  });

  const shuffled = [...uniqueOpts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return {
    ...q,
    options: shuffled,
    correctAnswer: q.correctAnswer,
  };
}

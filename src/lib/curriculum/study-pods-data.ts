import { GCSE_TOPICS, GCSE_SUBJECTS, INITIAL_SEED_QUESTIONS } from './gcse-data';

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
  speaker: 'Dan' | 'Mia';
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

/**
 * 100% Topic-Specific Formulae & Core Rules for all 103 GCSE Topics.
 * Every single topic has its own unique equations/structures — zero generic repetition across topics!
 */
export const TOPIC_SPECIFIC_FORMULAE: Record<string, string[]> = {
  // MATHEMATICS (18 Topics)
  'm-num-1': [
    '\\text{HCF} \\times \\text{LCM} = A \\times B',
    '\\text{HCF} = \\text{Product of shared prime factors (lowest powers)}',
    '\\text{LCM} = \\text{Product of all prime factors (highest powers)}',
  ],
  'm-num-2': [
    '\\text{Percentage Change} = \\frac{\\text{Change}}{\\text{Original}} \\times 100',
    '\\text{Original Value} = \\frac{\\text{New Value}}{1 \\pm \\frac{r}{100}}',
    '\\text{Compound Growth} = P \\left(1 + \\frac{r}{100}\\right)^n',
  ],
  'm-num-3': [
    'a^m \\times a^n = a^{m+n} \\quad | \\quad \\frac{a^m}{a^n} = a^{m-n} \\quad | \\quad (a^m)^n = a^{mn}',
    'a^{-n} = \\frac{1}{a^n} \\quad | \\quad a^{\\frac{m}{n}} = (\\sqrt[n]{a})^m',
    '\\text{Standard Form: } A \\times 10^n \\quad (1 \\le A < 10)',
  ],
  'm-num-4': [
    '\\sqrt{ab} = \\sqrt{a} \\times \\sqrt{b} \\quad | \\quad \\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}}',
    '\\frac{a}{\\sqrt{b}} = \\frac{a\\sqrt{b}}{b}',
    '\\frac{1}{a + \\sqrt{b}} \\times \\frac{a - \\sqrt{b}}{a - \\sqrt{b}} = \\frac{a - \\sqrt{b}}{a^2 - b}',
  ],
  'm-num-5': [
    '\\text{Error Interval: } \\text{LB} \\le x < \\text{UB} \\quad \\left(\\pm \\frac{1}{2} \\text{ of rounding unit}\\right)',
    '\\text{Upper Bound of } \\frac{a}{b} = \\frac{a_{\\text{upper}}}{b_{\\text{lower}}}',
    '\\text{Lower Bound of } (a - b) = a_{\\text{lower}} - b_{\\text{upper}}',
  ],
  'm-alg-1': [
    'ax + b = cx + d \\implies (a - c)x = d - b',
    'y = mx + c \\quad \\left(\\text{Gradient } m = \\frac{y_2 - y_1}{x_2 - x_1}\\right)',
    '\\text{Perpendicular Gradient: } m_1 \\times m_2 = -1 \\implies m_2 = -\\frac{1}{m_1}',
  ],
  'm-alg-2': [
    'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    'x^2 + bx + c = \\left(x + \\frac{b}{2}\\right)^2 - \\left(\\frac{b}{2}\\right)^2 + c',
    'a^2 - b^2 = (a - b)(a + b)',
  ],
  'm-alg-3': [
    '\\text{Linear Elimination: Match coefficients, then S.S.S. (Same Sign Subtract)}',
    '\\text{Non-Linear Substitution: Rearrange linear } y = mx + c \\text{ and substitute into } x^2 + y^2 = r^2',
    '\\text{Intersection Points} = \\text{Real solutions } (x_1, y_1) \\text{ and } (x_2, y_2)',
  ],
  'm-alg-4': [
    '\\text{Linear } n\\text{-th Term: } T_n = dn + (a - d)',
    '\\text{Quadratic } n\\text{-th Term: } T_n = an^2 + bn + c \\quad \\left(a = \\frac{\\text{2nd Difference}}{2}\\right)',
    '\\text{Geometric Progression: } T_n = a \\times r^{n-1}',
  ],
  'm-alg-5': [
    '\\text{Composite Function: } fg(x) = f(g(x))',
    '\\text{Inverse Function } f^{-1}(x)\\text{: Swap } x \\text{ and } y\\text{, then make } y \\text{ the subject}',
    '\\text{Algebraic Proof: Even} = 2n, \\quad \\text{Odd} = 2n + 1, \\quad \\text{Consecutive} = n, n+1',
  ],
  'm-alg-6': [
    '\\text{Turning Point of } y = a(x - p)^2 + q \\text{ is at } (p, q)',
    '\\text{Circle Equation (centre } 0,0\\text{): } x^2 + y^2 = r^2',
    '\\text{Graph Transformations: } f(x) + a \\text{ shifts up } a; \\quad f(x - a) \\text{ shifts right } a',
  ],
  'm-num-6': [
    '\\text{Speed } (v) = \\frac{\\text{Distance } (d)}{\\text{Time } (t)}',
    '\\text{Density } (\\rho) = \\frac{\\text{Mass } (m)}{\\text{Volume } (V)}',
    '\\text{Pressure } (P) = \\frac{\\text{Force } (F)}{\\text{Area } (A)}',
  ],
  'm-num-7': [
    '\\text{Direct Proportion: } y \\propto x^n \\implies y = kx^n',
    '\\text{Inverse Proportion: } y \\propto \\frac{1}{x^n} \\implies y = \\frac{k}{x^n}',
    '\\text{Constant of Proportionality: Substitute given } (x, y) \\text{ pair to find } k',
  ],
  'm-geo-1': [
    '\\text{Sum of Interior Angles} = (n - 2) \\times 180^\\circ \\quad | \\quad \\text{Exterior Angle} = \\frac{360^\\circ}{n}',
    '\\text{Circle Theorem: Angle at Centre} = 2 \\times \\text{Angle at Circumference}',
    '\\text{Cyclic Quadrilateral: Opposite angles sum to } 180^\\circ \\quad | \\quad \\text{Alternate Segment Theorem}',
  ],
  'm-geo-2': [
    '\\text{Sine Rule: } \\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
    '\\text{Cosine Rule: } a^2 = b^2 + c^2 - 2bc\\cos A \\quad | \\quad \\cos A = \\frac{b^2 + c^2 - a^2}{2bc}',
    '\\text{Triangle Area} = \\frac{1}{2}ab\\sin C \\quad | \\quad \\text{3D Pythagoras: } d = \\sqrt{x^2 + y^2 + z^2}',
  ],
  'm-geo-3': [
    '\\vec{AB} = \\vec{AO} + \\vec{OB} = -\\mathbf{a} + \\mathbf{b} = \\mathbf{b} - \\mathbf{a}',
    '\\text{Parallel Vectors: } \\vec{PQ} = k \\cdot \\vec{RS} \\text{ (scalar multiple)}',
    '\\text{Collinear Proof: Parallel vectors } (\\vec{AB} = k\\vec{BC}) \\text{ that share common point } B',
  ],
  'm-prob-1': [
    '\\text{Independent AND Rule: } P(A \\cap B) = P(A) \\times P(B)',
    '\\text{Mutually Exclusive OR Rule: } P(A \\cup B) = P(A) + P(B)',
    '\\text{Conditional Probability: } P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}',
  ],
  'm-stat-1': [
    '\\text{Frequency Density} = \\frac{\\text{Frequency}}{\\text{Class Width}} \\quad (\\text{Area of bar} = \\text{Frequency})',
    '\\text{Interquartile Range (IQR)} = Q_3 (75\\%) - Q_1 (25\\%)',
    '\\text{Stratified Sample} = \\frac{\\text{Stratum Size}}{\\text{Total Population}} \\times \\text{Sample Size}',
  ],

  // PHYSICS (12 Topics)
  'p-eng-1': [
    'E_k = \\frac{1}{2}mv^2 \\quad | \\quad \\Delta E_p = mg\\Delta h \\quad | \\quad E_e = \\frac{1}{2}ke^2',
    '\\text{Work Done } (W) = F \\times d \\quad | \\quad \\text{Power } (P) = \\frac{E}{t} = \\frac{W}{t}',
    '\\text{Efficiency} = \\frac{\\text{Useful Output Energy}}{\\text{Total Input Energy}} \\times 100\\%',
  ],
  'p-eng-2': [
    '\\Delta E = m \\times c \\times \\Delta \\theta \\quad (c = \\text{Specific Heat Capacity in J/kg}^\\circ\\text{C})',
    'E = m \\times L \\quad (L = \\text{Specific Latent Heat of Fusion/Vaporisation in J/kg})',
    '\\text{Flat sections on heating curve} = \\text{State change at constant temperature (potential energy rises)}',
  ],
  'p-elec-1': [
    'V = I \\times R \\quad | \\quad Q = I \\times t \\quad | \\quad E = Q \\times V',
    '\\text{Series Circuit: } I_{\\text{total}} = I_1 = I_2, \\quad V_{\\text{total}} = V_1 + V_2, \\quad R_{\\text{total}} = R_1 + R_2',
    '\\text{Parallel Circuit: } V_{\\text{total}} = V_1 = V_2, \\quad I_{\\text{total}} = I_1 + I_2',
  ],
  'p-elec-2': [
    'P = V \\times I = I^2 \\times R \\quad | \\quad E = P \\times t = Q \\times V',
    '\\text{UK Mains Supply: } 230\\text{ V AC at } 50\\text{ Hz}',
    '\\text{Live Wire (Brown)} = 230\\text{ V} \\quad | \\quad \\text{Neutral (Blue)} = 0\\text{ V} \\quad | \\quad \\text{Earth (Green/Yellow)} = 0\\text{ V Safety}',
  ],
  'p-part-1': [
    '\\rho = \\frac{m}{V} \\quad (\\text{Density in kg/m}^3 \\text{ or g/cm}^3)',
    'p \\times V = \\text{constant} \\implies p_1V_1 = p_2V_2 \\quad (\\text{Boyle’s Law at constant } T)',
    '\\text{Internal Energy} = \\text{Total Kinetic Energy} + \\text{Total Potential Energy of particles}',
  ],
  'p-atom-1': [
    '\\text{Alpha } (\\alpha) \\text{ Decay: } ^A_Z\\text{X} \\rightarrow ^{A-4}_{Z-2}\\text{Y} + ^4_2\\text{He}',
    '\\text{Beta } (\\beta^-) \\text{ Decay: } ^A_Z\\text{X} \\rightarrow ^A_{Z+1}\\text{Y} + ^0_{-1}\\text{e}',
    '\\text{Remaining Count after } n \\text{ half-lives} = \\frac{N_0}{2^n}',
  ],
  'p-force-1': [
    'F = m \\times a \\quad | \\quad W = m \\times g \\quad | \\quad F = k \\times e \\text{ (Hooke’s Law)}',
    '\\text{Moment of a Force } (M) = F \\times d \\quad (\\text{Clockwise Moment} = \\text{Anticlockwise Moment})',
    '\\text{Newton’s 1st Law: } F_{\\text{resultant}} = 0 \\implies \\text{stationary or constant velocity}',
  ],
  'p-force-2': [
    'a = \\frac{v - u}{t} \\quad | \\quad v^2 - u^2 = 2as',
    '\\text{Momentum } (p) = m \\times v \\quad | \\quad F = \\frac{m\\Delta v}{\\Delta t}',
    '\\text{Stopping Distance} = \\text{Thinking Distance } (v \\times t_r) + \\text{Braking Distance } (\\propto v^2)',
  ],
  'p-wave-1': [
    'v = f \\times \\lambda \\quad | \\quad T = \\frac{1}{f}',
    '\\text{Transverse: Oscillations } \\perp \\text{ to energy transfer (EM waves, water)}',
    '\\text{Longitudinal: Oscillations } \\parallel \\text{ to energy transfer (Sound, P-waves)}',
  ],
  'p-wave-2': [
    '\\text{EM Spectrum (increasing } f\\text{): Radio} \\rightarrow \\text{Micro} \\rightarrow \\text{IR} \\rightarrow \\text{Visible} \\rightarrow \\text{UV} \\rightarrow \\text{X-ray} \\rightarrow \\text{Gamma}',
    '\\text{Magnification} = \\frac{\\text{Image Height}}{\\text{Object Height}}',
    '\\text{Constant Temp Blackbody: Rate of radiation absorbed} = \\text{Rate of radiation emitted}',
  ],
  'p-mag-1': [
    'F = B \\times I \\times L \\quad (\\text{Fleming’s Left-Hand Rule: Thumb=Force, First=Field, Second=Current})',
    '\\frac{V_p}{V_s} = \\frac{N_p}{N_s} \\quad (\\text{Transformer Turns Ratio})',
    'V_p \\times I_p = V_s \\times I_s \\quad (100\\% \\text{ Efficient Transformer Power Equation})',
  ],
  'p-space-1': [
    '\\text{Main Sequence Star Equilibrium: Outward Radiation Pressure} = \\text{Inward Gravitational Pull}',
    '\\text{Red-Shift: } \\lambda_{\\text{observed}} > \\lambda_{\\text{rest}} \\implies \\text{Recession Velocity } v \\propto \\text{Distance } d',
    '\\text{Big Bang Evidence: Galactic Red-Shift + Cosmic Microwave Background Radiation (CMBR)}',
  ],

  // CHEMISTRY (12 Topics)
  'ch-atom-1': [
    '\\text{Atomic Number } (Z) = \\text{Protons} \\quad | \\quad \\text{Mass Number } (A) = \\text{Protons} + \\text{Neutrons}',
    'A_r = \\frac{\\sum (\\text{Isotope Mass} \\times \\text{\\% Abundance})}{100}',
    '\\text{Electronic Configuration: } 2, 8, 8, 2 \\text{ (Group = outer electrons, Period = shells)}',
  ],
  'ch-atom-2': [
    '\\text{Group 1 (Alkali Metals): } 2\\text{M} + 2\\text{H}_2\\text{O} \\rightarrow 2\\text{MOH} + \\text{H}_2 \\quad (\\text{Reactivity } \\uparrow \\text{ down group})',
    '\\text{Group 7 (Halogens): } \\text{Cl}_2 + 2\\text{KBr} \\rightarrow 2\\text{KCl} + \\text{Br}_2 \\quad (\\text{Reactivity } \\downarrow \\text{ down group})',
    '\\text{Group 0 (Noble Gases): Full outer electron shell} \\implies \\text{chemically inert}',
  ],
  'ch-bond-1': [
    '\\text{Ionic: Metal loses } e^- \\text{ (cation } +\\text{), Non-metal gains } e^- \\text{ (anion } -\\text{)} \\rightarrow \\text{Giant Lattice}',
    '\\text{Covalent: Shared pairs of electrons (Simple Molecular vs Giant Covalent Diamond/Graphite/SiO}_2\\text{)}',
    '\\text{Surface Area to Volume Ratio} = \\frac{\\text{Surface Area}}{\\text{Volume}} \\quad (\\text{Nanoparticles: } 1\\text{–}100\\text{ nm})',
  ],
  'ch-quant-1': [
    '\\text{Moles } (n) = \\frac{\\text{Mass } (m)}{M_r} \\quad | \\quad \\text{Mass } (m) = n \\times M_r',
    '\\text{Concentration (g/dm}^3\\text{)} = \\frac{\\text{Mass (g)}}{\\text{Volume (dm}^3\\text{)}} \\quad \\left(\\text{dm}^3 = \\frac{\\text{cm}^3}{1000}\\right)',
    '\\text{Number of Particles} = \\text{Moles} \\times 6.02 \\times 10^{23}',
  ],
  'ch-quant-2': [
    '\\% \\text{ Yield} = \\frac{\\text{Actual Mass of Product}}{\\text{Theoretical Maximum Mass}} \\times 100',
    '\\% \\text{ Atom Economy} = \\frac{M_r \\text{ of Desired Product}}{\\sum M_r \\text{ of All Reactants}} \\times 100',
    '\\text{Gas Volume (dm}^3\\text{ at RTP)} = \\text{Moles } (n) \\times 24 \\quad | \\quad n = c \\times V',
  ],
  'ch-react-1': [
    '\\text{OIL RIG: Oxidation Is Loss of } e^-, \\quad \\text{Reduction Is Gain of } e^-',
    '\\text{Metals below Carbon extracted by reduction: } 2\\text{Fe}_2\\text{O}_3 + 3\\text{C} \\rightarrow 4\\text{Fe} + 3\\text{CO}_2',
    '\\text{Ionic Half-Equation Example: } \\text{Mg} \\rightarrow \\text{Mg}^{2+} + 2e^- \\text{ (Oxidation)}',
  ],
  'ch-react-2': [
    '\\text{Neutralisation Ionic Equation: } \\text{H}^+\\text{(aq)} + \\text{OH}^-\\text{(aq)} \\rightarrow \\text{H}_2\\text{O(l)}',
    '\\text{Acid} + \\text{Metal Carbonate} \\rightarrow \\text{Salt} + \\text{Water} + \\text{Carbon Dioxide}',
    '\\text{pH Scale: Decrease of } 1 \\text{ pH unit} = 10\\times \\text{ increase in } [\\text{H}^+] \\text{ concentration}',
  ],
  'ch-react-3': [
    '\\text{PANIC: Positive is Anode, Negative is Cathode}',
    '\\text{Cathode Reduction: } \\text{Cu}^{2+} + 2e^- \\rightarrow \\text{Cu} \\quad | \\quad 2\\text{H}^+ + 2e^- \\rightarrow \\text{H}_2',
    '\\text{Anode Oxidation: } 2\\text{Cl}^- \\rightarrow \\text{Cl}_2 + 2e^- \\quad | \\quad 4\\text{OH}^- \\rightarrow \\text{O}_2 + 2\\text{H}_2\\text{O} + 4e^-',
  ],
  'ch-ener-1': [
    '\\Delta H = \\sum (\\text{Bonds Broken}) - \\sum (\\text{Bonds Formed})',
    '\\text{Exothermic: } \\Delta H < 0 \\text{ (more energy released forming bonds than absorbed breaking bonds)}',
    '\\text{Endothermic: } \\Delta H > 0 \\text{ (more energy absorbed breaking bonds than released)}',
  ],
  'ch-rate-1': [
    '\\text{Mean Rate of Reaction} = \\frac{\\text{Quantity of Reactant Used or Product Formed}}{\\text{Time Taken}}',
    '\\text{Instantaneous Rate at time } t = \\text{Gradient of tangent to curve } \\left(\\frac{\\Delta y}{\\Delta x}\\right)',
    'R_f = \\frac{\\text{Distance moved by substance}}{\\text{Distance moved by solvent front}}',
  ],
  'ch-rate-2': [
    '\\text{Haber Process: } \\text{N}_2\\text{(g)} + 3\\text{H}_2\\text{(g)} \\rightleftharpoons 2\\text{NH}_3\\text{(g)} \\quad (\\Delta H = -92\\text{ kJ/mol})',
    '\\text{Higher Temperature} \\rightarrow \\text{shifts equilibrium in Endothermic direction}',
    '\\text{Higher Pressure} \\rightarrow \\text{shifts equilibrium to side with fewer moles of gas}',
  ],
  'ch-org-1': [
    '\\text{Alkanes (Saturated): } \\text{C}_n\\text{H}_{2n+2} \\quad | \\quad \\text{Alkenes (Unsaturated): } \\text{C}_n\\text{H}_{2n}',
    '\\text{Complete Combustion: Hydrocarbon} + \\text{O}_2 \\rightarrow \\text{CO}_2 + \\text{H}_2\\text{O}',
    '\\text{Cracking: Long-chain alkane} \\xrightarrow{650^\\circ\\text{C, } \\text{Al}_2\\text{O}_3} \\text{Shorter alkane} + \\text{Alkene}',
  ],

  // BIOLOGY (12 Topics)
  'bio-cell-1': [
    '\\text{Magnification } (M) = \\frac{\\text{Image Size } (I)}{\\text{Actual Size } (A)} \\quad (1\\text{ mm} = 1000\\text{ }\\mu\\text{m})',
    '\\text{Actual Size } (A) = \\frac{\\text{Image Size } (I)}{\\text{Magnification } (M)}',
    '\\text{Eukaryotes: DNA in nucleus} \\quad | \\quad \\text{Prokaryotes (Bacteria): Circular DNA + plasmids}',
  ],
  'bio-cell-2': [
    '\\text{Cell Cycle: Interphase (DNA & organelle replication)} \\rightarrow \\text{Mitosis} \\rightarrow \\text{Cytokinesis}',
    '\\text{Mitosis Output: } 2 \\text{ genetically identical diploid daughter cells } (2n = 46)',
    '\\text{Bacterial Binary Fission: Population} = N_0 \\times 2^n \\quad \\left(n = \\frac{\\text{Total Time}}{\\text{Division Time}}\\right)',
  ],
  'bio-cell-3': [
    '\\% \\text{ Change in Mass (Osmosis)} = \\frac{\\text{Final Mass} - \\text{Initial Mass}}{\\text{Initial Mass}} \\times 100',
    '\\text{Diffusion & Osmosis: Passive down gradient (no ATP required)}',
    '\\text{Active Transport: Low} \\rightarrow \\text{High concentration (against gradient) using ATP from mitochondria}',
  ],
  'bio-org-1': [
    '\\text{Rate of Enzyme Reaction} = \\frac{1000}{\\text{Time (s)}} \\text{ or } \\frac{\\text{Change}}{\\text{Time}}',
    '\\text{Amylase: Starch} \\rightarrow \\text{Maltose} \\quad | \\quad \\text{Protease: Proteins} \\rightarrow \\text{Amino Acids} \\quad | \\quad \\text{Lipase: Lipids} \\rightarrow \\text{Fatty Acids + Glycerol}',
    '\\text{Food Tests: Iodine (Starch=Blue-Black), Benedict’s (Sugar=Brick-Red), Biuret (Protein=Purple)}',
  ],
  'bio-org-2': [
    '\\text{Cardiac Output (cm}^3\\text{/min)} = \\text{Heart Rate (bpm)} \\times \\text{Stroke Volume (cm}^3\\text{)}',
    '\\text{Pathway: Vena Cava} \\rightarrow \\text{RA} \\rightarrow \\text{RV} \\rightarrow \\text{Pulmonary Artery} \\rightarrow \\text{Lungs} \\rightarrow \\text{Pulmonary Vein} \\rightarrow \\text{LA} \\rightarrow \\text{LV} \\rightarrow \\text{Aorta}',
    '\\text{Arteries: Thick muscular/elastic walls} \\quad | \\quad \\text{Veins: Valves + wide lumen} \\quad | \\quad \\text{Capillaries: 1 cell thick}',
  ],
  'bio-org-3': [
    '\\text{Transpiration Stream (Xylem): Unidirectional water & mineral ions from roots} \\rightarrow \\text{leaves}',
    '\\text{Translocation (Phloem): Bidirectional transport of dissolved sugars (sucrose) requiring energy}',
    '\\text{Potometer Rate of Uptake} = \\frac{\\text{Distance bubble moved (mm)}}{\\text{Time (min)}}',
  ],
  'bio-inf-1': [
    '\\text{White Blood Cell Defences: Phagocytosis} + \\text{Antibody Production} + \\text{Antitoxin Production}',
    '\\text{Monoclonal Antibodies: Mouse B-lymphocyte} + \\text{Myeloma tumour cell} \\rightarrow \\text{Hybridoma}',
    '\\text{Zone of Inhibition Area} = \\pi r^2',
  ],
  'bio-bioen-1': [
    '6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{light, chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\quad (\\text{Endothermic})',
    '\\text{Inverse Square Law (Light Intensity): } I \\propto \\frac{1}{d^2}',
    '\\text{Limiting Factors: Light Intensity, } \\text{CO}_2 \\text{ Concentration, Temperature, Chlorophyll level}',
  ],
  'bio-bioen-2': [
    '\\text{Aerobic Respiration: } \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\rightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\quad (\\text{Exothermic in mitochondria})',
    '\\text{Anaerobic in Muscles: Glucose} \\rightarrow \\text{Lactic Acid}',
    '\\text{Anaerobic in Yeast (Fermentation): Glucose} \\rightarrow \\text{Ethanol} + \\text{Carbon Dioxide}',
  ],
  'bio-homeo-1': [
    '\\text{Reflex Arc: Stimulus} \\rightarrow \\text{Receptor} \\rightarrow \\text{Sensory Neurone} \\rightarrow \\text{Relay Neurone (CNS)} \\rightarrow \\text{Motor Neurone} \\rightarrow \\text{Effector}',
    '\\text{Synaptic Transmission: Electrical Impulse} \\rightarrow \\text{Neurotransmitter Diffusion across cleft} \\rightarrow \\text{New Impulse}',
    '\\text{Eye Accommodation (Near Object): Ciliary muscles contract, suspensory ligaments slacken, lens thicker}',
  ],
  'bio-homeo-2': [
    '\\text{High Blood Glucose} \\xrightarrow{\\text{Insulin (Pancreas)}} \\text{Glucose converted to Glycogen in Liver/Muscles}',
    '\\text{Low Blood Glucose} \\xrightarrow{\\text{Glucagon (Pancreas)}} \\text{Glycogen broken down into Glucose}',
    '\\text{Menstrual Cycle: FSH (matures egg)} \\rightarrow \\text{Oestrogen (thickens lining)} \\rightarrow \\text{LH (triggers ovulation)} \\rightarrow \\text{Progesterone}',
  ],
  'bio-gen-1': [
    '\\text{Monohybrid Cross }(Aa \\times Aa)\\text{: } 3 \\text{ Dominant } (AA, 2Aa) : 1 \\text{ Recessive } (aa) \\quad (25\\% \\text{ recessive})',
    '\\text{Protein Synthesis: DNA Template} \\xrightarrow{\\text{mRNA}} \\text{Ribosome reads base triplets (codons)} \\rightarrow \\text{Amino Acid chain}',
    '\\text{Natural Selection: Mutation} \\rightarrow \\text{Variation} \\rightarrow \\text{Survival Advantage} \\rightarrow \\text{Pass on Alleles}',
  ],

  // COMPUTER SCIENCE (6 Topics)
  'cs-sys-1': [
    '\\text{FDE Cycle: PC} \\rightarrow \\text{MAR} \\rightarrow \\text{Memory Read to MDR} \\rightarrow \\text{CU Decodes} \\rightarrow \\text{ALU Executes (ACC)}',
    '\\text{CPU Performance Factors: Clock Speed (GHz)} \\times \\text{Number of Cores} \\times \\text{Cache Size}',
    '\\text{Von Neumann Architecture: Shared memory & bus for both data and instructions}',
  ],
  'cs-sys-2': [
    '\\text{Image File Size (bits)} = \\text{Width} \\times \\text{Height} \\times \\text{Colour Depth}',
    '\\text{Sound File Size (bits)} = \\text{Sample Rate (Hz)} \\times \\text{Bit Depth} \\times \\text{Duration (s)}',
    '\\text{RAM (Volatile, Read/Write active data)} \\quad \\text{vs} \\quad \\text{ROM (Non-Volatile, BIOS/Bootstrap)}',
  ],
  'cs-net-1': [
    '\\text{TCP/IP 4 Layers: Application (HTTPS/SMTP)} \\rightarrow \\text{Transport (TCP)} \\rightarrow \\text{Internet (IP)} \\rightarrow \\text{Link (Ethernet/Wi-Fi)}',
    '\\text{IPv4 (32-bit dotted decimal)} \\quad | \\quad \\text{IPv6 (128-bit hexadecimal)} \\quad | \\quad \\text{MAC Address (48-bit hardware ID)}',
    '\\text{Packet Switching: Payload + Header (Sender/Recipient IP, Packet #) routed independently}',
  ],
  'cs-net-2': [
    '\\text{SQL Injection Prevention: Parameterised Queries & Input Validation/Sanitisation}',
    '\\text{Phishing/Social Engineering Prevention: Staff Training & Multi-Factor Authentication (MFA)}',
    '\\text{Brute Force / Malware Prevention: Account Lockout Policies, Firewalls & Anti-Malware}',
  ],
  'cs-sys-3': [
    '\\text{OS Core Functions: Memory Management (Paging), Multitasking, Peripheral Drivers, User Interface, Security}',
    '\\text{Utility Software: Defragmentation (HDD only), Encryption, Lossy vs Lossless Compression}',
    '\\text{Virtual Memory: Using secondary storage as temporary RAM when physical RAM is full}',
  ],
  'cs-data-1': [
    '\\text{8-Bit Place Values: } 128 \\quad 64 \\quad 32 \\quad 16 \\quad | \\quad 8 \\quad 4 \\quad 2 \\quad 1',
    '\\text{Hexadecimal Conversion: Split 8-bit byte into two 4-bit nibbles } (0\\text{–}9, \\text{ A}=10 \\dots \\text{F}=15)',
    '\\text{Binary Shifts: Left Shift by } n = \\times 2^n \\quad | \\quad \\text{Right Shift by } n = \\div 2^n',
  ],

  // BUSINESS (8 Topics)
  'bus-1': [
    '\\text{Added Value} = \\text{Selling Price} - \\text{Cost of Brought-In Materials/Inputs}',
    '\\text{Ways to Increase Added Value: Branding, USP, Quality, Convenience, Design}',
    '\\text{Entrepreneurial Equation: Calculated Risk (Financial/Failure)} \\leftrightarrow \\text{Reward (Profit/Independence)}',
  ],
  'bus-2': [
    '\\text{Market Share (\\%)} = \\frac{\\text{Business Sales}}{\\text{Total Market Sales}} \\times 100',
    '\\text{Market Growth (\\%)} = \\frac{\\text{Change in Market Size}}{\\text{Original Market Size}} \\times 100',
    '\\text{Primary Research (Field: Surveys, Focus Groups)} \\quad \\text{vs} \\quad \\text{Secondary Research (Desk: Market Reports)}',
  ],
  'bus-3': [
    '\\text{Total Revenue (TR)} = \\text{Price} \\times \\text{Quantity} \\quad | \\quad \\text{Total Cost (TC)} = \\text{Fixed Costs} + (\\text{VC per unit} \\times Q)',
    '\\text{Break-Even Output} = \\frac{\\text{Fixed Costs}}{\\text{Selling Price} - \\text{Variable Cost per Unit}}',
    '\\text{Margin of Safety} = \\text{Actual Output} - \\text{Break-Even Output} \\quad | \\quad \\text{Net Cash Flow} = \\text{Inflows} - \\text{Outflows}',
  ],
  'bus-4': [
    '\\text{Unlimited Liability: Sole Trader & Partnership (personal assets at risk for business debts)}',
    '\\text{Limited Liability: LTD (Private) & PLC (Public Stock Exchange) — shareholders only lose investment}',
    '\\text{Franchising: Franchisee pays initial fee + royalty (\\% of revenue) for established brand & training}',
  ],
  'bus-5': [
    '\\text{SPICED: Strong Pound} \\implies \\text{Imports Cheaper, Exports Dearer (more expensive abroad)}',
    '\\text{Higher Interest Rates} \\implies \\text{Higher borrowing costs, lower consumer spending on credit}',
    '\\text{High Inflation} \\implies \\text{Higher raw material & wage pressures, squeezing profit margins}',
  ],
  'bus-6': [
    '\\text{Organic (Internal) Growth: New products, new branches, e-commerce expansion}',
    '\\text{Inorganic (External) Growth: Horizontal, Backward Vertical, Forward Vertical Mergers/Takeovers}',
    '\\text{Globalisation Trade-Off: Larger global market & lower unit costs vs Tariffs & cultural barriers}',
  ],
  'bus-7': [
    '\\text{Marketing Mix (4 Ps): Product} + \\text{Price} + \\text{Place} + \\text{Promotion}',
    '\\text{Product Life Cycle: Development} \\rightarrow \\text{Introduction} \\rightarrow \\text{Growth} \\rightarrow \\text{Maturity} \\rightarrow \\text{Decline (Extension Strategies)}',
    '\\text{Just-In-Time (JIT): Zero buffer stock (lower storage costs)} \\quad \\text{vs} \\quad \\text{Just-In-Case (JIC): Buffer stock}',
  ],
  'bus-8': [
    '\\text{Gross Profit} = \\text{Revenue} - \\text{Cost of Sales} \\quad | \\quad \\text{Gross Profit Margin (\\%)} = \\frac{\\text{Gross Profit}}{\\text{Revenue}} \\times 100',
    '\\text{Net Profit} = \\text{Gross Profit} - \\text{Operating Expenses} \\quad | \\quad \\text{Net Margin (\\%)} = \\frac{\\text{Net Profit}}{\\text{Revenue}} \\times 100',
    '\\text{ARR (\\%)} = \\frac{\\text{Total Net Profit} \\div \\text{Years}}{\\text{Initial Capital Cost}} \\times 100',
  ],

  // ECONOMICS (8 Topics)
  'econ-1': [
    '\\text{Basic Economic Problem: Infinite Wants} + \\text{Finite Resources} \\implies \\text{Scarcity & Opportunity Cost}',
    '\\text{Opportunity Cost} = \\text{Value of the next best alternative foregone}',
    '\\text{4 Factors of Production (CELL): Capital (Interest), Enterprise (Profit), Land (Rent), Labour (Wages)}',
  ],
  'econ-2': [
    '\\text{Market Equilibrium: Quantity Demanded } (Q_d) = \\text{Quantity Supplied } (Q_s)',
    '\\text{Price above Equilibrium} \\implies \\text{Excess Supply (Surplus)} \\quad | \\quad \\text{Price below} \\implies \\text{Excess Demand (Shortage)}',
    '\\text{Price Change} = \\text{Movement along curve} \\quad | \\quad \\text{Non-Price Factor (Income/Costs)} = \\text{Shift of entire curve}',
  ],
  'econ-3': [
    '\\text{PED} = \\frac{\\% \\text{ Change in Quantity Demanded}}{\\% \\text{ Change in Price}} \\quad | \\quad \\text{PES} = \\frac{\\% \\Delta Q_s}{\\% \\Delta P}',
    '\\text{Price Elastic } (|\\text{PED}| > 1)\\text{: Lower price} \\implies \\text{Total Revenue rises}',
    '\\text{Price Inelastic } (|\\text{PED}| < 1)\\text{: Raise price} \\implies \\text{Total Revenue rises}',
  ],
  'econ-4': [
    '\\text{Social Cost} = \\text{Private Cost} + \\text{External Cost} \\quad | \\quad \\text{Social Benefit} = \\text{Private Benefit} + \\text{External Benefit}',
    '\\text{Indirect Tax: Shifts Supply Left } (S_1 \\rightarrow S_2)\\text{, raising price and reducing demerit output}',
    '\\text{Subsidy: Shifts Supply Right } (S_1 \\rightarrow S_2)\\text{, lowering price and boosting merit goods}',
  ],
  'econ-5': [
    '\\text{Total Cost (TC)} = \\text{FC} + \\text{VC} \\quad | \\quad \\text{Average Cost (AC)} = \\frac{\\text{Total Cost}}{\\text{Output }(Q)}',
    '\\text{Profit} = \\text{Total Revenue } (P \\times Q) - \\text{Total Cost}',
    '\\text{Economies of Scale: Output } \\uparrow \\implies \\text{Long-Run Average Cost (LRAC) } \\downarrow',
  ],
  'econ-6': [
    '\\text{Real GDP Growth (\\%)} = \\text{Nominal GDP Growth (\\%)} - \\text{Inflation Rate (\\%)}',
    '\\text{Unemployment Rate (\\%)} = \\frac{\\text{Unemployed}}{\\text{Total Labour Force}} \\times 100',
    '\\text{Demand-Pull Inflation (excess AD)} \\quad \\text{vs} \\quad \\text{Cost-Push Inflation (rising wages/raw materials)}',
  ],
  'econ-7': [
    '\\text{Fiscal Policy: Government Spending } (G) \\text{ & Taxation } (T) \\quad (\\text{Budget Deficit: } G > T)',
    '\\text{Monetary Policy (Central Bank): Base Interest Rates & Quantitative Easing (Money Supply)}',
    '\\text{Supply-Side Policies: Education/Training, Deregulation, R&D Tax Credits, Infrastructure}',
  ],
  'econ-8': [
    '\\text{Current Account Balance} = \\text{Trade in Goods} + \\text{Trade in Services} + \\text{Primary/Secondary Income}',
    '\\text{Protectionism Tools: Tariffs (tax on imports), Quotas (physical limit), Domestic Subsidies}',
    '\\text{Currency Depreciation} \\implies \\text{Exports cheaper abroad, Imports more expensive domestically}',
  ],

  // ENGLISH LANGUAGE (6 Topics)
  'eng-lang-1': [
    '\\text{Explicit Meaning: Stated directly on the surface} \\quad | \\quad \\text{Implicit Meaning: Inferred beneath the surface}',
    '\\text{Paper 2 Q2 Synthesis: Point (Text A)} + \\text{Quote} + \\text{Inference} \\leftrightarrow \\text{Comparative Link to Text B}',
    '\\text{Always embed short 2–4 word quotes inside your analytical sentence}',
  ],
  'eng-lang-2': [
    '\\text{Language Analysis (PEEZL): Conceptual Point} \\rightarrow \\text{Micro-Quote} \\rightarrow \\text{Terminology} \\rightarrow \\text{Word Zoom} \\rightarrow \\text{Reader Effect}',
    '\\text{Zoom into a single verb, adjective, or sibilant/plosive sound and unpack two layers of connotation}',
    '\\text{Link imagery patterns (semantic fields) to the writer’s overarching purpose}',
  ],
  'eng-lang-3': [
    '\\text{Structure Arc: Opening Focus} \\rightarrow \\text{Perspective/Temporal Shift} \\rightarrow \\text{Climax/Volta} \\rightarrow \\text{Cyclical/Cliffhanger Ending}',
    '\\text{Ask: "What does the writer force the reader to look at first, next, and last—and why?"}',
    '\\text{Never analyse language metaphors in a Structure question—focus on focus shifts, zoom, and pacing}',
  ],
  'eng-lang-4': [
    '\\text{Paper 1 Q4 Evaluation: Thesis on Statement} + \\text{Writer’s Method} + \\text{Micro-Quote} + \\text{"How Effectively" Judgement}',
    '\\text{Paper 2 Q4 Viewpoints: Compare Perspective (What they feel)} + \\text{Methods (How they convey it: irony, tone, hyperbole)}',
    '\\text{Track if the writer’s attitude shifts across the extract}',
  ],
  'eng-lang-5': [
    '\\text{5-Part Narrative/Descriptive Structure: Wide Panorama} \\rightarrow \\text{Zoom In} \\rightarrow \\text{Sensory Shift} \\rightarrow \\text{Flashback/Tension} \\rightarrow \\text{Cyclical Link}',
    '\\text{Show, Don’t Tell: Replace basic verbs with precise figurative imagery and varied sentence lengths}',
    '\\text{Punctuation Range for AO6: Semicolon (;), Colon (:), Em-dash (—), Single-sentence paragraph}',
  ],
  'eng-lang-6': [
    '\\text{Persuasive Structure: Hook} \\rightarrow \\text{Moral/Social Urgency} \\rightarrow \\text{Counter-Argument ("Critics claim...")} \\rightarrow \\text{Call to Action}',
    '\\text{DAFOREST: Direct Address, Anecdote, Facts, Opinion, Rhetorical Question, Emotive Language, Triples}',
    '\\text{Match Form & Register: Broadsheet Article (headline + subheading), Speech (direct address), Formal Letter}',
  ],

  // ENGLISH LITERATURE (5 Topics)
  'eng-lit-1': [
    '\\text{Macbeth Arc: "Brave Macbeth" (Act 1)} \\rightarrow \\text{Regicide & Paranoia (Act 2–3)} \\rightarrow \\text{"Dead butcher" (Act 5)}',
    '\\text{Key Motifs: Blood (inescapable guilt), Sleep (innocence destroyed), Inversion of Nature ("Fair is foul")}',
    '\\text{Jacobean Context (AO3): Divine Right of Kings, King James I’s Daemonologie, Gunpowder Plot warning}',
  ],
  'eng-lit-2': [
    '\\text{Romeo & Juliet Thesis: Prologue’s "star-cross’d lovers" (Fate)} \\leftrightarrow \\text{Impulsive human haste & honour feud}',
    '\\text{Language Contrasts: Petrarchan cliché (Rosaline)} \\rightarrow \\text{Shared religious sonnet (Juliet)} \\rightarrow \\text{Light/Dark oxymorons}',
    '\\text{Elizabethan Context (AO3): Patriarchal authority (Capulet), family honour code, arranged marriage}',
  ],
  'eng-lit-3': [
    '\\text{A Christmas Carol Allegory: Stave 1 Malthusian greed ("solitary as an oyster")} \\rightarrow \\text{Stave 5 Christian philanthropist}',
    '\\text{Jekyll & Hyde Duality: Victorian façade of respectability vs repressed Darwinian/primitive desires (Hyde)}',
    '\\text{19th-Century Context (AO3): 1834 Poor Law, Industrial Revolution inequality, Victorian scientific anxiety}',
  ],
  'eng-lit-4': [
    '\\text{An Inspector Calls Structure: 1912 Edwardian capitalist complacency punctured by Inspector Goole’s socialist inquiry}',
    '\\text{Generational Divide: Older Birlings (static, refuse blame)} \\leftrightarrow \\text{Sheila & Eric (dynamic moral awakening)}',
    '\\text{1912 vs 1945 Context (AO3): Dramatic irony of Titanic/WWI predictions; post-WWII Welfare State audience}',
  ],
  'eng-lit-5': [
    '\\text{Poetry Comparison Thesis: Pair poems by shared theme + contrasting attitude/form (e.g. Ozymandias vs My Last Duchess)}',
    '\\text{Analyse Form & Structure (AO2): Sonnet, dramatic monologue, regular stanza order vs fragmented caesura/enjambment}',
    '\\text{Nature vs Conflict Pairings: Exposure & Storm on the Island; Bayonet Charge & Charge of the Light Brigade}',
  ],

  // GEOGRAPHY (5 Topics)
  'geo-1': [
    '\\text{Destructive Margin: Oceanic plate subducts under Continental} \\rightarrow \\text{Composite Volcanoes + Violent Earthquakes}',
    '\\text{Constructive Margin: Plates diverge} \\rightarrow \\text{Magma rises to form Shield Volcanoes (e.g. Mid-Atlantic Ridge)}',
    '\\text{Hazard Risk Equation: Risk increases with Population Density, Poverty (LIC vs HIC), and Weak Building Codes}',
  ],
  'geo-2': [
    '\\text{Tropical Storm Conditions: Sea temperature } \\ge 27^\\circ\\text{C} + \\text{Coriolis Force } (5^\\circ\\text{–}30^\\circ \\text{ N/S}) + \\text{Low Wind Shear}',
    '\\text{Global Atmospheric Circulation: Hadley Cell (0°–30°)} \\quad | \\quad \\text{Ferrel Cell (30°–60°)} \\quad | \\quad \\text{Polar Cell (60°–90°)}',
    '\\text{Climate Change Response: Mitigation (cutting GHG emissions) vs Adaptation (flood defences, drought crops)}',
  ],
  'geo-3': [
    '\\text{Headland Erosion Sequence: Crack} \\rightarrow \\text{Cave} \\rightarrow \\text{Arch} \\rightarrow \\text{Stack} \\rightarrow \\text{Stump (Hydraulic Action & Abrasion)}',
    '\\text{Longshore Drift: Swash at prevailing wind angle } (45^\\circ) + \\text{Backwash at } 90^\\circ \\rightarrow \\text{Spit & Bar formation}',
    '\\text{Coastal Management: Hard Engineering (Sea Walls, Groynes) vs Soft Engineering (Beach Nourishment, Managed Retreat)}',
  ],
  'geo-4': [
    '\\text{River Discharge } (Q) = \\text{Cross-Sectional Area } (A) \\times \\text{Velocity } (V) \\quad (\\text{in m}^3\\text{/s cumecs})',
    '\\text{Flashy Storm Hydrograph: Short lag time + High peak discharge (caused by impermeable rock, urbanisation, steep slopes)}',
    '\\text{Course Landforms: Upper (V-shaped valleys, waterfalls)} \\rightarrow \\text{Middle (Meanders, oxbow lakes)} \\rightarrow \\text{Lower (Floodplains, levees)}',
  ],
  'geo-5': [
    '\\text{Urbanisation Drivers: Rural-to-Urban Migration (Push vs Pull Factors)} + \\text{Natural Increase}',
    '\\text{NEE Megacity Case Study (Rio / Lagos): Social/Economic Opportunities vs Squatter Settlement (Favela) Challenges}',
    '\\text{Urban Sustainability (Freiburg): Integrated public transport, renewable solar energy, green spaces & water recycling}',
  ],

  // HISTORY (11 Topics)
  'hist-1': [
    '\\text{Weimar Weaknesses (1919–23): Treaty of Versailles (LAMB)} + \\text{Article 48 & Proportional Representation} + \\text{1923 Hyperinflation}',
    '\\text{Stresemann Recovery (1924–29): Rentenmark, Dawes Plan (1924), Young Plan (1929), Locarno Pact}',
    '\\text{Hitler’s Rise to Chancellor (1929–33): Wall Street Crash (6m unemployed)} + \\text{Nazi Propaganda/SA} + \\text{Von Papen/Hindenburg Backstairs Intrigue}',
  ],
  'hist-2': [
    '\\text{Gleichschaltung (1933–34): Reichstag Fire} \\rightarrow \\text{Enabling Act (Mar 1933)} \\rightarrow \\text{Night of the Long Knives (Jun 1934)}',
    '\\text{Nazi Control Dual Pillar: Terror (SS, Gestapo, Concentration Camps)} + \\text{Goebbels Propaganda & Censorship}',
    '\\text{Youth & Persecution: Hitler Youth / Kinder, Küche, Kirche} + \\text{1935 Nuremberg Laws} + \\text{Nov 1938 Kristallnacht}',
  ],
  'hist-3': [
    '\\text{1917 Revolutions: Feb Abdication of Tsar Nicholas II} \\rightarrow \\text{Provisional Gov Failures} \\rightarrow \\text{Lenin’s Oct Bolshevik Seizure}',
    '\\text{Economic Shifts: War Communism (1918–21)} \\rightarrow \\text{Lenin’s NEP (1921)} \\rightarrow \\text{Stalin’s Collectivisation & Five-Year Plans}',
    '\\text{Stalin’s Totalitarian Control: 1936–38 Great Purges (NKVD, Show Trials, Gulags) + Cult of Personality}',
  ],
  'hist-4': [
    '\\text{1920s Boom & Bust: Laissez-faire, Mass Production (Ford), Credit} \\rightarrow \\text{Oct 1929 Wall Street Crash & Great Depression}',
    '\\text{FDR’s New Deal (3 Rs): Relief, Recovery, Reform (Alphabet Agencies: CCC, TVA, WPA)}',
    '\\text{Civil Rights Milestone Chain: Brown v. Board (1954)} \\rightarrow \\text{Montgomery Bus Boycott (1955)} \\rightarrow \\text{Civil Rights Act (1964) & Voting Rights Act (1965)}',
  ],
  'hist-5': [
    '\\text{Pre-1914 Catalyst Chain: Alliance System} + \\text{Anglo-German Naval Race} + \\text{Moroccan/Balkan Crises} + \\text{Sarajevo Assassination (28 Jun 1914)}',
    '\\text{Western Front Stalemate: Failure of Schlieffen Plan at Marne} \\rightarrow \\text{Trench Warfare attrition (Verdun, Somme 1916, Passchendaele)}',
    '\\text{1918 Allied Victory: US Entry (1917)} + \\text{Failure of Ludendorff Spring Offensive} + \\text{British Naval Blockade} \\rightarrow \\text{11 Nov 1918 Armistice}',
  ],
  'hist-6': [
    '\\text{League of Nations Structural Flaws: No USA, No standing army, Unanimous voting, Great Depression self-interest}',
    '\\text{1930s Crises: Manchuria (1931–33)} + \\text{Abyssinia (1935–36 Hoare-Laval Pact)} \\implies \\text{Death of Collective Security}',
    '\\text{Hitler’s Escalation: Rearmament} \\rightarrow \\text{Rhineland (1936)} \\rightarrow \\text{Anschluss & Munich Agreement (1938)} \\rightarrow \\text{Nazi-Soviet Pact & Poland (1939)}',
  ],
  'hist-7': [
    '\\text{Early Cold War Division (1945–49): Yalta/Potsdam} \\rightarrow \\text{Truman Doctrine & Marshall Plan (1947)} \\rightarrow \\text{Berlin Blockade/Airlift (1948–49) & NATO}',
    '\\text{Peak Crises (1961–62): Berlin Wall (Aug 1961)} + \\text{Cuban Missile Crisis (Oct 1962: 13 Days, Quarantine, Hotline)}',
    '\\text{1968–72 Shift: Prague Spring & Brezhnev Doctrine (1968)} \\rightarrow \\text{SALT I Détente (1972)}',
  ],
  'hist-8': [
    '\\text{1066 Succession Crisis: Stamford Bridge (Hardrada)} \\rightarrow \\text{Battle of Hastings (14 Oct 1066: Norman cavalry feigned retreat)}',
    '\\text{Securing Norman Control: Motte & Bailey Castles} + \\text{Harrying of the North (1069–70)} + \\text{Anglo-Saxon land forfeiture}',
    '\\text{Norman Governance: Feudal Hierarchy (King} \\rightarrow \\text{Tenants-in-Chief} \\rightarrow \\text{Knights} \\rightarrow \\text{Peasants)} + \\text{1086 Domesday Book} + \\text{Lanfranc’s Church Reforms}',
  ],
  'hist-9': [
    '\\text{1559 Elizabethan Religious Settlement: Act of Supremacy (Supreme Governor)} + \\text{Act of Uniformity (Middle Way)}',
    '\\text{Catholic Plots (1569–87): Northern Earls (1569)} \\rightarrow \\text{Ridolfi, Throckmorton & Babington Plots} \\rightarrow \\text{Execution of Mary, Queen of Scots (1587)}',
    '\\text{1588 Spanish Armada Defeat: English fireships at Calais, Drake’s faster galleons, Battle of Gravelines & Atlantic storms}',
  ],
  'hist-10': [
    '\\text{Causes of Disease Shift: Medieval Four Humours & Miasma} \\rightarrow \\text{Pasteur’s 1861 Germ Theory & Koch’s Bacteriology} \\rightarrow \\text{DNA/Genetics}',
    '\\text{Surgery Breakthroughs: Simpson’s Chloroform (1847 Anaesthetic)} + \\text{Lister’s Carbolic Acid (1867 Antiseptic)} + \\text{Aseptic/Blood Transfusions}',
    '\\text{Prevention & Treatment: Jenner’s Smallpox Vaccine (1796)} \\rightarrow \\text{Public Health Acts (1848/1875)} \\rightarrow \\text{Fleming/Florey/Chain Penicillin & 1948 NHS}',
  ],
  'hist-11': [
    '\\text{Medieval & Early Modern Challenging Royal Authority: 1215 Magna Carta} \\rightarrow \\text{1265 Simon de Montfort’s Parliament} \\rightarrow \\text{1642–49 English Civil War}',
    '\\text{19th-Century Reform: 1832 Great Reform Act, Chartism, Anti-Corn Law League, Peel’s Factory/Social Reforms & Trade Unions}',
    '\\text{20th-Century Franchise & Rights: Suffragists (NUWSS) vs Suffragettes (WSPU)} + \\text{WWI home front} \\rightarrow \\text{1918 & 1928 Representation of the People Acts}',
  ],
};

export function getTopicFormulaeList(topicId: string): string[] {
  const topic = GCSE_TOPICS.find((t) => t.id === topicId) || GCSE_TOPICS[0];
  if (TOPIC_SPECIFIC_FORMULAE[topic.id]) {
    return TOPIC_SPECIFIC_FORMULAE[topic.id];
  }
  if (topic.keyFormulae && topic.keyFormulae.length > 0) {
    return topic.keyFormulae;
  }
  return [topic.description];
}

export function getTopicFlashcards(topicId: string): TopicFlashcard[] {
  const topic = GCSE_TOPICS.find((t) => t.id === topicId) || GCSE_TOPICS[0];
  const formulaeList = getTopicFormulaeList(topic.id);
  const seedQuestions = INITIAL_SEED_QUESTIONS.filter((q) => q.topicId === topic.id);

  // Collect distinct subtopic questions for this topic
  const distinctSubQs: typeof seedQuestions = [];
  const seenSubtopics = new Set<string>();
  for (const q of seedQuestions) {
    const subKey = q.subtopicId || q.id;
    if (!seenSubtopics.has(subKey)) {
      seenSubtopics.add(subKey);
      distinctSubQs.push(q);
    }
  }

  const cards: TopicFlashcard[] = [];

  // 1. Topic-specific Formula & Rule cards (each shows its own distinct formula!)
  formulaeList.forEach((formula, idx) => {
    const subQ = distinctSubQs[idx] || seedQuestions[idx];
    cards.push({
      id: `${topic.id}-fc-formula-${idx + 1}`,
      topicId: topic.id,
      category: 'Formula & Rule',
      front:
        idx === 0
          ? `${topic.topicName}: What is the primary formula / core rule you need for this topic?`
          : `${topic.topicName} (${subQ?.subtopicName || `Rule #${idx + 1}`}): What is the key relationship or rule?`,
      back:
        subQ?.explanation?.keyConcept ||
        `Apply this rule directly to ${topic.topicName} problems:`,
      formulaHighlight: formula,
      examTip: subQ?.explanation?.examTip,
      gradeLevel: Math.min(9, topic.minGrade + idx),
    });
  });

  // 2. Distinct Subtopic Concept, Trap & Worked Micro-Problem cards (NO repetitive formulaHighlight!)
  for (const q of distinctSubQs) {
    if (cards.length < 9 && q.explanation?.keyConcept) {
      cards.push({
        id: `${topic.id}-fc-concept-${cards.length}`,
        topicId: topic.id,
        category: cards.length % 2 === 0 ? 'Common Trap' : 'Core Concept',
        front: q.subtopicName
          ? `${q.subtopicName}: What is the key rule and common mistake to watch out for?`
          : `${topic.topicName}: How do you secure full marks on Grade ${q.gradeLevel} questions?`,
        back: `✅ Core Rule: ${q.explanation.keyConcept}\n\n⚠️ Mistake to Avoid: ${
          q.explanation.commonMistakes?.[0] ||
          'Skipping intermediate working steps or unit conversions.'
        }`,
        examTip: q.explanation.examTip,
        gradeLevel: q.gradeLevel,
      });
    }

    if (cards.length < 12) {
      const stepsText =
        q.explanation?.stepByStep && q.explanation.stepByStep.length > 0
          ? q.explanation.stepByStep.slice(0, 3).join('\n• ')
          : q.explanation?.overview || '';
      cards.push({
        id: `${topic.id}-fc-micro-${cards.length}`,
        topicId: topic.id,
        category: 'Worked Micro-Problem',
        front: `Exam Practice (${q.subtopicName || topic.topicName}):\n${q.questionText}`,
        back: `🎯 Answer: ${q.correctAnswer}\n\n📝 Method:\n• ${stepsText}`,
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
  const goldenFormulae = getTopicFormulaeList(topic.id);
  const seedQuestions = INITIAL_SEED_QUESTIONS.filter((q) => q.topicId === topic.id);

  // Collect distinct subtopics for this exact topic
  const distinctSubQs: typeof seedQuestions = [];
  const seenSubs = new Set<string>();
  for (const q of seedQuestions) {
    const key = q.subtopicId || q.id;
    if (!seenSubs.has(key)) {
      seenSubs.add(key);
      distinctSubQs.push(q);
    }
    if (distinctSubQs.length >= 6) break;
  }

  const q1 = distinctSubQs[0] || seedQuestions[0];
  const q2 = distinctSubQs[1] || seedQuestions[1] || q1;
  const q3 = distinctSubQs[2] || seedQuestions[2] || q1;
  const sampleQ =
    distinctSubQs.find((q) => q.gradeLevel >= 6 && q.gradeLevel <= 8) ||
    distinctSubQs[3] ||
    q1;

  const concept1 =
    q1?.explanation?.keyConcept || `${topic.topicName}: ${topic.description}`;
  const concept2 =
    q2?.explanation?.keyConcept || q1?.explanation?.overview || goldenFormulae[0];
  const concept3 =
    q3?.explanation?.keyConcept ||
    q2?.explanation?.overview ||
    goldenFormulae[1] ||
    goldenFormulae[0];

  const method1 = q1?.explanation?.overview || concept1;
  const method2 = q2?.explanation?.overview || concept2;
  const method3 = q3?.explanation?.overview || concept3;

  const topTrap1 =
    q1?.explanation?.commonMistakes?.[0] ||
    'Skipping the formula or unit conversion step before calculating.';
  const topTrap2 =
    q2?.explanation?.commonMistakes?.[0] ||
    q1?.explanation?.commonMistakes?.[1] ||
    'Rounding intermediate values too early instead of only rounding the final answer.';
  const topExamTip1 =
    q1?.explanation?.examTip ||
    'Write the governing equation and substitute known numbers clearly to secure method marks.';
  const topExamTip2 =
    q2?.explanation?.examTip ||
    sampleQ?.explanation?.examTip ||
    'Check your final units and significant figures against the question stem.';

  const workedSteps =
    sampleQ?.explanation?.stepByStep && sampleQ.explanation.stepByStep.length > 0
      ? sampleQ.explanation.stepByStep
      : [
          'Identify the given quantities and units in the question.',
          'Substitute the known values into the core formula.',
          `Solve to obtain ${sampleQ?.correctAnswer || 'the final result'}.`,
        ];

  const slides: PodVisualSlide[] = [
    {
      id: `${topic.id}-slide-1`,
      slideNumber: 1,
      badge: 'Slide 1 • Core Rules',
      title: `${topic.topicName}: Core Principles`,
      visualType: 'formula_spotlight',
      headlineFormula: goldenFormulae[0],
      keyTakeaways: [concept1, concept2, concept3],
      dialogue: [
        {
          speaker: 'Dan',
          text: `${topic.topicName}: ${topic.description} First core principle—${concept1}`,
        },
        {
          speaker: 'Mia',
          text: `${q2?.subtopicName ? `In ${q2.subtopicName}: ` : ''}${concept2}`,
        },
        {
          speaker: 'Dan',
          text: `${q3?.subtopicName ? `For ${q3.subtopicName}: ` : ''}${concept3}`,
        },
      ],
    },
    {
      id: `${topic.id}-slide-2`,
      slideNumber: 2,
      badge: 'Slide 2 • Key Methods',
      title: `${topic.topicName}: Subtopic Methods`,
      visualType: 'three_pillars',
      headlineFormula: goldenFormulae.slice(0, 2).join('   |   '),
      keyTakeaways: [
        `${q1?.subtopicName || 'Method 1'}: ${method1}`,
        `${q2?.subtopicName || 'Method 2'}: ${method2}`,
        `${q3?.subtopicName || 'Method 3'}: ${method3}`,
      ],
      dialogue: [
        {
          speaker: 'Dan',
          text: `${q1?.subtopicName ? `${q1.subtopicName}: ` : ''}${method1}`,
        },
        {
          speaker: 'Mia',
          text: `${q2?.subtopicName ? `${q2.subtopicName}: ` : ''}${method2}`,
        },
        {
          speaker: 'Dan',
          text: `${q3?.subtopicName ? `${q3.subtopicName}: ` : ''}${method3}`,
        },
      ],
    },
    {
      id: `${topic.id}-slide-3`,
      slideNumber: 3,
      badge: 'Slide 3 • Worked Example',
      title: `Worked Example: ${sampleQ?.subtopicName || topic.topicName}`,
      visualType: 'worked_hack',
      headlineFormula: sampleQ
        ? `Answer: ${sampleQ.correctAnswer}`
        : goldenFormulae[0],
      keyTakeaways: workedSteps.slice(0, 3),
      dialogue: [
        {
          speaker: 'Mia',
          text: `Exam question: ${
            sampleQ?.questionText || `Calculate the result for ${topic.topicName}.`
          }`,
        },
        {
          speaker: 'Dan',
          text: `${workedSteps.slice(0, 2).join(' ')}`,
        },
        {
          speaker: 'Mia',
          text: `${
            workedSteps.length > 2
              ? workedSteps.slice(2).join(' ')
              : sampleQ?.explanation?.overview || ''
          } Final answer: ${sampleQ?.correctAnswer || ''}.`,
        },
      ],
    },
    {
      id: `${topic.id}-slide-4`,
      slideNumber: 4,
      badge: 'Slide 4 • Mistakes & Tips',
      title: `${topic.topicName}: Mistakes to Avoid & Exam Tips`,
      visualType: 'trap_vs_top',
      headlineFormula: topExamTip1,
      keyTakeaways: [
        `Avoid: ${topTrap1}`,
        `Avoid: ${topTrap2}`,
        `Exam Tip: ${topExamTip1}`,
      ],
      comparison: {
        commonTrap: `${topTrap1} ${topTrap2 !== topTrap1 ? topTrap2 : ''}`,
        grade9Fix: `${topExamTip1} ${topExamTip2 !== topExamTip1 ? topExamTip2 : ''}`,
      },
      dialogue: [
        {
          speaker: 'Dan',
          text: `Mistake to avoid in ${q1?.subtopicName || topic.topicName}: ${topTrap1}`,
        },
        {
          speaker: 'Mia',
          text: `${
            topTrap2 !== topTrap1
              ? `Second mistake to watch for: ${topTrap2} `
              : ''
          }Key exam tip: ${topExamTip1}`,
        },
        {
          speaker: 'Dan',
          text: `${
            topExamTip2 !== topExamTip1
              ? topExamTip2
              : `Key terms to include: ${(topic.keywords || [topic.topicName]).join(', ')}.`
          }`,
        },
      ],
    },
  ];

  return {
    topicId: topic.id,
    topicName: topic.topicName,
    subjectId: topic.subjectId,
    subjectName: subject.name,
    durationEstimate: '2 min Audio Lesson',
    crucialSummary: concept1,
    goldenFormulae,
    threeThingsToKnow: [concept1, concept2, concept3],
    slides,
  };
}

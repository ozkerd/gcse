/**
 * Mathematical & Scientific Notation Formatter for GCSE Study Hub
 * 1. formatVisualMathText: Converts raw ASCII shorthand (=>, ==>, ->, ^2, *, /, <=, >=)
 *    into proper mathematical notation & LaTeX so formulas always display with authentic symbols.
 * 2. formatSpokenMathText: Converts LaTeX and ASCII formulas into natural UK teacher speech
 *    so TTS never reads symbols literally like "equals greater than" or "caret 2".
 */

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  'n': 'ⁿ',
};

const SUBSCRIPT_DIGITS: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};

function toSuperscriptUnicode(exp: string): string {
  return exp
    .split('')
    .map((ch) => SUPERSCRIPT_DIGITS[ch] ?? ch)
    .join('');
}

/**
 * Formats plain-text segments (outside $...$) so ASCII math like `=>`, `==>`, `^2`, `*`, `/`
 * is displayed using genuine mathematical symbols (`⇒`, `→`, `²`, `×`, `÷`, `≤`, `≥`).
 */
function formatPlainSegmentVisually(segment: string): string {
  return (
    segment
      // Arrows and implication symbols
      .replace(/==>/g, ' ⇒ ')
      .replace(/=>/g, ' ⇒ ')
      .replace(/<=>/g, ' ⇔ ')
      .replace(/->/g, ' → ')
      // Inequalities and plus/minus
      .replace(/<=/g, ' ≤ ')
      .replace(/>=/g, ' ≥ ')
      .replace(/!=/g, ' ≠ ')
      .replace(/\+\/-/g, '±')
      // Multiplication (*) between numbers/variables
      .replace(/(\d|[a-zA-Z)])\s*\*\s*(\d|[a-zA-Z(])/g, '$1 × $2')
      // Division (/) when surrounded by spaces (e.g. "150 / 12" or "x / 4")
      .replace(/(\d|[a-zA-Z)])\s+\/\s+(\d|[a-zA-Z(])/g, '$1 ÷ $2')
      // Explicit braced powers outside LaTeX: x^{2}, 10^{-5}
      .replace(/\^\{([0-9+-n]+)\}/g, (_, exp: string) => toSuperscriptUnicode(exp))
      // Standard powers outside LaTeX: x^2, cm^2, m/s^2, 10^8, 2^n
      .replace(/\^([0-9+-n]+)/g, (_, exp: string) => toSuperscriptUnicode(exp))
      // Common chemical subscripts outside LaTeX: CO_2, H_2O, O_2
      .replace(/_([0-9]+)/g, (_, sub: string) =>
        sub
          .split('')
          .map((ch) => SUBSCRIPT_DIGITS[ch] ?? ch)
          .join('')
      )
      .replace(/\s{2,}/g, ' ')
  );
}

/**
 * Normalizes a string containing mixed prose and $...$ / $$...$$ math blocks
 * so both LaTeX and non-LaTeX math symbols render with proper mathematical notation.
 */
export function formatVisualMathText(text: string): string {
  if (!text) return '';

  // Normalize $$...$$ into $...$
  const normalizedDelimiters = text.replace(/\$\$([^$]+)\$\$/g, '$$$1$$');

  // Split by $...$ so we don't corrupt valid KaTeX inside $...$, while upgrading inside/outside appropriately
  const parts = normalizedDelimiters.split(/(\$[^$]+\$)/g);

  return parts
    .map((part) => {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        // Inside KaTeX math block: ensure ASCII ==> or => becomes \Rightarrow
        const inner = part
          .slice(1, -1)
          .replace(/==>/g, '\\Rightarrow ')
          .replace(/=>/g, '\\Rightarrow ')
          .replace(/->/g, '\\rightarrow ');
        return `$${inner}$`;
      }
      return formatPlainSegmentVisually(part);
    })
    .join('');
}

/**
 * Formats a sentence for plain-text transcript bubbles (where word-by-word slice highlighting is used)
 * so all LaTeX commands and ASCII symbols (==>, =>, ->, ^2, *, /) become clean mathematical Unicode
 * (⇒, →, ², ³, ×, ÷, ≤, ≥, √).
 */
export function formatReadableTranscriptText(raw: string): string {
  if (!raw) return '';
  let s = raw.replace(/\$\$/g, '').replace(/\$/g, '');

  for (let i = 0; i < 3; i++) {
    s = s.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^{}]+)\}/g, '$1');
  }
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 ÷ $2)');
  }
  s = s
    .replace(/\\sqrt\[3\]\{([^{}]+)\}/g, '∛($1)')
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\vec\{([^{}]+)\}/g, '$1')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\quad|\\qquad/g, '  ')
    .replace(/\\implies|\\Rightarrow|==>|=>/g, ' ⇒ ')
    .replace(/\\iff|\\Leftrightarrow|<=>/g, ' ⇔ ')
    .replace(/\\rightarrow|\\to|->/g, ' → ')
    .replace(/\\uparrow/g, '↑')
    .replace(/\\downarrow/g, '↓')
    .replace(/\\times/g, ' × ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\pm|\+\/-/g, ' ± ')
    .replace(/\\le\b|\\leq\b|<=/g, ' ≤ ')
    .replace(/\\ge\b|\\geq\b|>=/g, ' ≥ ')
    .replace(/\\neq\b|\\ne\b|!=/g, ' ≠ ')
    .replace(/\\approx/g, ' ≈ ')
    .replace(/\\propto/g, ' ∝ ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\sum/g, '∑')
    .replace(/\\perp/g, '⊥')
    .replace(/\\parallel/g, '∥')
    .replace(/\\cap\b/g, '∩')
    .replace(/\\cup\b/g, '∪')
    .replace(/\\mid\b/g, '|')
    .replace(/\\cdot/g, '·')
    .replace(/\^\s*\\circ/g, '°')
    .replace(/\\circ/g, '°')
    .replace(/\\%/g, '%');

  s = formatPlainSegmentVisually(s);
  s = s.replace(/_\{([0-9]+)\}/g, (_, sub: string) =>
    sub
      .split('')
      .map((ch) => SUBSCRIPT_DIGITS[ch] ?? ch)
      .join('')
  );
  s = s.replace(/_\{([^{}]+)\}/g, '($1)');
  s = s.replace(/\\[a-zA-Z]+/g, '').replace(/[{}]/g, '');
  return s.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Converts any mathematical or scientific text (LaTeX or ASCII) into clean, natural English speech
 * for TTS audio lessons. Eliminates literal symbol reading ("equal greater than", "caret", "slash").
 */
export function formatSpokenMathText(raw: string): string {
  if (!raw) return '';

  let s = raw;

  // 1. Strip math delimiters
  s = s.replace(/\$\$/g, ' ').replace(/\$/g, ' ');

  // 2. Iteratively expand LaTeX fractions: \frac{a}{b} -> a divided by b
  for (let i = 0; i < 3; i++) {
    s = s.replace(
      /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
      ' $1 divided by $2 '
    );
  }

  // 3. Roots: \sqrt[n]{x} and \sqrt{x}
  s = s.replace(/\\sqrt\[3\]\{([^{}]+)\}/g, ' the cube root of $1 ');
  s = s.replace(/\\sqrt\[([^{}]+)\]\{([^{}]+)\}/g, ' the $1 root of $2 ');
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, ' the square root of $1 ');
  s = s.replace(/√(\d+|\w+)/g, ' the square root of $1 ');

  // 4. Vectors & text wrappers
  s = s.replace(/\\vec\{([^{}]+)\}/g, ' vector $1 ');
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^{}]+)\}/g, '$1');
  }
  s = s.replace(/\\left/g, '').replace(/\\right/g, '');
  s = s.replace(/\\quad/g, ', ').replace(/\\qquad/g, ', ');

  // 5. Scientific & metric units with powers/slashes (before generic ^ and / rules)
  s = s
    .replace(/\bm\s*\/\s*s\^2\b|\bm\s*\/\s*s²/g, ' metres per second squared ')
    .replace(/\bm\s*\/\s*s\b/g, ' metres per second ')
    .replace(/\bkm\s*\/\s*h\b/g, ' kilometres per hour ')
    .replace(/\bg\s*\/\s*dm\^3\b|\bg\s*\/\s*dm³/g, ' grams per cubic decimetre ')
    .replace(/\bmol\s*\/\s*dm\^3\b|\bmol\s*\/\s*dm³/g, ' moles per cubic decimetre ')
    .replace(/\bkg\s*\/\s*m\^3\b|\bkg\s*\/\s*m³/g, ' kilograms per cubic metre ')
    .replace(/\bg\s*\/\s*cm\^3\b|\bg\s*\/\s*cm³/g, ' grams per cubic centimetre ')
    .replace(/\bJ\s*\/\s*kg\s*\^?\\?circ\s*C\b|\bJ\s*\/\s*kg°C\b/g, ' joules per kilogram degree Celsius ')
    .replace(/\bJ\s*\/\s*kg\b/g, ' joules per kilogram ')
    .replace(/\bN\s*\/\s*m\^2\b|\bN\s*\/\s*m²/g, ' newtons per square metre ')
    .replace(/\bN\s*\/\s*kg\b/g, ' newtons per kilogram ')
    .replace(/\bcm\^2\b|\bcm²/g, ' square centimetres ')
    .replace(/\bm\^2\b|\bm²/g, ' square metres ')
    .replace(/\bmm\^2\b|\bmm²/g, ' square millimetres ')
    .replace(/\bkm\^2\b|\bkm²/g, ' square kilometres ')
    .replace(/\bcm\^3\b|\bcm³/g, ' cubic centimetres ')
    .replace(/\bm\^3\b|\bm³/g, ' cubic metres ')
    .replace(/\bdm\^3\b|\bdm³/g, ' cubic decimetres ')
    .replace(/\^\s*\\circ\s*C\b|°C/g, ' degrees Celsius ')
    .replace(/\^\s*\\circ\b|°/g, ' degrees ');

  // 6. Common chemistry formulas & state symbols
  s = s
    .replace(/\(aq\)/g, ' aqueous ')
    .replace(/\(l\)/g, ' liquid ')
    .replace(/\(g\)/g, ' gas ')
    .replace(/\(s\)/g, ' solid ')
    .replace(/\bC_?6H_?\{?12\}?O_?6\b/g, ' C 6 H 12 O 6 ')
    .replace(/\bH_?2SO_?4\b/g, ' H 2 S O 4 ')
    .replace(/\bCaCO_?3\b/g, ' C a C O 3 ')
    .replace(/\bFe_?2O_?3\b/g, ' F e 2 O 3 ')
    .replace(/\bSiO_?2\b/g, ' S i O 2 ')
    .replace(/\bCO_?2\b/g, ' C O 2 ')
    .replace(/\bSO_?2\b/g, ' S O 2 ')
    .replace(/\bNO_?2\b/g, ' N O 2 ')
    .replace(/\bH_?2O\b/g, ' H 2 O ')
    .replace(/\bNH_?3\b/g, ' N H 3 ')
    .replace(/\bCH_?4\b/g, ' C H 4 ')
    .replace(/\bCl_?2\b/g, ' C l 2 ')
    .replace(/\bBr_?2\b/g, ' B r 2 ')
    .replace(/\bO_?2\b/g, ' O 2 ')
    .replace(/\bH_?2\b/g, ' H 2 ')
    .replace(/\bN_?2\b/g, ' N 2 ')
    .replace(/\be\^\{?-\}?/g, ' electrons ')
    .replace(/\bH\^\{?\+\}?/g, ' H plus ')
    .replace(/\bOH\^\{?-\}?/g, ' O H minus ')
    .replace(/\b([A-Z][a-z]?)\^\{(\d+)\+\}/g, ' $1 $2 plus ')
    .replace(/\b([A-Z][a-z]?)\^\{(\d+)-\}/g, ' $1 $2 minus ');

  // 7. Arrows & Implication symbols (==>, =>, ->, \implies, \rightarrow)
  s = s
    .replace(/<=>|\\iff|\\Leftrightarrow|⇔/g, ', which is equivalent to ')
    .replace(/==>|=>|\\implies|\\Rightarrow|⇒/g, ', which gives ')
    .replace(/->|\\rightarrow|\\to|→/g, ' gives ')
    .replace(/\\uparrow|↑/g, ' increases ')
    .replace(/\\downarrow|↓/g, ' decreases ');

  // 8. Powers / Exponents (^2, ^3, ^{...}, ^n, ², ³)
  s = s
    .replace(/f\^\{-1\}\(x\)/g, 'f inverse of x')
    .replace(/([a-zA-Z0-9)]+)\s*\^\s*2\b|([a-zA-Z0-9)]+)²/g, '$1$2 squared')
    .replace(/([a-zA-Z0-9)]+)\s*\^\s*3\b|([a-zA-Z0-9)]+)³/g, '$1$2 cubed')
    .replace(
      /([a-zA-Z0-9)]+)\s*\^\s*\{-([^{}]+)\}/g,
      '$1 to the power of minus $2'
    )
    .replace(
      /([a-zA-Z0-9)]+)\s*\^\s*\{([^{}]+)\}/g,
      '$1 to the power of $2'
    )
    .replace(
      /([a-zA-Z0-9)]+)\s*\^\s*-([a-zA-Z0-9]+)/g,
      '$1 to the power of minus $2'
    )
    .replace(
      /([a-zA-Z0-9)]+)\s*\^\s*([a-zA-Z0-9]+)/g,
      '$1 to the power of $2'
    )
    .replace(/\^/g, ' to the power of ');

  // 9. Subscripts: x_1, y_2, V_{total} -> "x 1", "y 2", "V total"
  s = s
    .replace(/_\{([^{}]+)\}/g, ' $1 ')
    .replace(/_([a-zA-Z0-9]+)/g, ' $1 ');

  // 10. Comparisons, inequalities & operators
  s = s
    .replace(/<=|\\le\b|\\leq\b|≤/g, ' is less than or equal to ')
    .replace(/>=|\\ge\b|\\geq\b|≥/g, ' is greater than or equal to ')
    .replace(/!=|\\neq\b|\\ne\b|≠/g, ' is not equal to ')
    .replace(/\\approx|≈/g, ' is approximately ')
    .replace(/\\propto|∝/g, ' is proportional to ')
    .replace(/\\pm|\+\/-|±/g, ' plus or minus ')
    .replace(/\\times|×|\*/g, ' times ')
    .replace(/\\div|÷/g, ' divided by ')
    .replace(/\\cdot/g, ' times ')
    .replace(/</g, ' is less than ')
    .replace(/>/g, ' is greater than ')
    // Slash between numbers or variables (e.g. "150 / 12", "x / 4", "1/2")
    .replace(/\b1\s*\/\s*2\b/g, ' one half ')
    .replace(/\b1\s*\/\s*3\b/g, ' one third ')
    .replace(/\b1\s*\/\s*4\b/g, ' one quarter ')
    .replace(/\b3\s*\/\s*4\b/g, ' three quarters ')
    .replace(/(\d+|\b[a-zA-Z])\s*\/\s*(\d+|[a-zA-Z]\b)/g, '$1 divided by $2')
    .replace(/=/g, ' equals ')
    .replace(/\+/g, ' plus ')
    // Subtraction vs negative sign
    .replace(/(\w|\))\s+-\s+(\w|\()/g, '$1 minus $2')
    .replace(/(^|[=(\s])-(\d+|[a-zA-Z]\b)/g, '$1 minus $2');

  // 11. Greek letters & set/geometry symbols
  s = s
    .replace(/\\Delta|Δ/g, ' change in ')
    .replace(/\\lambda|λ/g, ' wavelength ')
    .replace(/\\theta|θ/g, ' theta ')
    .replace(/\\rho|ρ/g, ' density ')
    .replace(/\\pi|π/g, ' pi ')
    .replace(/\\alpha|α/g, ' alpha ')
    .replace(/\\beta|β/g, ' beta ')
    .replace(/\\gamma|γ/g, ' gamma ')
    .replace(/\\sum|∑/g, ' the sum of ')
    .replace(/\\perp|⊥/g, ' perpendicular to ')
    .replace(/\\parallel|∥/g, ' parallel to ')
    .replace(/\\cap\b|∩/g, ' and ')
    .replace(/\\cup\b|∪/g, ' or ')
    .replace(/\\mid\b/g, ' given ')
    .replace(/\|/g, '. ')
    .replace(/%/g, ' percent ');

  // 12. Clean up any remaining LaTeX backslashes or braces
  s = s
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return s;
}

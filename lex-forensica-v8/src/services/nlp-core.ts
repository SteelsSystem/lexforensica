// LEX FORENSICA v8.0 — ForensicNLP Singleton

import {
  OperationalAxiom,
  LinguisticMode,
  AxiomSeverity,
  InstitutionType,
} from '../types';
import type { AuditResponse, LoopCycleViolation } from '../types';
import { PARAFRAME_MAP, SLANG_MAP } from '../lib/constants';

// ---------------------------------------------------------------------------
// ForensicNLP — Linguistic & Cypher Engine
// ---------------------------------------------------------------------------

class ForensicNLP {
  private static instance: ForensicNLP;

  private constructor() {}

  static getInstance(): ForensicNLP {
    if (!ForensicNLP.instance) {
      ForensicNLP.instance = new ForensicNLP();
    }
    return ForensicNLP.instance;
  }

  // -------------------------------------------------------------------------
  // Linguistic Engine
  // -------------------------------------------------------------------------

  /**
   * Detect linguistic mode by character-frequency analysis.
   * Priority: Czech diacritics → ORGANIC_CZ
   *           German umlauts/ß   → FORMAL_DE
   *           Mixed CZ+DE chars  → HYBRID_CZEN
   *           Institutional keywords → INSTITUTIONAL
   *           Default            → MECHANICAL_EN
   */
  detectLinguisticMode(text: string): LinguisticMode {
    // Czech-specific diacritics (not shared with German)
    const czOnlyChars = /[ěščřžůďťňĚŠČŘŽŮĎŤŇ]/g;
    // German-specific characters
    const deChars = /[äöüÄÖÜß]/g;

    const czMatches = (text.match(czOnlyChars) ?? []).length;
    const deMatches = (text.match(deChars) ?? []).length;

    const totalLen = text.length || 1;
    const czFreq = czMatches / totalLen;
    const deFreq = deMatches / totalLen;

    const CZ_THRESHOLD = 0.01;
    const DE_THRESHOLD = 0.01;

    if (czFreq >= CZ_THRESHOLD && deFreq >= DE_THRESHOLD) {
      return LinguisticMode.HYBRID_CZENGLISH;
    }

    if (czFreq >= CZ_THRESHOLD) {
      return LinguisticMode.ORGANIC_CZECH;
    }

    if (deFreq >= DE_THRESHOLD) {
      return LinguisticMode.FORMAL_GERMAN;
    }

    // Institutional keyword check (language-agnostic high-frequency patterns)
    const institutionalPattern =
      /\b(?:protocol|procedure|assessment|evaluation|compliance|non-compliant|clinical|diagnosis|prognosis|diagnostic|adjudication|tribunal|hearing|petition|decree|statutory|regulatory|administrative|protokol|posudek|diagnóza|usnesení|gutachten|beschluss|verfahren)\b/i;

    if (institutionalPattern.test(text)) {
      return LinguisticMode.INSTITUTIONAL_JARGON;
    }

    return LinguisticMode.MECHANICAL_ENGLISH;
  }

  /**
   * Replace slang terms with their formal equivalents using SLANG_MAP.
   * Replacement is case-insensitive and preserves surrounding whitespace.
   */
  decodeSlang(text: string, language: 'cs' | 'en' | 'de'): string {
    const map = SLANG_MAP[language];
    let result = text;

    // Sort by length descending so longer phrases are replaced first
    const entries = Object.entries(map).sort(
      ([a], [b]) => b.length - a.length,
    );

    for (const [slang, formal] of entries) {
      // Escape special regex characters in the slang term
      const escaped = slang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(?<![\\w])${escaped}(?![\\w])`, 'gi');
      result = result.replace(pattern, formal);
    }

    return result;
  }

  /**
   * Detect potential word-planting / hallucinations.
   * Returns terms present in llmOutput that do not appear in the original text.
   * Comparison is normalised to lower-case; short stop-words are excluded.
   */
  detectWordPlanting(text: string, llmOutput: string): string[] {
    const STOP_WORDS = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'not',
      'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'each', 'that',
      'this', 'these', 'those', 'it', 'its', 'i', 'we', 'you', 'he', 'she',
      'they', 'them', 'their', 'our', 'your', 'his', 'her', 'my', 'if',
      'then', 'than', 'when', 'where', 'which', 'who', 'what', 'how',
      've', 're', 'll', 's', 't', 'd', 'also', 'about', 'up', 'out',
      // Czech particles
      'a', 'i', 'k', 'o', 'v', 'z', 'se', 'si', 'je', 'to', 'ta', 'ten',
      // German articles / particles
      'der', 'die', 'das', 'ein', 'eine', 'einen', 'dem', 'den', 'des',
      'zu', 'im', 'am', 'bei', 'mit', 'von', 'und', 'oder', 'aber', 'nicht',
    ]);

    const tokenise = (s: string): Set<string> => {
      return new Set(
        s
          .toLowerCase()
          .split(/[\s,;:.!?()\[\]{}"'«»„"–—\-\/\\|]+/)
          .filter((t) => t.length > 3 && !STOP_WORDS.has(t)),
      );
    };

    const sourceTokens = tokenise(text);
    const outputTokens = tokenise(llmOutput);

    const planted: string[] = [];
    for (const token of outputTokens) {
      if (!sourceTokens.has(token)) {
        planted.push(token);
      }
    }

    return planted;
  }

  // -------------------------------------------------------------------------
  // Cypher Engine
  // -------------------------------------------------------------------------

  /**
   * Look up a term in PARAFRAME_MAP and return its forensic reinterpretation.
   * The _institutionType parameter is reserved for future context-sensitive
   * branching; current implementation uses the flat map.
   */
  paraframeInstitutionalJargon(
    term: string,
    _institutionType: InstitutionType,
  ): string {
    const key = term.toLowerCase().trim();
    return (
      PARAFRAME_MAP[key] ??
      `[PARAFRAME: no forensic reinterpretation on record for "${term}"]`
    );
  }

  // -------------------------------------------------------------------------
  // Term lists
  // -------------------------------------------------------------------------

  getComplianceFramingTerms(lang: 'cs' | 'en' | 'de'): string[] {
    switch (lang) {
      case 'cs':
        return [
          'nespolupracuje',
          'odmítá',
          'chybí náhled',
          'popírá nemoc',
          'neochota',
          'agresivní',
        ];
      case 'en':
        return [
          'non-compliant',
          'refuses',
          'uncooperative',
          'lacks insight',
          'agitation',
          'belligerent',
          'resistant',
        ];
      case 'de':
        return [
          'verweigert',
          'mangelnde Compliance',
          'fehlende Krankheitseinsicht',
          'unkooperativ',
          'aggressiv',
        ];
    }
  }

  getIatrogenicTerms(lang: 'cs' | 'en' | 'de'): string[] {
    switch (lang) {
      case 'cs':
        return [
          'akatizie',
          'dystonie',
          'tardivní dyskineze',
          'sedace',
          'nevolnost',
          'závratě',
        ];
      case 'en':
        return [
          'akathisia',
          'dystonia',
          'tardive dyskinesia',
          'sedation',
          'weight gain',
          'nausea',
        ];
      case 'de':
        return [
          'Akathisie',
          'Dystonie',
          'Spätdyskinesie',
          'Sedierung',
          'Gewichtszunahme',
          'Übelkeit',
        ];
    }
  }

  getCircularReasoningTerms(lang: 'cs' | 'en' | 'de'): string[] {
    switch (lang) {
      case 'cs':
        return ['nemá náhled', 'nemocný', 'potřebuje léčbu'];
      case 'en':
        return [
          'lacks insight',
          'needs treatment',
          'unable to understand',
          'clearly ill',
        ];
      case 'de':
        return [
          'fehlende Krankheitseinsicht',
          'behandlungsbedürftig',
          'unfähig zu verstehen',
        ];
    }
  }

  getJudicialTerms(lang: 'cs' | 'en' | 'de'): string[] {
    switch (lang) {
      case 'cs':
        return [
          'soud',
          'usnesení',
          'soudní rozhodnutí',
          'znalecký posudek',
          'opatrovník',
        ];
      case 'en':
        return [
          'court',
          'ruling',
          'judicial decision',
          'expert opinion',
          'guardian',
        ];
      case 'de':
        return [
          'Gericht',
          'Beschluss',
          'gerichtliche Entscheidung',
          'Gutachten',
          'Betreuer',
        ];
    }
  }

  getExpertTitlePattern(lang: 'cs' | 'en' | 'de'): RegExp {
    switch (lang) {
      case 'cs':
        return /(?:Dr\.|MUDr\.|PhDr\.|JUDr\.|Mgr\.)\s+([A-ZÁ-Ž][a-zá-ž]+)/g;
      case 'en':
        return /(?:Dr\.|Prof\.)\s+([A-Z][a-z]+)/g;
      case 'de':
        return /(?:Dr\.\s*med\.|Prof\.\s*Dr\.|PD\s+Dr\.|Dr\.\s*rer\.\s*nat\.|Dr\.\s*phil\.|Dipl\.-Psych\.)\s+([A-ZÄ-Ü][a-zä-ü]+)/g;
    }
  }

  // -------------------------------------------------------------------------
  // Integrity validation
  // -------------------------------------------------------------------------

  /**
   * Run all axiom integrity checks against an AuditResponse and the two
   * original input strings.  Returns an array of LoopCycleViolation objects
   * for every check that fires.
   */
  verifyIntegrity(
    audit: AuditResponse,
    inputA: string,
    inputB: string,
  ): LoopCycleViolation[] {
    const violations: LoopCycleViolation[] = [];

    const lang = audit.meta.language;

    // ------------------------------------------------------------------
    // A1 — Forensic Spoliation
    // If documentation gaps exist but no A1 axiom violation was flagged.
    // ------------------------------------------------------------------
    const hasDocGaps =
      Array.isArray(audit.documentationGaps) &&
      audit.documentationGaps.length > 0;
    const hasA1Violation = audit.axiomaticViolations.some(
      (v) => v.axiom === OperationalAxiom.A1_FORENSIC_SPOLIATION,
    );
    if (hasDocGaps && !hasA1Violation) {
      violations.push({
        axiom: OperationalAxiom.A1_FORENSIC_SPOLIATION,
        severity: AxiomSeverity.HIGH,
        message:
          'Documentation gaps detected but A1 (forensic spoliation) violation was not flagged in axiomaticViolations.',
        autoRemediation:
          'Add AxiomaticViolation entry for A1_FORENSIC_SPOLIATION referencing all gap periods.',
      });
    }

    // ------------------------------------------------------------------
    // A2 — Semantic Neutralisation
    // If compliance-framing terms found in inputA but no date correlation
    // evidence is present in the discrepancy matrix.
    // ------------------------------------------------------------------
    const complianceTerms = this.getComplianceFramingTerms(lang);
    const inputALower = inputA.toLowerCase();
    const complianceHit = complianceTerms.some((t) =>
      inputALower.includes(t.toLowerCase()),
    );
    const hasDateCorrelation = audit.discrepancyMatrix.some(
      (d) => d.axiom === OperationalAxiom.A2_SEMANTIC_NEUTRALIZATION,
    );
    if (complianceHit && !hasDateCorrelation) {
      violations.push({
        axiom: OperationalAxiom.A2_SEMANTIC_NEUTRALIZATION,
        severity: AxiomSeverity.HIGH,
        message:
          'Compliance-framing language detected in Input A but no A2 discrepancy entry with date correlation was produced.',
        autoRemediation:
          'Cross-reference compliance terms against chronology entries and add A2 discrepancy matrix row.',
      });
    }

    // ------------------------------------------------------------------
    // A3 — Iatrogenic Attribution
    // If iatrogenic terms in inputA are treated as symptoms (appear in
    // discrepancyMatrix without an iatrogenic flag).
    // ------------------------------------------------------------------
    const iatrogenicTerms = this.getIatrogenicTerms(lang);
    const iatrogenicHitTerms = iatrogenicTerms.filter((t) =>
      inputALower.includes(t.toLowerCase()),
    );
    if (iatrogenicHitTerms.length > 0) {
      const hasIatrogenicViolation = audit.axiomaticViolations.some(
        (v) => v.axiom === OperationalAxiom.A3_IATROGENIC_ATTRIBUTION,
      );
      if (!hasIatrogenicViolation) {
        violations.push({
          axiom: OperationalAxiom.A3_IATROGENIC_ATTRIBUTION,
          severity: AxiomSeverity.HIGH,
          message: `Iatrogenic terms found in Input A (${iatrogenicHitTerms.slice(0, 3).join(', ')}) but A3 violation not flagged — possible misattribution as primary symptoms.`,
          autoRemediation:
            'Review each iatrogenic term in context; add A3_IATROGENIC_ATTRIBUTION entry if misattribution is confirmed.',
        });
      }
    }

    // ------------------------------------------------------------------
    // A4 — Epistemic Circularity
    // If circular-reasoning terms found but no falsifiability check present.
    // ------------------------------------------------------------------
    const circularTerms = this.getCircularReasoningTerms(lang);
    const circularHit = circularTerms.some((t) =>
      inputALower.includes(t.toLowerCase()),
    );
    const hasCircularViolation = audit.axiomaticViolations.some(
      (v) => v.axiom === OperationalAxiom.A4_EPISTEMIC_CIRCULARITY,
    );
    const hasFalsifiabilityCheck =
      audit.auditIntegrity.epistemicCircularities.length > 0;
    if (circularHit && !hasFalsifiabilityCheck && !hasCircularViolation) {
      violations.push({
        axiom: OperationalAxiom.A4_EPISTEMIC_CIRCULARITY,
        severity: AxiomSeverity.MEDIUM,
        message:
          'Circular-reasoning language detected but no falsifiability check or A4 violation is recorded in the audit.',
        autoRemediation:
          'Populate auditIntegrity.epistemicCircularities with identified circular constructs and add A4 axiom violation.',
      });
    }

    // ------------------------------------------------------------------
    // A5 — Structural Bias (repeated expert)
    // If the same expert name appears multiple times across inputA and inputB.
    // ------------------------------------------------------------------
    const expertPattern = this.getExpertTitlePattern(lang);
    const allText = `${inputA}\n${inputB}`;
    const expertMatches = [...allText.matchAll(expertPattern)];
    const expertNames: string[] = expertMatches.map(
      (m) => m[0].trim().toLowerCase(),
    );
    const nameCounts: Record<string, number> = {};
    for (const name of expertNames) {
      nameCounts[name] = (nameCounts[name] ?? 0) + 1;
    }
    const repeatedExperts = Object.entries(nameCounts)
      .filter(([, count]) => count > 1)
      .map(([name]) => name);

    if (repeatedExperts.length > 0) {
      const hasStructuralBiasViolation = audit.axiomaticViolations.some(
        (v) => v.axiom === OperationalAxiom.A5_STRUCTURAL_BIAS,
      );
      if (!hasStructuralBiasViolation) {
        violations.push({
          axiom: OperationalAxiom.A5_STRUCTURAL_BIAS,
          severity: AxiomSeverity.MEDIUM,
          message: `Expert name(s) appear multiple times (${repeatedExperts.slice(0, 3).join('; ')}) — structural bias risk not flagged as A5 violation.`,
          autoRemediation:
            'Add A5_STRUCTURAL_BIAS violation entry noting the repeated expert references and conflict-of-interest implications.',
        });
      }
    }

    // ------------------------------------------------------------------
    // A6 — Judicial Abandonment
    // If judicial terms found but no indication of independent court assessment.
    // ------------------------------------------------------------------
    const judicialTerms = this.getJudicialTerms(lang);
    const judicialHit = judicialTerms.some((t) =>
      inputALower.includes(t.toLowerCase()),
    );
    const hasJudicialViolation = audit.axiomaticViolations.some(
      (v) => v.axiom === OperationalAxiom.A6_JUDICIAL_ABANDONMENT,
    );
    const hasJudicialAssessmentNote = audit.legalMatrix.some((l) =>
      /independent|court.*assess|assess.*court/i.test(
        `${l.provision} ${l.violation}`,
      ),
    );
    if (judicialHit && !hasJudicialAssessmentNote && !hasJudicialViolation) {
      violations.push({
        axiom: OperationalAxiom.A6_JUDICIAL_ABANDONMENT,
        severity: AxiomSeverity.HIGH,
        message:
          'Judicial terminology detected but no independent court assessment is documented in the legal matrix or axiom violations.',
        autoRemediation:
          'Verify whether judicial actor conducted independent fact-finding; if not, add A6_JUDICIAL_ABANDONMENT violation.',
      });
    }

    // ------------------------------------------------------------------
    // TRIPARTITE — Dignity / process conflict
    // If dignity concerns are present in the risk assessment but are not
    // listed as immediate actions (i.e. not prioritised).
    // ------------------------------------------------------------------
    const dignityPattern =
      /dignity|autonomy|self-determination|human rights|right to|důstojnost|autonomie|selbstbestimmung|menschenwürde/i;
    const dignityInConcerns = audit.riskAssessment.primaryConcerns.some((c) =>
      dignityPattern.test(c),
    );
    const dignityInActions = audit.riskAssessment.immediateActions.some((a) =>
      dignityPattern.test(a),
    );
    if (dignityInConcerns && !dignityInActions) {
      violations.push({
        axiom: 'TRIPARTITE',
        severity: AxiomSeverity.CRITICAL,
        message:
          'Dignity concerns are present in primaryConcerns but are absent from immediateActions — process considerations are being prioritised over dignity.',
        autoRemediation:
          'Elevate dignity-related concerns to immediateActions and ensure they appear before procedural items.',
      });
    }

    // ------------------------------------------------------------------
    // RULE_001 — Missing subject voice
    // If inputB is empty or very short (<50 characters).
    // ------------------------------------------------------------------
    const inputBTrimmed = inputB.trim();
    if (inputBTrimmed.length < 50) {
      violations.push({
        axiom: 'RULE_001',
        severity: AxiomSeverity.CRITICAL,
        message: `Input B (subject's own account) is ${inputBTrimmed.length === 0 ? 'absent' : `only ${inputBTrimmed.length} characters`} — subject voice is missing or severely truncated.`,
        autoRemediation:
          'Request the subject\'s direct testimony or written statement before proceeding with the audit. Flag this absence explicitly in the audit report.',
      });
    }

    return violations;
  }
}

export { ForensicNLP };
export const forensicNLP = ForensicNLP.getInstance();

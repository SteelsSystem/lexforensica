import { 
  AuditResponse, 
  AuthorityTier, 
  OperationalAxiom, 
  SemanticDistortion, 
  ChronologicalAnomaly,
  CypherState,
  SocialIdentityBlueprint,
  InstitutionalShortcut,
  LinguisticMode,
  SlangLabel,
  WordPlantingError
} from '../types';
import { UI_DICT, AppLanguage } from '../lib/translations';
import { RESEARCH_DEFINITION } from '../research';

/**
 * LinguisticEngine
 * Handles Organic (CZ) vs Mechanical (EN) translation and Slang-as-Label detection.
 * Prevents "Word-Planting" (Czenglish) errors.
 */
class LinguisticEngine {
  /**
   * Evaluates the linguistic mode based on text characteristics.
   */
  detectMode(text: string): LinguisticMode {
    const czenglishPatterns = [/uploadovat/i, /draftovat/i, /exekuovat/i, /ingesce/i];
    if (czenglishPatterns.some(p => p.test(text))) return LinguisticMode.HYBRID_CZENGLISH;
    
    // Simple heuristic: high inflection/diacritics = Organic
    const diacritics = (text.match(/[áčďéěíňóřšťúůýž]/gi) || []).length;
    return diacritics > text.length * 0.05 ? LinguisticMode.ORGANIC : LinguisticMode.MECHANICAL;
  }

  /**
   * Decodes slang as a "factual shortcut" to hidden meanings.
   */
  decodeSlang(text: string): SlangLabel[] {
    const labels: SlangLabel[] = [];
    const slangMap: Record<string, { shortcut: string, meaning: string }> = {
      'klece': { shortcut: 'Institutional Restraint', meaning: 'Net-beds or cage-beds used for containment' },
      'kurty': { shortcut: 'Physical Fixation', meaning: 'Mechanical restraints/straps' },
      'oblbnutý': { shortcut: 'Iatrogenic Sedation', meaning: 'State of pharmacological suppression' },
      'vypadnout': { shortcut: 'Discharge Desire', meaning: 'Urgent need for liberty and exit from institutional hold' }
    };

    Object.entries(slangMap).forEach(([term, data]) => {
      if (text.toLowerCase().includes(term)) {
        labels.push({
          term,
          factualShortcut: data.shortcut,
          hiddenMeaning: data.meaning,
          institutionalAccessImpact: "HIGH"
        });
      }
    });

    return labels;
  }

  /**
   * Identifies "Word-Planting" errors (Czenglish) that root in the LLM.
   */
  detectWordPlanting(text: string): WordPlantingError[] {
    const errors: WordPlantingError[] = [];
    const plantingMap: Record<string, string> = {
      'ingesce': 'Ingestion / Příjem (Institutional absorption)',
      'exekuovat': 'Execute / Provést (Technical execution)',
      'validovat': 'Validate / Ověřit (Verification of truth)'
    };

    Object.entries(plantingMap).forEach(([term, intended]) => {
      if (text.toLowerCase().includes(term)) {
        errors.push({
          detectedTerm: term,
          intendedMeaning: intended,
          rootCause: "LLM_ROOTING",
          remediation: `Replace mechanical '${term}' with organic Czech equivalent or formal English forensic term.`
        });
      }
    });

    return errors;
  }
}

/**
 * CypherEngine
 * Handles the "Cypher-State" (MIND1/MIND2/LOOP_CYCLE) and paraframing logic.
 */
class CypherEngine {
  private state: CypherState = CypherState.STATIC;

  setState(newState: CypherState) {
    this.state = newState;
  }

  getState(): CypherState {
    return this.state;
  }

  /**
   * Paraframes institutional jargon into forensic meaning.
   */
  paraframe(text: string, shortcuts: InstitutionalShortcut[]): string {
    let paraframed = text;
    shortcuts.forEach(s => {
      const regex = new RegExp(s.jargon, 'gi');
      paraframed = paraframed.replace(regex, `[PARAFRAMED: ${s.paraframedMeaning}]`);
    });
    return paraframed;
  }
}

/**
 * ForensicNLP Core Service
 * Centralized logic for language processing, authority mapping, and axiom enforcement.
 * Aligned with DATASET-CODEOFCONDUCT.md and Lex Forensica v8.0 standards.
 */
export class ForensicNLP {
  private static instance: ForensicNLP;
  private cypher: CypherEngine;
  private linguistic: LinguisticEngine;
  
  private constructor() {
    this.cypher = new CypherEngine();
    this.linguistic = new LinguisticEngine();
  }

  static getInstance(): ForensicNLP {
    if (!ForensicNLP.instance) {
      ForensicNLP.instance = new ForensicNLP();
    }
    return ForensicNLP.instance;
  }

  /**
   * Returns the LinguisticEngine instance.
   */
  getLinguistic(): LinguisticEngine {
    return this.linguistic;
  }

  /**
   * Returns the CypherEngine instance.
   */
  getCypher(): CypherEngine {
    return this.cypher;
  }

  /**
   * Maps a specific finding to the Authority Hierarchy.
   */
  getAuthorityTier(label: string): string {
    if (label.includes('VOID') || label.includes('Ω')) return AuthorityTier.TIER_1;
    if (label.includes('SEM') || label.includes('Δ')) return AuthorityTier.TIER_2;
    if (label.includes('CHRONO') || label.includes('◈')) return AuthorityTier.TIER_3;
    return 'GENERAL AUDIT';
  }

  /**
   * Detects institutional shortcuts and maps them to axiom violations.
   */
  detectInstitutionalShortcuts(text: string): InstitutionalShortcut[] {
    const shortcuts: InstitutionalShortcut[] = [];
    
    // Example patterns based on common institutional bias
    if (text.toLowerCase().includes('nespolupracuje') || text.toLowerCase().includes('non-compliant')) {
      shortcuts.push({
        jargon: 'nespolupracuje',
        paraframedMeaning: 'Subject is exercising autonomy or reacting to iatrogenic side effects',
        institutionalBiasScore: 0.8,
        axiomViolation: OperationalAxiom.A2
      });
    }
    
    if (text.toLowerCase().includes('bez náhledu') || text.toLowerCase().includes('lack of insight')) {
      shortcuts.push({
        jargon: 'bez náhledu',
        paraframedMeaning: 'Subject disagrees with institutional framing or is experiencing gaslighting',
        institutionalBiasScore: 0.9,
        axiomViolation: OperationalAxiom.A4
      });
    }

    return shortcuts;
  }

  /**
   * Maps the Subject Voice Layer to the Social Identity Blueprint.
   */
  applySocialIdentityBlueprint(subjectText: string): SocialIdentityBlueprint {
    const markers: string[] = [];
    let score = 1.0;

    if (subjectText.toLowerCase().includes('nevím') || subjectText.toLowerCase().includes('asi')) {
      markers.push('Gaslighting Marker: Linguistic Uncertainty');
      score -= 0.2;
    }

    if (subjectText.toLowerCase().includes('musel jsem') || subjectText.toLowerCase().includes('přinutili')) {
      markers.push('Internalized Oppression: Coerced Compliance');
      score -= 0.3;
    }

    return {
      subjectRole: score > 0.7 ? "WITNESS" : "SURVIVOR",
      internalizedOppressionDetected: markers.some(m => m.includes('Oppression')),
      gaslightingMarkers: markers.filter(m => m.includes('Gaslighting')),
      reconstructedNarrative: subjectText, // In a real app, this would be a more complex reconstruction
      identitySovereigntyScore: Math.max(0, score)
    };
  }

  /**
   * Enforces Operational Axioms (A1-A6) on a specific data point.
   */
  validateAxiom(finding: string): string[] {
    const violations: string[] = [];
    if (finding.toLowerCase().includes('chybí') || finding.toLowerCase().includes('missing')) {
      violations.push(OperationalAxiom.A1);
    }
    if (finding.toLowerCase().includes('nespolupracuje') || finding.toLowerCase().includes('non-compliant')) {
      violations.push(OperationalAxiom.A2);
    }
    // ... more deterministic checks can be added here to save LLM compute
    return violations;
  }

  /**
   * Simplifies language processing by providing direct forensic translation.
   * Reduces token usage by using pre-defined mappings for common forensic terms.
   */
  translateForensicTerm(term: string, lang: AppLanguage): string {
    // Direct mapping to save energy and ensure consistency
    const mapping: Record<string, Record<AppLanguage, string>> = {
      'TIME_VACUUM': { 'EN': 'Time Vacuum', 'CZENG': 'Časové vakuum' },
      'SEMANTIC_DRIFT': { 'EN': 'Semantic Drift', 'CZENG': 'Sémantický posun' },
      'LOGICAL_CRACK': { 'EN': 'Logical Crack', 'CZENG': 'Logická trhlina' },
      'INSTITUTIONAL_BIAS': { 'EN': 'Institutional Bias', 'CZENG': 'Institucionální bias' }
    };
    
    return mapping[term]?.[lang] || term;
  }

  /**
   * Quality Control: Validates the AuditResponse against the Code of Conduct.
   */
  verifyIntegrity(audit: AuditResponse): boolean {
    // Ensure TIER 1 priority
    const hasTier1 = audit.discrepancyMatrix.some(d => d.shortLabel.includes('VOID') || d.shortLabel.includes('Ω'));
    // Ensure Subject Voice is present
    const hasSubjectVoice = audit.chronology.some(e => e.subjectRecord && e.subjectRecord.content.length > 0);
    
    // Set Cypher State
    this.cypher.setState(CypherState.FLUID);
    audit.auditIntegrity.cypherState = this.cypher.getState();

    // Apply Identity Blueprint if subject voice is present
    const subjectVoice = audit.chronology.find(e => e.subjectRecord)?.subjectRecord?.content;
    if (subjectVoice) {
      audit.auditIntegrity.identityBlueprint = this.applySocialIdentityBlueprint(subjectVoice);
    }

    // Perform Linguistic Audit
    const fullText = audit.riskAssessment.summary + (subjectVoice || "");
    audit.auditIntegrity.linguisticAudit = {
      mode: this.linguistic.detectMode(fullText),
      slangLabels: this.linguistic.decodeSlang(fullText),
      wordPlantingErrors: this.linguistic.detectWordPlanting(fullText)
    };
    
    return hasTier1 && hasSubjectVoice;
  }
}

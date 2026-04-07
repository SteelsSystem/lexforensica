import { AuditResponse, AuditInput } from "../services/gemini";

export function isValidAuditResponse(data: any): data is AuditResponse {
  if (!data || typeof data !== 'object') return false;

  try {
    // Meta validation
    if (!data.meta || typeof data.meta.auditId !== 'string' || typeof data.meta.timestamp !== 'string') return false;

    // Risk Assessment
    if (!data.riskAssessment || !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.riskAssessment.overallLevel)) return false;
    if (!Array.isArray(data.riskAssessment.primaryRiskFactors)) return false;

    // Causal Map
    if (!data.causalMap?.layer_root || typeof data.causalMap.layer_root.hypothesis !== 'string') return false;

    // Arrays
    if (!Array.isArray(data.chronology)) return false;
    if (!Array.isArray(data.documentationGaps)) return false;
    if (!Array.isArray(data.discrepancyMatrix)) return false;
    if (!Array.isArray(data.legalMatrix)) return false;
    if (!Array.isArray(data.conflictOfInterestRegistry)) return false;
    if (!Array.isArray(data.researchGrounding)) return false;
    if (!Array.isArray(data.evidenceDemands)) return false;

    // Escalation Plan
    if (!data.escalationPlan?.tierActions || !Array.isArray(data.escalationPlan.tierActions.tier_0)) return false;

    // Human Intervention
    if (!data.humanIntervention || !Array.isArray(data.humanIntervention.clarificationQuestions)) return false;

    // Audit Integrity
    if (!data.auditIntegrity || !Array.isArray(data.auditIntegrity.flagsRaised)) return false;

    return true;
  } catch (e) {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  if (!input) return "";
  // Basic sanitization: remove null bytes and excessive whitespace
  return input.replace(/\0/g, '').trim();
}

export function validateAuditInputs(inputA: AuditInput, inputB: AuditInput): { isValid: boolean; error: string | null; flags?: string[] } {
  const sanitizedA = sanitizeInput(inputA.text);
  const sanitizedB = sanitizeInput(inputB.text);
  const flags: string[] = [];

  if (sanitizedA.length < 50 && inputA.images.length === 0) {
    return { isValid: false, error: "INPUT_A (Systémový záznam) musí obsahovat alespoň 50 znaků nebo alespoň jeden obrázek pro smysluplnou analýzu." };
  }
  if (sanitizedA.length > 100000) {
    return { isValid: false, error: "INPUT_A překračuje maximální povolenou délku textu (100 000 znaků)." };
  }

  if (sanitizedB.length === 0 && inputB.images.length === 0) {
    // PROTOCOL BETA: Conduct Violation Detected (INPUT_B missing)
    // Generalization Rule: "Always flag missing Subject Voice Layer to prevent one-sided institutional narrative."
    flags.push("INPUT_B_MISSING");
  } else if (sanitizedB.length > 0 && sanitizedB.length < 20 && inputB.images.length === 0) {
    return { isValid: false, error: "INPUT_B (Výpověď subjektu), pokud je zadán, musí obsahovat alespoň 20 znaků nebo obrázek." };
  }
  
  if (sanitizedB.length > 100000) {
    return { isValid: false, error: "INPUT_B překračuje maximální povolenou délku textu (100 000 znaků)." };
  }

  if (inputA.images.length > 10 || inputB.images.length > 10) {
    return { isValid: false, error: "Maximální počet obrázků na jeden vstup je 10." };
  }

  return { isValid: true, error: null, flags };
}

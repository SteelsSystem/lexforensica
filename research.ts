import { AuditResponse, AuditInput } from "../types";

export function isValidAuditResponse(data: any): data is AuditResponse {
  if (!data || typeof data !== 'object') return false;

  try {
    // Meta validation
    if (!data.meta || typeof data.meta.auditId !== 'string' || typeof data.meta.timestamp !== 'string') return false;

    // Risk Assessment
    if (!data.riskAssessment || !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.riskAssessment.overallLevel)) return false;
    if (!Array.isArray(data.riskAssessment.primaryRiskFactors)) return false;

    // Audit Metrics
    if (!data.auditMetrics || typeof data.auditMetrics.timeVacuums !== 'number') return false;

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
    if (!data.escalationPlan?.tierActions || !Array.isArray(data.escalationPlan.tierActions.defense_action_tier_0)) return false;

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

export function redactPII(text: string): string {
  if (!text) return "";
  
  let redacted = text;
  
  // Redact Emails
  redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  
  // Redact Phone Numbers (Basic pattern)
  redacted = redacted.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[REDACTED_PHONE]');
  
  // Redact Dates of Birth (Pattern: DD.MM.YYYY or YYYY-MM-DD or MM/DD/YYYY)
  redacted = redacted.replace(/\b\d{1,2}[./-]\d{1,2}[./-]\d{4}\b/g, '[REDACTED_DATE]');
  redacted = redacted.replace(/\b\d{4}[./-]\d{1,2}[./-]\d{1,2}\b/g, '[REDACTED_DATE]');
  
  // Redact IDs (Pattern: SSN-like or long numbers)
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_ID]');
  redacted = redacted.replace(/\b\d{9,12}\b/g, '[REDACTED_ID]');
  
  return redacted;
}

export function extractImmutableAnchors(text: string): string[] {
  if (!text) return [];
  
  const anchors: string[] = [];
  
  // Extract Dates (YYYY, DD.MM.YYYY, etc.)
  const dateMatches = text.match(/\b\d{4}\b|\b\d{1,2}[./-]\d{1,2}[./-]\d{4}\b/g);
  if (dateMatches) anchors.push(...dateMatches);
  
  // Extract IDs/Codes (e.g., F20.0, Court IDs like 123/2024)
  const codeMatches = text.match(/\b[A-Z]\d{2}\.\d\b|\b\d{1,6}\/\d{4}\b/g);
  if (codeMatches) anchors.push(...codeMatches);
  
  // Extract specific keywords that act as anchors
  const keywords = ["hospitalizace", "diagnóza", "rozsudek", "usnesení", "příkaz", "propouštěcí zpráva"];
  keywords.forEach(kw => {
    if (text.toLowerCase().includes(kw)) {
      anchors.push(kw);
    }
  });

  return Array.from(new Set(anchors));
}

export function validateAuditInputs(inputA: AuditInput, inputB: AuditInput): { isValid: boolean; error: string | null; flags: string[] } {
  const sanitizedA = sanitizeInput(inputA.text);
  const sanitizedB = sanitizeInput(inputB.text);
  const flags: string[] = [];
  let isValid = true;
  let error: string | null = null;

  if (sanitizedA.length < 50 && inputA.images.length === 0) {
    flags.push("INPUT_A_TOO_SHORT");
    isValid = false;
    error = "INPUT_A (Systémový záznam) musí obsahovat alespoň 50 znaků nebo alespoň jeden obrázek pro smysluplnou analýzu.";
  }
  
  if (sanitizedA.length > 100000) {
    flags.push("INPUT_A_TOO_LONG");
    isValid = false;
    error = "INPUT_A překračuje maximální povolenou délku textu (100 000 znaků).";
  }

  if (sanitizedB.length === 0 && inputB.images.length === 0) {
    flags.push("INPUT_B_MISSING");
    // We allow missing INPUT_B but flag it as a critical omission for forensic integrity
  } else if (sanitizedB.length > 0 && sanitizedB.length < 20 && inputB.images.length === 0) {
    flags.push("INPUT_B_TOO_SHORT");
    isValid = false;
    error = "INPUT_B (Výpověď subjektu), pokud je zadán, musí obsahovat alespoň 20 znaků nebo obrázek.";
  }
  
  if (sanitizedB.length > 100000) {
    flags.push("INPUT_B_TOO_LONG");
    isValid = false;
    error = "INPUT_B překračuje maximální povolenou délku textu (100 000 znaků).";
  }

  if (inputA.images.length > 10 || inputB.images.length > 10) {
    flags.push("MAX_IMAGES_EXCEEDED");
    isValid = false;
    error = "Maximální počet obrázků na jeden vstup je 10.";
  }

  return { isValid, error, flags };
}

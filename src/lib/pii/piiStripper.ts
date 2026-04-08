/**
 * LEX FORENSICA — PII Stripper
 * Zero-knowledge enforcement boundary.
 * Runs before ANY node reaches TrainingPoolEntry.
 * Extend PII_PATTERNS for domain-specific NER in production.
 */

const PII_PATTERNS: RegExp[] = [
  // Full names (Latin + Czech diacritics heuristic)
  /\b[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+ [A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+\b/g,
  // Czech birth number (rodné číslo)
  /\b\d{6}\/\d{3,4}\b/g,
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Czech phone numbers
  /(\+420|00420)?\s?\d{3}\s?\d{3}\s?\d{3}/g,
  // Case reference numbers with embedded identifiers
  /[A-Z]{1,3}-\d{4,}-\d{2,}/g,
];

export interface PIICheckResult {
  clean: boolean;
  sanitized: string;
  flaggedPatterns: string[];
}

/**
 * Strip PII from a single string.
 * Returns sanitized output + list of what was redacted.
 */
export function stripPII(input: string): PIICheckResult {
  let sanitized = input;
  const flaggedPatterns: string[] = [];

  for (const pattern of PII_PATTERNS) {
    const matches = input.match(pattern);
    if (matches) {
      flaggedPatterns.push(...matches);
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
  }

  return {
    clean: flaggedPatterns.length === 0,
    sanitized,
    flaggedPatterns,
  };
}

/**
 * Recursively sanitize all string fields in a DTO object.
 * Operates on a shallow clone — does not mutate the original.
 */
export function sanitizePayload<T extends Record<string, any>>(payload: T): T {
  const result = { ...payload };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string') {
      result[key] = stripPII(result[key]).sanitized;
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = sanitizePayload(result[key]);
    }
  }
  return result;
}

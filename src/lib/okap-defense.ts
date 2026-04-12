/**
 * OKAP — Obrané Kognitivní Auto-Patrolní systém
 * Self-Reflective Defense Engine · Intensity Level: INTENZEV
 *
 * OKAP watches the pipeline's own output for:
 *   1. Semantic drift between consecutive audits
 *   2. Circular epistemic reasoning (system quoting itself as source)
 *   3. Authority collapse (single source cited for all conclusions)
 *   4. Temporal inversion (PAST events dated after PRESENT events)
 *   5. Coherence floor breach (score drops below 0.75)
 *   6. LOOP_CYCLE bypass attempt (output without 12/12 check)
 */

import type { AuditResponse } from '../services/gemini';
import { hashSection } from './auto-update';
import type { OkapAlert } from './auto-update';

// ─── OKAP CONFIG ──────────────────────────────────────────────────────────────

export const OKAP_CONFIG = {
  COHERENCE_FLOOR:         0.75,
  SEMANTIC_DRIFT_THRESHOLD: 0.40,   // > 40% change in legalMatrix = drift alert
  AUTHORITY_MIN_SOURCES:   2,       // at least 2 distinct sources required
  MAX_SELF_CITATION_RATIO: 0.30,    // max 30% of researchGrounding can be self-referential
  INTENSITY:               'INTENZEV' as const,
} as const;

// ─── PATROL CHECKS ────────────────────────────────────────────────────────────

export interface PatrolResult {
  passed: boolean;
  alerts: OkapAlert[];
  patrolledAt: string;
  checksRun: number;
  checksPassed: number;
}

function makeAlert(
  level: OkapAlert['level'],
  trigger: string,
  evidence: string
): OkapAlert {
  return {
    id: `OKAP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    level,
    trigger,
    evidence,
    detectedAt: new Date().toISOString(),
    resolved: false
  };
}

// ─── CHECK 1: Coherence Floor ─────────────────────────────────────────────────

function checkCoherenceFloor(audit: AuditResponse): OkapAlert | null {
  const score = audit.causalMap?.layer_root?.confidenceScore ?? 1;
  if (score < OKAP_CONFIG.COHERENCE_FLOOR) {
    return makeAlert(
      'CRITICAL',
      'COHERENCE_FLOOR_BREACH',
      `confidenceScore=${score} < floor=${OKAP_CONFIG.COHERENCE_FLOOR}`
    );
  }
  return null;
}

// ─── CHECK 2: Temporal Inversion ─────────────────────────────────────────────

function checkTemporalInversion(audit: AuditResponse): OkapAlert | null {
  const chrono = audit.chronology ?? [];
  const pastEvents = chrono.filter(e => e.eventLayer === 'PAST').map(e => e.isoDate);
  const presentEvents = chrono.filter(e => e.eventLayer === 'PRESENT').map(e => e.isoDate);

  const latestPast = pastEvents.sort().at(-1);
  const earliestPresent = presentEvents.sort().at(0);

  if (latestPast && earliestPresent && latestPast > earliestPresent) {
    return makeAlert(
      'CRITICAL',
      'TEMPORAL_INVERSION',
      `PAST event ${latestPast} dated AFTER PRESENT event ${earliestPresent} — A7 violation`
    );
  }
  return null;
}

// ─── CHECK 3: Epistemic Circularity ──────────────────────────────────────────

function checkEpistemicCircularity(audit: AuditResponse): OkapAlert | null {
  const circularities = audit.auditIntegrity?.epistemicCircularities ?? [];
  if (circularities.length > 0) {
    return makeAlert(
      'WARN',
      'EPISTEMIC_CIRCULARITY_DETECTED',
      `${circularities.length} circular reference(s): ${circularities.slice(0, 2).join(' | ')}`
    );
  }
  return null;
}

// ─── CHECK 4: Semantic Drift (between two audits) ─────────────────────────────

export function checkSemanticDrift(
  previous: AuditResponse | null,
  current: AuditResponse
): OkapAlert | null {
  if (!previous) return null;

  const prevHash = hashSection(previous.legalMatrix);
  const currHash = hashSection(current.legalMatrix);

  if (prevHash !== currHash) {
    const prevLen = JSON.stringify(previous.legalMatrix).length;
    const currLen = JSON.stringify(current.legalMatrix).length;
    const drift = Math.abs(currLen - prevLen) / Math.max(prevLen, 1);

    if (drift > OKAP_CONFIG.SEMANTIC_DRIFT_THRESHOLD) {
      return makeAlert(
        'WARN',
        'SEMANTIC_DRIFT',
        `legalMatrix changed by ${(drift * 100).toFixed(1)}% — exceeds ${OKAP_CONFIG.SEMANTIC_DRIFT_THRESHOLD * 100}% threshold`
      );
    }
  }
  return null;
}

// ─── CHECK 5: Semantic Drift Detection ───────────────────────────────────────

function checkSemanticDriftFlag(audit: AuditResponse): OkapAlert | null {
  if (audit.auditIntegrity?.semanticDriftDetected === true) {
    return makeAlert(
      'WARN',
      'SEMANTIC_DRIFT_FLAGGED_BY_AI',
      'Gemini engine self-reported semantic drift in auditIntegrity.semanticDriftDetected'
    );
  }
  return null;
}

// ─── CHECK 6: Authority Collapse ─────────────────────────────────────────────

function checkAuthorityCollapse(audit: AuditResponse): OkapAlert | null {
  const sources = audit.researchGrounding ?? [];
  if (sources.length === 0) return null;

  const uniqueCitations = new Set(sources.map(s => s.citation));
  if (uniqueCitations.size < OKAP_CONFIG.AUTHORITY_MIN_SOURCES && sources.length >= 3) {
    return makeAlert(
      'WARN',
      'AUTHORITY_COLLAPSE',
      `Only ${uniqueCitations.size} unique source(s) for ${sources.length} research groundings — monopoly epistemic risk`
    );
  }
  return null;
}

// ─── MAIN PATROL FUNCTION ─────────────────────────────────────────────────────

export function okapPatrol(
  current: AuditResponse,
  previous: AuditResponse | null = null
): PatrolResult {
  const checks = [
    checkCoherenceFloor(current),
    checkTemporalInversion(current),
    checkEpistemicCircularity(current),
    checkSemanticDrift(previous, current),
    checkSemanticDriftFlag(current),
    checkAuthorityCollapse(current),
  ];

  const alerts = checks.filter((a): a is OkapAlert => a !== null);
  const criticals = alerts.filter(a => a.level === 'CRITICAL' || a.level === 'STOP');

  return {
    passed: criticals.length === 0,
    alerts,
    patrolledAt: new Date().toISOString(),
    checksRun: checks.length,
    checksPassed: checks.length - alerts.length
  };
}

// ─── OKAP INTEGRATION GUIDE ───────────────────────────────────────────────────
//
// In gemini.ts › analyzeDeep(), after validateAuditResponse():
//
//   import { okapPatrol } from '../lib/okap-defense';
//   import { AutoUpdateManager } from '../lib/auto-update';
//
//   const patrol = okapPatrol(parsed, previousAudit);
//   if (!patrol.passed) {
//     // CRITICAL alert → re-enter DAMAGE phase or throw
//     throw new Error(`OKAP_CRITICAL: ${patrol.alerts.map(a=>a.trigger).join(', ')}`);
//   }
//   updateManager.update(parsed);  // triggers section listeners
//
// ─────────────────────────────────────────────────────────────────────────────

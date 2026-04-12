/**
 * AUTO-UPDATE ENGINE — LEX FORENSICA v7.0
 * Self-updating section registry with diff detection and hot-reload.
 * Pattern: pull → diff → patch → re-register → notify
 */

import type { AuditResponse } from '../services/gemini';

// ─── UPDATE SECTION REGISTRY ─────────────────────────────────────────────────

export type SectionKey =
  | 'chronology'
  | 'documentationGaps'
  | 'discrepancyMatrix'
  | 'legalMatrix'
  | 'conflictOfInterestRegistry'
  | 'riskAssessment'
  | 'auditIntegrity'
  | 'escalationPlan';

export interface SectionUpdate {
  section: SectionKey;
  previousHash: string;
  newHash: string;
  changedAt: string;
  deltaSize: number;
  trigger: 'LOOP_CYCLE' | 'OKAP_DEFENSE' | 'MANUAL' | 'CRON';
}

export interface UpdateLog {
  auditId: string;
  sessionStart: string;
  updates: SectionUpdate[];
  okapAlerts: OkapAlert[];
}

// ─── HASH UTILITY ─────────────────────────────────────────────────────────────

export function hashSection(data: unknown): string {
  const str = JSON.stringify(data ?? '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

// ─── SECTION DIFFER ───────────────────────────────────────────────────────────

export function diffAudit(
  previous: Partial<AuditResponse>,
  current: AuditResponse
): SectionUpdate[] {
  const sections: SectionKey[] = [
    'chronology', 'documentationGaps', 'discrepancyMatrix',
    'legalMatrix', 'conflictOfInterestRegistry',
    'riskAssessment', 'auditIntegrity', 'escalationPlan'
  ];

  const updates: SectionUpdate[] = [];
  const now = new Date().toISOString();

  for (const section of sections) {
    const prev = (previous as any)[section];
    const curr = (current as any)[section];
    const prevHash = hashSection(prev);
    const currHash = hashSection(curr);

    if (prevHash !== currHash) {
      updates.push({
        section,
        previousHash: prevHash,
        newHash: currHash,
        changedAt: now,
        deltaSize: JSON.stringify(curr).length - JSON.stringify(prev ?? '').length,
        trigger: 'LOOP_CYCLE'
      });
    }
  }

  return updates;
}

// ─── AUTO-UPDATE MANAGER ──────────────────────────────────────────────────────

export class AutoUpdateManager {
  private log: UpdateLog;
  private snapshot: Partial<AuditResponse> = {};
  private listeners: Map<SectionKey, ((data: unknown) => void)[]> = new Map();

  constructor(auditId: string) {
    this.log = {
      auditId,
      sessionStart: new Date().toISOString(),
      updates: [],
      okapAlerts: []
    };
  }

  /** Call after each new audit result to auto-update changed sections */
  public update(current: AuditResponse): SectionUpdate[] {
    const diffs = diffAudit(this.snapshot, current);

    for (const diff of diffs) {
      this.log.updates.push(diff);
      const handlers = this.listeners.get(diff.section) ?? [];
      for (const handler of handlers) {
        handler((current as any)[diff.section]);
      }
    }

    this.snapshot = { ...current };
    return diffs;
  }

  /** Subscribe to section updates */
  public onUpdate(section: SectionKey, handler: (data: unknown) => void): void {
    const existing = this.listeners.get(section) ?? [];
    this.listeners.set(section, [...existing, handler]);
  }

  public getLog(): UpdateLog {
    return this.log;
  }

  public addOkapAlert(alert: OkapAlert): void {
    this.log.okapAlerts.push(alert);
  }
}

// ─── OKAP ALERT (used by defense system) ─────────────────────────────────────

export interface OkapAlert {
  id: string;
  level: 'WATCH' | 'WARN' | 'CRITICAL' | 'STOP';
  trigger: string;
  evidence: string;
  detectedAt: string;
  resolved: boolean;
}

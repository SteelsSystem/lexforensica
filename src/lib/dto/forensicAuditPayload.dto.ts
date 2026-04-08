/**
 * LEX FORENSICA — forensicAuditPayload DTO
 * CoC-aligned: data-agnostic, no PII field names.
 * Governs what POST /api/v1/training-pool/sync accepts.
 */

import {
  ChronologicalAnomaly,
  SemanticDistortion,
} from '../../../types';

// ─── SEMANTIC BRIDGE NODE DTO ────────────────────────────────────────────────

export interface SemanticBridgeNodeDTO {
  sourceTerm: string;        // The term as it originally appeared
  distortedTerm: string;     // The distorted / substituted form
  context: string;           // Abstract context — must be PII-stripped before submit
  distortionType: SemanticDistortion;
  validatedStatus?: 'PENDING' | 'HUMAN_VALIDATED' | 'REJECTED';
}

// ─── CAUSAL CHRONOMETER NODE DTO ─────────────────────────────────────────────

export interface CausalChronometerNodeDTO {
  gapDuration: string;       // Abstract: "45 days" — no specific identifying dates
  anomalyType: ChronologicalAnomaly;
  context: string;           // Abstract context — must be PII-stripped before submit
  validatedStatus?: 'PENDING' | 'HUMAN_VALIDATED' | 'REJECTED';
}

// ─── UNIFIED FORENSIC AUDIT PAYLOAD ──────────────────────────────────────────
// Top-level payload sent by the frontend to /api/v1/training-pool/sync

export interface ForensicAuditPayloadDTO {
  analyticalNodeId: string;                                      // Must reference existing AnalyticalNode
  nodeType: 'SEMANTIC_BRIDGE' | 'CAUSAL_CHRONOMETER';
  humanLabel: string;                                            // RLHF correction / validation label
  node: SemanticBridgeNodeDTO | CausalChronometerNodeDTO;
}

// ─── RLHF SYNC RESPONSE ──────────────────────────────────────────────────────

export interface RLHFSyncResponseDTO {
  status: 'QUEUED' | 'REJECTED';
  trainingPoolEntryId?: string;
  piiCheckPassed: boolean;
  message: string;
}

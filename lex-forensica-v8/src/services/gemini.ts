// LEX FORENSICA v8.0 — ForensicEngine Singleton
// MIND1 → DEEP_1 → LOOP_CYCLE → DEFENSE_SYNTHESIS pipeline
// Refactored to use LLM Provider Abstraction Layer

import type {
  AuditInput,
  AuditResponse,
  NormalizedEventFrame,
  FactCheckpoint,
  DefenseSynthesis,
  ChatMessage,
  LoopCycleViolation,
} from '../types';
import {
  SubscriptionTier,
  CypherState,
  InstitutionType,
  AxiomSeverity,
  OperationalAxiom,
} from '../types';
import {
  MIND1_PROMPT,
  DEEP1_PROMPT,
  DEFENSE_PROMPT,
  ASSISTANT_PROMPT_CS,
  ASSISTANT_PROMPT_EN,
  ASSISTANT_PROMPT_DE,
} from '../lib/prompts';
import { hashFact } from './crypto';
import { ForensicNLP } from './nlp-core';
import { verifySecretCore, SECRET_CORE } from '../lib/constants';
import { resolvePhase, registry } from './llm';
import type { LLMGenerationConfig, ChatTurn } from './llm';

// Suppress unused enum import warnings — these are re-exported via the module boundary
// and referenced in prompt templates at runtime.
void SubscriptionTier;
void CypherState;
void InstitutionType;
void AxiomSeverity;
void OperationalAxiom;

class ForensicEngine {
  private static instance: ForensicEngine;
  private nlp: ForensicNLP;

  private constructor() {
    this.nlp = ForensicNLP.getInstance();
  }

  static getInstance(): ForensicEngine {
    if (!ForensicEngine.instance) {
      ForensicEngine.instance = new ForensicEngine();
    }
    return ForensicEngine.instance;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN PIPELINE: MIND1 → DEEP_1 → LOOP_CYCLE → DEFENSE_SYNTHESIS
  // ─────────────────────────────────────────────────────────────────────────────

  async analyzeDeep(input: AuditInput, _tier: SubscriptionTier): Promise<AuditResponse> {
    const startMs = Date.now();

    // 0. SECRET CORE VERIFICATION — STOP_SERVER gate
    //    If core invariants are tampered, refuse to generate output.
    if (!verifySecretCore()) {
      const scaffold = this.buildScaffoldAudit(input);
      scaffold.auditIntegrity.flagsRaised.push(SECRET_CORE.STOP_SERVER.FLAG_CODE);
      scaffold.humanIntervention.required = true;
      scaffold.humanIntervention.reason =
        SECRET_CORE.STOP_SERVER.REFUSAL_TEMPLATE.replace(
          '{{REASON}}',
          'PIPELINE_SEAL_MISMATCH — SECRET_CORE integrity check failed',
        );
      return scaffold;
    }

    // 1. Phase 1 — MIND1: extract normalized event frames
    const frames = await this.extractFrames(
      input.inputA,
      input.inputB,
      input.language,
      input.institutionType
    );

    // 1.5 Pipeline Hash — chain-of-custody proof (MIND1 output integrity)
    const mind1OutputHash = await hashFact(JSON.stringify(frames));

    // 2. Build IMMUTABLE_ANCHORS from STRONG frames (resolves BLOCKER-04 / CG-10)
    const checkpoints = await this.buildFactCheckpoints(frames);

    // 3. Phase 2 — DEEP_1: run full forensic analysis
    let audit = await this.runDeepAnalysis(frames, checkpoints, input, _tier);

    // 4. Phase 3 — LOOP_CYCLE: programmatic integrity validation
    //    If CRITICAL violations are found, re-run DEEP_1 up to 2 times
    const MAX_LOOP_RETRIES = 2;
    for (let attempt = 0; attempt < MAX_LOOP_RETRIES; attempt++) {
      const violations = this.runLoopCycleValidation(audit, input.inputA, input.inputB);
      const hasCritical = violations.some((v) => v.severity === AxiomSeverity.CRITICAL);

      if (!hasCritical) break;

      // Log violations into audit integrity before re-running
      audit.auditIntegrity.loopCycleLog.push(
        ...violations.map((v) => `[LOOP_CYCLE attempt ${attempt + 1}] ${v.axiom}: ${v.message}`)
      );

      audit = await this.runDeepAnalysis(frames, checkpoints, input, _tier);
    }

    // Final LOOP_CYCLE pass — record any remaining violations
    const finalViolations = this.runLoopCycleValidation(audit, input.inputA, input.inputB);
    if (finalViolations.length > 0) {
      audit.auditIntegrity.loopCycleLog.push(
        ...finalViolations.map((v) => `[FINAL] ${v.axiom}: ${v.message}`)
      );
      audit.auditIntegrity.flagsRaised.push(
        ...finalViolations.map((v) => `${v.severity}::${v.axiom}`)
      );
    }

    // 5. Phase 4 — DEFENSE_SYNTHESIS (resolves BLOCKER-03)
    const defense = await this.synthesizeDefense(audit, frames, checkpoints);
    audit.defenseSynthesis = defense;

    // 6. Stamp final processing time, cypher state, and pipeline hashes
    audit.meta.processingTimeMs = Date.now() - startMs;
    audit.meta.cypherState = CypherState.DEFENSE_SYNTHESIS;
    audit.meta.timestamp = new Date().toISOString();
    // Pipeline chain-of-custody hashes (v8.1)
    (audit.meta as Record<string, unknown>).pipelineHashes = {
      mind1Output: mind1OutputHash,
    };

    return audit;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Phase 1: MIND1 — resolved via ProviderRegistry (default: gemini-2.5-flash)
  // ─────────────────────────────────────────────────────────────────────────────

  private async extractFrames(
    inputA: string,
    inputB: string,
    language: string,
    institutionType: InstitutionType
  ): Promise<NormalizedEventFrame[]> {
    const prompt = MIND1_PROMPT
      .replace('{{INPUT_A}}', inputA)
      .replace('{{INPUT_B}}', inputB)
      .replace('{{LANGUAGE}}', language)
      .replace('{{INSTITUTION_TYPE}}', institutionType);

    const { provider, model, configOverrides } = resolvePhase('mind1');

    const config: LLMGenerationConfig = {
      temperature: 0.1,
      ...configOverrides,
    };

    return this.withRetry(async () => {
      // Try structured generation if provider supports it
      if (provider.supports(model, 'structured_output')) {
        try {
          const response = await provider.generateStructured<NormalizedEventFrame[]>(
            prompt,
            model,
            config
          );
          registry.emit({
            type: 'response',
            provider: provider.id,
            model,
            pipelinePhase: 'mind1',
            timestamp: Date.now(),
            latencyMs: response.latencyMs,
            usage: response.usage,
          });
          if (Array.isArray(response.data)) {
            return response.data;
          }
          const dataAny = response.data as unknown;
          if (dataAny && typeof dataAny === 'object' && 'frames' in dataAny) {
            return (dataAny as { frames: NormalizedEventFrame[] }).frames;
          }
          return [];
        } catch {
          // Fallback to text generation + JSON parse
        }
      }

      // Fallback: generate text and parse JSON
      const response = await provider.generateText(prompt, model, config);
      registry.emit({
        type: 'response',
        provider: provider.id,
        model,
        pipelinePhase: 'mind1',
        timestamp: Date.now(),
        latencyMs: response.latencyMs,
        usage: response.usage,
      });

      const text = response.text;
      try {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? null;
        const raw = jsonMatch ? jsonMatch[1] : text;
        const parsed = JSON.parse(raw.trim()) as unknown;
        if (Array.isArray(parsed)) {
          return parsed as NormalizedEventFrame[];
        }
        if (parsed && typeof parsed === 'object' && 'frames' in parsed) {
          return (parsed as { frames: NormalizedEventFrame[] }).frames;
        }
        return [];
      } catch {
        console.warn('[MIND1] JSON parse failure; returning empty frames array');
        return [];
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Build IMMUTABLE_ANCHORS from STRONG frames (resolves BLOCKER-04 / CG-10)
  // ─────────────────────────────────────────────────────────────────────────────

  private async buildFactCheckpoints(frames: NormalizedEventFrame[]): Promise<FactCheckpoint[]> {
    const strongFrames = frames.filter((f) => f.evidentiaryStrength === 'STRONG');

    const checkpoints: FactCheckpoint[] = await Promise.all(
      strongFrames.map(async (frame) => {
        const factString = `${frame.actor} ${frame.predicate} ${frame.object}`;
        const hash = await hashFact(factString);

        const checkpoint: FactCheckpoint = {
          id: `chk_${frame.id}`,
          frameRef: frame.id,
          date: frame.date ?? 'UNKNOWN',
          fact: factString,
          source: frame.source,
          hash,
          locked: true,
        };

        return checkpoint;
      })
    );

    return checkpoints;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Phase 2: DEEP_1 — resolved via ProviderRegistry (default: gemini-3.1-pro-preview)
  // ─────────────────────────────────────────────────────────────────────────────

  private async runDeepAnalysis(
    frames: NormalizedEventFrame[],
    checkpoints: FactCheckpoint[],
    input: AuditInput,
    _tier: SubscriptionTier
  ): Promise<AuditResponse> {
    const prompt = DEEP1_PROMPT
      .replace('{{INPUT_A}}', input.inputA)
      .replace('{{INPUT_B}}', input.inputB)
      .replace('{{LANGUAGE}}', input.language)
      .replace('{{INSTITUTION_TYPE}}', input.institutionType)
      .replace('{{TIER}}', _tier)
      .replace('{{FRAMES_JSON}}', JSON.stringify(frames, null, 2))
      .replace('{{CHECKPOINTS_JSON}}', JSON.stringify(checkpoints, null, 2));

    // Placeholder guard — catch any unresolved template keys
    const unresolvedKeys = prompt.match(/\{\{[A-Z_]+\}\}/g);
    if (unresolvedKeys) {
      console.warn(`[DEEP_1] Unresolved placeholders in prompt: ${unresolvedKeys.join(', ')}`);
    }

    const { provider, model, configOverrides } = resolvePhase('deep1');

    const config: LLMGenerationConfig = {
      thinkingLevel: 'HIGH',
      tools: [{ type: 'web_search' }],
      ...configOverrides,
    };

    return this.withRetry(async () => {
      // Try structured generation first
      if (provider.supports(model, 'structured_output')) {
        try {
          const response = await provider.generateStructured<AuditResponse>(
            prompt,
            model,
            config
          );
          registry.emit({
            type: 'response',
            provider: provider.id,
            model,
            pipelinePhase: 'deep1',
            timestamp: Date.now(),
            latencyMs: response.latencyMs,
            usage: response.usage,
          });
          return response.data;
        } catch {
          // Fallback to text generation
        }
      }

      // Fallback: text generation + parse
      const response = await provider.generateText(prompt, model, config);
      registry.emit({
        type: 'response',
        provider: provider.id,
        model,
        pipelinePhase: 'deep1',
        timestamp: Date.now(),
        latencyMs: response.latencyMs,
        usage: response.usage,
      });

      const text = response.text;
      try {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? null;
        const raw = jsonMatch ? jsonMatch[1] : text;
        return JSON.parse(raw.trim()) as AuditResponse;
      } catch {
        console.error('[DEEP_1] JSON parse failure; returning minimal scaffold');
        return this.buildScaffoldAudit(input);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Phase 3: LOOP_CYCLE — programmatic validation via ForensicNLP
  // ─────────────────────────────────────────────────────────────────────────────

  private runLoopCycleValidation(
    audit: AuditResponse,
    inputA: string,
    inputB: string
  ): LoopCycleViolation[] {
    return this.nlp.verifyIntegrity(audit, inputA, inputB);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Phase 4: DEFENSE_SYNTHESIS — resolved via ProviderRegistry
  // ─────────────────────────────────────────────────────────────────────────────

  private async synthesizeDefense(
    audit: AuditResponse,
    frames: NormalizedEventFrame[],
    checkpoints: FactCheckpoint[]
  ): Promise<DefenseSynthesis> {
    const prompt = DEFENSE_PROMPT
      .replace('{{AUDIT_JSON}}', JSON.stringify(audit, null, 2))
      .replace('{{FRAMES_JSON}}', JSON.stringify(frames, null, 2))
      .replace('{{CHECKPOINTS_JSON}}', JSON.stringify(checkpoints, null, 2));

    const { provider, model, configOverrides } = resolvePhase('defense');

    const config: LLMGenerationConfig = {
      thinkingLevel: 'HIGH',
      tools: [{ type: 'web_search' }],
      ...configOverrides,
    };

    return this.withRetry(async () => {
      if (provider.supports(model, 'structured_output')) {
        try {
          const response = await provider.generateStructured<DefenseSynthesis>(
            prompt,
            model,
            config
          );
          registry.emit({
            type: 'response',
            provider: provider.id,
            model,
            pipelinePhase: 'defense',
            timestamp: Date.now(),
            latencyMs: response.latencyMs,
            usage: response.usage,
          });
          return response.data;
        } catch {
          // Fallback
        }
      }

      const response = await provider.generateText(prompt, model, config);
      registry.emit({
        type: 'response',
        provider: provider.id,
        model,
        pipelinePhase: 'defense',
        timestamp: Date.now(),
        latencyMs: response.latencyMs,
        usage: response.usage,
      });

      const text = response.text;
      try {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? null;
        const raw = jsonMatch ? jsonMatch[1] : text;
        return JSON.parse(raw.trim()) as DefenseSynthesis;
      } catch {
        console.error('[DEFENSE_SYNTHESIS] JSON parse failure; returning empty synthesis');
        return this.buildEmptyDefenseSynthesis();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Chat assistant — resolved via ProviderRegistry (default: gemini-2.5-flash)
  // ─────────────────────────────────────────────────────────────────────────────

  async chatWithAssistant(
    message: string,
    history: ChatMessage[],
    auditContext: AuditResponse | null,
    language: 'cs' | 'en' | 'de'
  ): Promise<string> {
    // Select system prompt based on language
    const systemPromptMap: Record<'cs' | 'en' | 'de', string> = {
      cs: ASSISTANT_PROMPT_CS,
      en: ASSISTANT_PROMPT_EN,
      de: ASSISTANT_PROMPT_DE,
    };
    let systemPrompt = systemPromptMap[language];

    // Append audit context summary if available
    if (auditContext !== null) {
      const contextSummary = [
        `\n\n--- CURRENT AUDIT CONTEXT ---`,
        `Risk Level: ${auditContext.riskAssessment.overallRiskLevel}`,
        `Risk Score: ${auditContext.riskAssessment.riskScore}`,
        `Institution: ${auditContext.meta.institutionType}`,
        `Discrepancies found: ${auditContext.discrepancyMatrix.length}`,
        `Legal violations: ${auditContext.legalMatrix.length}`,
        `Axiomatic violations: ${auditContext.axiomaticViolations.length}`,
        `Primary concerns: ${auditContext.riskAssessment.primaryConcerns.slice(0, 3).join('; ')}`,
        `--- END CONTEXT ---`,
      ].join('\n');
      systemPrompt += contextSummary;
    }

    // Convert ChatMessage[] to ChatTurn[] for the provider
    const chatTurns: ChatTurn[] = [];
    for (const msg of history) {
      chatTurns.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }
    chatTurns.push({ role: 'user', content: message });

    const { provider, model, configOverrides } = resolvePhase('assistant');

    const config: LLMGenerationConfig = {
      temperature: 0.7,
      ...configOverrides,
    };

    return this.withRetry(async () => {
      const response = await provider.chat(chatTurns, systemPrompt, model, config);
      registry.emit({
        type: 'response',
        provider: provider.id,
        model,
        pipelinePhase: 'assistant',
        timestamp: Date.now(),
        latencyMs: response.latencyMs,
        usage: response.usage,
      });
      return response.text;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Retry logic — exponential backoff, max 3 retries
  // ─────────────────────────────────────────────────────────────────────────────

  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        registry.emit({
          type: 'retry',
          provider: 'unknown',
          model: 'unknown',
          pipelinePhase: 'mind1',
          timestamp: Date.now(),
          error: err instanceof Error ? err.message : String(err),
        });
        if (attempt < maxRetries - 1) {
          const delayMs = 1000 * Math.pow(2, attempt);
          await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Internal scaffolding helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private buildScaffoldAudit(input: AuditInput): AuditResponse {
    return {
      meta: {
        version: '8.0.0',
        timestamp: new Date().toISOString(),
        institutionType: input.institutionType,
        language: input.language,
        cypherState: CypherState.DEEP1_FORENSIC_REASONING,
        processingTimeMs: 0,
      },
      auditMetrics: {
        totalEntitiesExtracted: 0,
        temporalCoverage: { startDate: '', endDate: '' },
        inputAWordCount: input.inputA.split(/\s+/).length,
        inputBWordCount: input.inputB.split(/\s+/).length,
        crossReferenceHits: 0,
      },
      riskAssessment: {
        overallRiskLevel: 'LOW',
        riskScore: 0,
        primaryConcerns: [],
        immediateActions: [],
      },
      causalMap: { layers: [] },
      chronology: [],
      documentationGaps: [],
      discrepancyMatrix: [],
      legalMatrix: [],
      axiomaticViolations: [],
      semanticDriftTimeline: [],
      auditIntegrity: {
        overallCoherenceScore: 0,
        flagsRaised: ['PARSE_FAILURE::DEEP_1'],
        semanticDriftDetected: false,
        linguisticMode: 'MECHANICAL_EN' as AuditResponse['auditIntegrity']['linguisticMode'],
        epistemicCircularities: [],
        loopCycleLog: [],
      },
      defenseSynthesis: this.buildEmptyDefenseSynthesis(),
      remediationPatches: [],
      humanIntervention: {
        required: true,
        reason: 'Automated analysis failed to parse structured output. Manual review required.',
        suggestedExpert: 'Legal forensic specialist',
      },
    };
  }

  private buildEmptyDefenseSynthesis(): DefenseSynthesis {
    return {
      summary: '',
      echrArticles: [],
      crpdProvisions: [],
      counterArguments: [],
      recommendedActions: [],
      legalBriefDraft: '',
    };
  }
}

export const forensicEngine = ForensicEngine.getInstance();

/**
 * LLM Provider Abstraction Layer — Type Definitions
 * 
 * Enables swappable LLM backends across the forensic pipeline.
 * Each pipeline phase (MIND1, DEEP_1, Defense, Assistant) can use
 * a different provider without modifying ForensicEngine internals.
 */

// ─── Provider Interface ────────────────────────────────────────

export interface LLMProvider {
  /** Unique provider identifier (e.g., 'gemini', 'openai', 'anthropic', 'local') */
  readonly id: string;
  /** Human-readable name */
  readonly name: string;
  /** Available models for this provider */
  readonly availableModels: string[];

  /**
   * Generate structured JSON output matching a schema.
   * Used by MIND1 (NormalizedEventFrame[]) and DEEP_1 (AuditResponse).
   */
  generateStructured<T = unknown>(
    prompt: string,
    model: string,
    config: LLMGenerationConfig
  ): Promise<LLMStructuredResponse<T>>;

  /**
   * Generate free-form text output.
   * Used by Defense Synthesis and fallback paths.
   */
  generateText(
    prompt: string,
    model: string,
    config: LLMGenerationConfig
  ): Promise<LLMTextResponse>;

  /**
   * Multi-turn chat with system prompt.
   * Used by the Assistant persona.
   */
  chat(
    messages: ChatTurn[],
    systemPrompt: string,
    model: string,
    config: LLMGenerationConfig
  ): Promise<LLMTextResponse>;

  /**
   * Check if a specific model supports a capability.
   * Allows ForensicEngine to adapt behavior per provider.
   */
  supports(model: string, capability: LLMCapability): boolean;
}

// ─── Configuration ─────────────────────────────────────────────

export interface LLMGenerationConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  thinkingLevel?: ThinkingLevel;
  tools?: LLMTool[];
  responseSchema?: Record<string, unknown>;
  responseMimeType?: string;
  /** Provider-specific overrides (escape hatch) */
  providerOptions?: Record<string, unknown>;
}

export type ThinkingLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface LLMTool {
  type: LLMToolType;
  config?: Record<string, unknown>;
}

export type LLMToolType = 
  | 'web_search'       // Google Search, Bing, etc.
  | 'code_execution'   // Sandboxed code execution
  | 'retrieval'        // RAG / document retrieval
  | 'custom';          // Provider-specific tools

export type LLMCapability =
  | 'structured_output'   // Can enforce JSON schema
  | 'thinking'            // Supports thinking/reasoning mode
  | 'web_search'          // Has web search tool
  | 'code_execution'      // Can execute code
  | 'vision'              // Can process images
  | 'long_context'        // >100k token context
  | 'streaming';          // Supports streaming responses

// ─── Response Types ────────────────────────────────────────────

export interface LLMStructuredResponse<T = unknown> {
  data: T;
  raw: string;
  usage: LLMUsage;
  provider: string;
  model: string;
  latencyMs: number;
}

export interface LLMTextResponse {
  text: string;
  usage: LLMUsage;
  provider: string;
  model: string;
  latencyMs: number;
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  /** Provider-specific cost estimate if available */
  estimatedCost?: number;
}

// ─── Chat Types ────────────────────────────────────────────────

export interface ChatTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ─── Pipeline Configuration ────────────────────────────────────

/**
 * Defines which provider + model handles each pipeline phase.
 * Allows mixing providers: e.g., Gemini Flash for MIND1,
 * Claude for DEEP_1, GPT for Assistant.
 */
export interface PipelineConfig {
  mind1: PipelineSlot;
  deep1: PipelineSlot;
  defense: PipelineSlot;
  assistant: PipelineSlot;
}

export interface PipelineSlot {
  provider: string;   // Provider ID from ProviderRegistry
  model: string;      // Model identifier
  /** Override generation config for this slot */
  configOverrides?: Partial<LLMGenerationConfig>;
}

/**
 * Default pipeline configuration — all Gemini.
 * Override per-slot to mix providers.
 */
export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  mind1: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    configOverrides: { temperature: 0.1 },
  },
  deep1: {
    provider: 'gemini',
    model: 'gemini-3.1-pro-preview',
    configOverrides: {
      thinkingLevel: 'HIGH',
      tools: [{ type: 'web_search' }],
    },
  },
  defense: {
    provider: 'gemini',
    model: 'gemini-3.1-pro-preview',
    configOverrides: {
      thinkingLevel: 'HIGH',
      tools: [{ type: 'web_search' }],
    },
  },
  assistant: {
    provider: 'gemini',
    model: 'gemini-3.1-pro-preview',
    configOverrides: { temperature: 0.7 },
  },
};

// ─── Provider Events (for monitoring/logging) ──────────────────

export interface LLMEvent {
  type: 'request' | 'response' | 'error' | 'retry';
  provider: string;
  model: string;
  pipelinePhase: keyof PipelineConfig;
  timestamp: number;
  latencyMs?: number;
  usage?: LLMUsage;
  error?: string;
}

export type LLMEventHandler = (event: LLMEvent) => void;

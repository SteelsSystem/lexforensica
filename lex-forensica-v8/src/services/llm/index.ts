/**
 * LLM Provider Layer — Entry Point
 * 
 * Initializes the provider registry with default providers.
 * Import this module early in the app bootstrap to ensure
 * providers are registered before ForensicEngine needs them.
 * 
 * Usage:
 *   import { initializeLLM, registry } from '@/services/llm';
 *   initializeLLM(geminiApiKey);
 * 
 * Adding a new provider:
 *   1. Create my-provider.ts implementing LLMProvider
 *   2. Register it: registry.register(new MyProvider(apiKey));
 *   3. Assign to pipeline: registry.setPipelineConfig({ deep1: { provider: 'my-provider', model: '...' } });
 */

export type {
  LLMProvider,
  LLMGenerationConfig,
  LLMStructuredResponse,
  LLMTextResponse,
  LLMUsage,
  LLMCapability,
  LLMTool,
  LLMToolType,
  ChatTurn,
  ThinkingLevel,
  PipelineConfig,
  PipelineSlot,
  LLMEvent,
  LLMEventHandler,
} from './types';

export { DEFAULT_PIPELINE_CONFIG } from './types';
export { ProviderRegistry } from './provider-registry';
export { GeminiProvider } from './gemini-provider';

// ─── Convenience Accessors ─────────────────────────────────────

import { ProviderRegistry } from './provider-registry';
import { GeminiProvider } from './gemini-provider';

/** Global registry singleton */
export const registry = ProviderRegistry.getInstance();

/**
 * Initialize the LLM layer with default providers.
 * Call once during app startup.
 */
export function initializeLLM(geminiApiKey?: string): void {
  // Register Gemini if an API key is provided
  if (geminiApiKey) {
    registry.register(new GeminiProvider(geminiApiKey));
  }
  
  // Pipeline config uses defaults (all Gemini) — see types.ts DEFAULT_PIPELINE_CONFIG
  // To override: registry.setPipelineConfig({ mind1: { provider: 'other', model: '...' } });
}

/**
 * Resolve provider + model for a pipeline phase.
 * Shorthand used by ForensicEngine.
 */
export function resolvePhase(phase: 'mind1' | 'deep1' | 'defense' | 'assistant') {
  return registry.resolvePhase(phase);
}

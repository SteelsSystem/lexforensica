/**
 * LLM Provider Registry — Singleton
 * 
 * Central registry for all LLM providers. ForensicEngine resolves
 * providers by ID through this registry.
 */

import type { LLMProvider, LLMEventHandler, LLMEvent, PipelineConfig } from './types';
import { DEFAULT_PIPELINE_CONFIG } from './types';

class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, LLMProvider> = new Map();
  private eventHandlers: LLMEventHandler[] = [];
  private pipelineConfig: PipelineConfig = DEFAULT_PIPELINE_CONFIG;

  private constructor() {}

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  // ─── Provider Management ───────────────────────────────────

  /**
   * Register a new LLM provider.
   * Duplicate IDs overwrite the previous provider (allows hot-swap).
   */
  register(provider: LLMProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Get a provider by ID. Throws if not registered.
   */
  get(id: string): LLMProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(
        `LLM provider "${id}" not registered. Available: [${this.listProviders().join(', ')}]`
      );
    }
    return provider;
  }

  /**
   * Check if a provider is registered.
   */
  has(id: string): boolean {
    return this.providers.has(id);
  }

  /**
   * List all registered provider IDs.
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Remove a provider.
   */
  unregister(id: string): boolean {
    return this.providers.delete(id);
  }

  // ─── Pipeline Configuration ────────────────────────────────

  /**
   * Get the current pipeline configuration.
   */
  getPipelineConfig(): PipelineConfig {
    return { ...this.pipelineConfig };
  }

  /**
   * Update pipeline configuration.
   * Merges with existing config — only overrides specified slots.
   */
  setPipelineConfig(config: Partial<PipelineConfig>): void {
    this.pipelineConfig = { ...this.pipelineConfig, ...config };
    
    // Validate all referenced providers exist
    for (const [phase, slot] of Object.entries(this.pipelineConfig)) {
      if (!this.has(slot.provider)) {
        console.warn(
          `Pipeline phase "${phase}" references unregistered provider "${slot.provider}". ` +
          `Register it before calling ForensicEngine.`
        );
      }
    }
  }

  /**
   * Resolve provider + model for a pipeline phase.
   * Used by ForensicEngine to get the right provider for each step.
   */
  resolvePhase(phase: keyof PipelineConfig): {
    provider: LLMProvider;
    model: string;
    configOverrides?: Partial<import('./types').LLMGenerationConfig>;
  } {
    const slot = this.pipelineConfig[phase];
    return {
      provider: this.get(slot.provider),
      model: slot.model,
      configOverrides: slot.configOverrides,
    };
  }

  // ─── Event System ──────────────────────────────────────────

  /**
   * Subscribe to LLM events (for monitoring, logging, cost tracking).
   * Returns unsubscribe function.
   */
  onEvent(handler: LLMEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Emit an event to all subscribers.
   */
  emit(event: LLMEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (err) {
        console.error('LLM event handler error:', err);
      }
    }
  }

  // ─── Diagnostics ───────────────────────────────────────────

  /**
   * Get a diagnostic summary of the registry state.
   */
  diagnostics(): {
    providers: Array<{ id: string; name: string; models: string[] }>;
    pipeline: PipelineConfig;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    for (const [phase, slot] of Object.entries(this.pipelineConfig)) {
      if (!this.has(slot.provider)) {
        warnings.push(`Phase "${phase}": provider "${slot.provider}" not registered`);
      } else {
        const provider = this.get(slot.provider);
        if (!provider.availableModels.includes(slot.model)) {
          warnings.push(
            `Phase "${phase}": model "${slot.model}" not in ${slot.provider}'s available models`
          );
        }
      }
    }

    return {
      providers: Array.from(this.providers.values()).map(p => ({
        id: p.id,
        name: p.name,
        models: p.availableModels,
      })),
      pipeline: this.pipelineConfig,
      warnings,
    };
  }
}

export { ProviderRegistry };

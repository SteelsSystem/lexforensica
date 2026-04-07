/**
 * Gemini LLM Provider — Implements LLMProvider for Google GenAI SDK
 * 
 * All Gemini-specific code is isolated here. ForensicEngine never
 * touches the Gemini SDK directly — it goes through this provider.
 */

import { GoogleGenAI, type GenerateContentConfig } from '@google/genai';
import type {
  LLMProvider,
  LLMGenerationConfig,
  LLMStructuredResponse,
  LLMTextResponse,
  LLMUsage,
  LLMCapability,
  ChatTurn,
  ThinkingLevel,
} from './types';

// ─── Gemini-specific mappings ──────────────────────────────────

const THINKING_LEVEL_MAP: Record<ThinkingLevel, string> = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const CAPABILITY_MAP: Record<string, Set<LLMCapability>> = {
  'gemini-2.5-flash': new Set([
    'structured_output', 'thinking', 'web_search',
    'code_execution', 'vision', 'long_context', 'streaming',
  ]),
  'gemini-3.1-pro-preview': new Set([
    'structured_output', 'thinking', 'web_search',
    'code_execution', 'vision', 'long_context', 'streaming',
  ]),
  'gemini-2.5-pro': new Set([
    'structured_output', 'thinking', 'web_search',
    'code_execution', 'vision', 'long_context', 'streaming',
  ]),
};

// ─── Provider Implementation ───────────────────────────────────

class GeminiProvider implements LLMProvider {
  readonly id = 'gemini';
  readonly name = 'Google Gemini';
  readonly availableModels = [
    'gemini-2.5-flash',
    'gemini-3.1-pro-preview',
    'gemini-2.5-pro',
  ];

  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  supports(model: string, capability: LLMCapability): boolean {
    return CAPABILITY_MAP[model]?.has(capability) ?? false;
  }

  async generateStructured<T = unknown>(
    prompt: string,
    model: string,
    config: LLMGenerationConfig
  ): Promise<LLMStructuredResponse<T>> {
    const startTime = Date.now();

    const geminiConfig = this.buildConfig(config);

    // Force JSON output for structured generation
    geminiConfig.responseMimeType = 'application/json';
    if (config.responseSchema) {
      geminiConfig.responseSchema = config.responseSchema;
    }

    const response = await this.client.models.generateContent({
      model,
      contents: prompt,
      config: geminiConfig,
    });

    const text = response.text ?? '';
    const latencyMs = Date.now() - startTime;

    let data: T;
    try {
      data = JSON.parse(text) as T;
    } catch {
      throw new Error(
        `Gemini structured output parse error for model ${model}. ` +
        `Raw response: ${text.substring(0, 500)}`
      );
    }

    return {
      data,
      raw: text,
      usage: this.extractUsage(response),
      provider: this.id,
      model,
      latencyMs,
    };
  }

  async generateText(
    prompt: string,
    model: string,
    config: LLMGenerationConfig
  ): Promise<LLMTextResponse> {
    const startTime = Date.now();
    const geminiConfig = this.buildConfig(config);

    const response = await this.client.models.generateContent({
      model,
      contents: prompt,
      config: geminiConfig,
    });

    return {
      text: response.text ?? '',
      usage: this.extractUsage(response),
      provider: this.id,
      model,
      latencyMs: Date.now() - startTime,
    };
  }

  async chat(
    messages: ChatTurn[],
    systemPrompt: string,
    model: string,
    config: LLMGenerationConfig
  ): Promise<LLMTextResponse> {
    const startTime = Date.now();
    const geminiConfig = this.buildConfig(config);
    geminiConfig.systemInstruction = systemPrompt;

    // Convert ChatTurn[] to Gemini content format
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await this.client.models.generateContent({
      model,
      contents: contents as any,
      config: geminiConfig,
    });

    return {
      text: response.text ?? '',
      usage: this.extractUsage(response),
      provider: this.id,
      model,
      latencyMs: Date.now() - startTime,
    };
  }

  // ─── Private Helpers ─────────────────────────────────────────

  private buildConfig(config: LLMGenerationConfig): GenerateContentConfig {
    const geminiConfig: GenerateContentConfig = {};

    if (config.temperature !== undefined) {
      geminiConfig.temperature = config.temperature;
    }
    if (config.maxOutputTokens !== undefined) {
      geminiConfig.maxOutputTokens = config.maxOutputTokens;
    }
    if (config.topP !== undefined) {
      geminiConfig.topP = config.topP;
    }
    if (config.topK !== undefined) {
      geminiConfig.topK = config.topK;
    }

    // Thinking level (Gemini-specific)
    if (config.thinkingLevel && config.thinkingLevel !== 'NONE') {
      geminiConfig.thinkingConfig = {
        thinkingLevel: THINKING_LEVEL_MAP[config.thinkingLevel],
      } as any;
    }

    // Tools
    if (config.tools?.length) {
      geminiConfig.tools = config.tools.map(tool => {
        switch (tool.type) {
          case 'web_search':
            return { googleSearch: {} } as any;
          case 'code_execution':
            return { codeExecution: {} } as any;
          default:
            return tool.config ?? {};
        }
      });
    }

    // Response format
    if (config.responseMimeType) {
      geminiConfig.responseMimeType = config.responseMimeType;
    }

    // Provider-specific escape hatch
    if (config.providerOptions) {
      Object.assign(geminiConfig, config.providerOptions);
    }

    return geminiConfig;
  }

  private extractUsage(response: any): LLMUsage {
    const usage = response.usageMetadata;
    return {
      promptTokens: usage?.promptTokenCount ?? 0,
      completionTokens: usage?.candidatesTokenCount ?? 0,
      totalTokens: usage?.totalTokenCount ?? 0,
    };
  }
}

export { GeminiProvider };

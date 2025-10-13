/**
 * Token Counter - Accurate token counting across different AI providers
 */

import { encoding_for_model, get_encoding } from 'tiktoken';
import type { TiktokenModel } from 'tiktoken';
import type { TokenUsage } from './types.js';

export class TokenCounter {
  private encoders: Map<string, ReturnType<typeof get_encoding>> = new Map();

  /**
   * Count tokens for a given text and model
   */
  async countTokens(text: string, model: string): Promise<number> {
    try {
      // Try to get model-specific encoder
      const encoder = this.getEncoder(model);
      const tokens = encoder.encode(text);
      return tokens.length;
    } catch (error) {
      // Fallback to cl100k_base (GPT-4 encoding)
      return this.estimateTokens(text);
    }
  }

  /**
   * Count tokens for messages (chat format)
   */
  async countMessageTokens(
    messages: Array<{ role: string; content: string }>,
    model: string
  ): Promise<number> {
    let totalTokens = 0;

    // Add tokens for each message
    for (const message of messages) {
      // Count tokens for role and content
      totalTokens += await this.countTokens(message.role, model);
      totalTokens += await this.countTokens(message.content, model);

      // Add overhead tokens per message (varies by model)
      totalTokens += this.getMessageOverhead(model);
    }

    // Add tokens for message formatting
    totalTokens += this.getFormattingOverhead(model);

    return totalTokens;
  }

  /**
   * Estimate tokens when exact counting is not available
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    // This is conservative and tends to overestimate
    return Math.ceil(text.length / 4);
  }

  /**
   * Get encoder for a specific model
   */
  private getEncoder(model: string): ReturnType<typeof get_encoding> {
    // Check cache first
    if (this.encoders.has(model)) {
      return this.encoders.get(model)!;
    }

    let encoder: ReturnType<typeof get_encoding>;

    // Map model names to tiktoken models
    const modelMapping: Record<string, TiktokenModel> = {
      'gpt-4': 'gpt-4',
      'gpt-4-turbo': 'gpt-4',
      'gpt-4o': 'gpt-4o',
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
    };

    // Get appropriate encoder
    const tiktokenModel = modelMapping[model];
    if (tiktokenModel) {
      encoder = encoding_for_model(tiktokenModel);
    } else {
      // Default to cl100k_base for unknown models (Claude, etc.)
      encoder = get_encoding('cl100k_base');
    }

    // Cache the encoder
    this.encoders.set(model, encoder);

    return encoder;
  }

  /**
   * Get message overhead tokens for a model
   */
  private getMessageOverhead(model: string): number {
    // Different models have different overhead per message
    if (model.includes('gpt-4') || model.includes('gpt-3.5')) {
      return 3; // <|start|>role<|end|>\n
    }
    if (model.includes('claude')) {
      return 4; // Claude has slightly more overhead
    }
    return 3; // Default
  }

  /**
   * Get formatting overhead tokens for a model
   */
  private getFormattingOverhead(model: string): number {
    // Tokens for conversation-level formatting
    if (model.includes('gpt')) {
      return 3; // <|start|>assistant<|message|>
    }
    return 2; // Default
  }

  /**
   * Calculate token usage from API response
   */
  parseUsageFromResponse(response: any, model: string): TokenUsage {
    const timestamp = new Date();
    
    // Handle different provider response formats
    if (response.usage) {
      // OpenAI/Anthropic format
      return {
        model,
        inputTokens: response.usage.prompt_tokens || 0,
        outputTokens: response.usage.completion_tokens || 0,
        totalTokens: response.usage.total_tokens || 0,
        timestamp,
      };
    }

    // Handle streaming responses
    if (response.token_count) {
      return {
        model,
        inputTokens: response.token_count.input || 0,
        outputTokens: response.token_count.output || 0,
        totalTokens:
          (response.token_count.input || 0) + (response.token_count.output || 0),
        timestamp,
      };
    }

    // Return zeros if no usage data
    return {
      model,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      timestamp,
    };
  }

  /**
   * Clean up encoders
   */
  dispose(): void {
    for (const encoder of this.encoders.values()) {
      encoder.free();
    }
    this.encoders.clear();
  }
}
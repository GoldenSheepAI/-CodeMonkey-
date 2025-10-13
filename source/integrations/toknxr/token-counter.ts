/**
 * Token Counter - Accurate token counting for various AI models
 *
 * Supports multiple tokenization methods and model-specific counting
 * for accurate billing and usage tracking.
 */

import type { TokenUsage, ToknxrConfig } from './index.ts';

export class TokenCounter {
	private config: ToknxrConfig;

	constructor(config: ToknxrConfig) {
		this.config = config;
	}

	/**
	 * Count tokens for a given text input using model-specific tokenization
	 */
	async countTokens(text: string, model: string): Promise<number> {
		// For now, use a simple approximation
		// In a real implementation, this would use model-specific tokenizers
		return this.estimateTokens(text);
	}

	/**
	 * Estimate tokens using a simple heuristic
	 * This should be replaced with actual tokenizer libraries
	 */
	private estimateTokens(text: string): number {
		// Rough approximation: 1 token ≈ 4 characters for most models
		const words = text.split(/\s+/).length;
		const punctuation = (text.match(/[.,!?;:]/g) || []).length;
		return Math.ceil((words * 1.3) + punctuation);
	}

	/**
	 * Create a token usage record
	 */
	createUsageRecord(
		model: string,
		inputTokens: number,
		outputTokens: number,
		sessionId?: string
	): TokenUsage {
		return {
			model,
			inputTokens,
			outputTokens,
			totalTokens: inputTokens + outputTokens,
			timestamp: new Date(),
			sessionId,
		};
	}

	/**
	 * Count tokens for a conversation exchange
	 */
	async countConversationTokens(
		input: string,
		output: string,
		model: string,
		sessionId?: string
	): Promise<TokenUsage> {
		const [inputTokens, outputTokens] = await Promise.all([
			this.countTokens(input, model),
			this.countTokens(output, model),
		]);

		return this.createUsageRecord(model, inputTokens, outputTokens, sessionId);
	}
}
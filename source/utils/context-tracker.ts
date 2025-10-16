import {TokenCounter} from '@/integrations/toknxr/token-counter.js';
import type {TokenUsage} from '@/integrations/toknxr/types.js';
import {logError, logInfo} from '@/utils/message-queue.js';

type ContextEntry = {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	tokens: number;
	timestamp: Date;
};

type SessionMetrics = {
	totalInputTokens: number;
	totalOutputTokens: number;
	totalCost: number;
	requestCount: number;
	contextLength: number;
	remainingRequests?: number;
	maxRequests?: number;
};

export class ContextTracker {
	private context: ContextEntry[] = [];
	private readonly tokenCounter: TokenCounter;
	private sessionMetrics: SessionMetrics;
	private maxContextLength: number;
	private currentModel: string;
	private currentProvider: string;

	// Model-specific context limits
	private static readonly CONTEXT_LIMITS: Record<string, number> = {
		'gpt-4o': 128_000,
		'gpt-4-turbo': 128_000,
		'gpt-4': 8192,
		'gpt-3.5-turbo': 16_385,
		'claude-3-5-sonnet-20241022': 200_000,
		'claude-3-haiku-20240307': 200_000,
		'llama-3.3-70b-versatile': 32_768,
		'qwen2.5-coder': 32_768,
		'deepseek-coder': 16_384,
		'llama3.2': 8192,
	};

	// Model pricing (per 1M tokens)
	private static readonly MODEL_PRICING: Record<
		string,
		{input: number; output: number}
	> = {
		'gpt-4o': {input: 2.5, output: 10},
		'gpt-4-turbo': {input: 10, output: 30},
		'gpt-4': {input: 30, output: 60},
		'gpt-3.5-turbo': {input: 0.5, output: 1.5},
		'claude-3-5-sonnet-20241022': {input: 3, output: 15},
		'claude-3-haiku-20240307': {input: 0.25, output: 1.25},
		'llama-3.3-70b-versatile': {input: 0.59, output: 0.79}, // Groq pricing
		// Local models are free
		'qwen2.5-coder': {input: 0, output: 0},
		'deepseek-coder': {input: 0, output: 0},
		'llama3.2': {input: 0, output: 0},
	};

	constructor(model: string, provider: string, maxRequests?: number) {
		this.tokenCounter = new TokenCounter();
		this.currentModel = model;
		this.currentProvider = provider;
		this.maxContextLength = ContextTracker.CONTEXT_LIMITS[model] || 8192;

		this.sessionMetrics = {
			totalInputTokens: 0,
			totalOutputTokens: 0,
			totalCost: 0,
			requestCount: 0,
			contextLength: 0,
			maxRequests,
			remainingRequests: maxRequests,
		};
	}

	/**
	 * Add a message to the context and calculate tokens
	 */
	async addMessage(
		role: 'user' | 'assistant' | 'system',
		content: string,
	): Promise<ContextEntry> {
		const tokens = await this.tokenCounter.countTokens(
			content,
			this.currentModel,
		);

		const entry: ContextEntry = {
			id: `${role}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
			role,
			content,
			tokens,
			timestamp: new Date(),
		};

		this.context.push(entry);
		this.updateMetrics(entry);

		// Auto-trim context if approaching limit
		await this.trimContextIfNeeded();

		return entry;
	}

	/**
	 * Record token usage from API response
	 */
	recordUsage(usage: TokenUsage): void {
		this.sessionMetrics.totalInputTokens += usage.inputTokens;
		this.sessionMetrics.totalOutputTokens += usage.outputTokens;
		this.sessionMetrics.requestCount += 1;

		// Calculate cost
		const pricing = ContextTracker.MODEL_PRICING[this.currentModel];
		if (pricing) {
			const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
			const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;
			this.sessionMetrics.totalCost += inputCost + outputCost;
		}

		// Update remaining requests if tracking
		if (this.sessionMetrics.remainingRequests !== undefined) {
			this.sessionMetrics.remainingRequests = Math.max(
				0,
				this.sessionMetrics.remainingRequests - 1,
			);
		}

		logInfo(
			`Token usage recorded: ${
				usage.totalTokens
			} tokens, $${this.sessionMetrics.totalCost.toFixed(6)} total cost`,
		);
	}

	/**
	 * Update rate limit information
	 */
	updateRateLimit(remaining: number, max: number): void {
		this.sessionMetrics.remainingRequests = remaining;
		this.sessionMetrics.maxRequests = max;
	}

	/**
	 * Get current context as messages
	 */
	getContextMessages(): Array<{role: string; content: string}> {
		return this.context.map(entry => ({
			role: entry.role,
			content: entry.content,
		}));
	}

	/**
	 * Get current session metrics
	 */
	getMetrics(): SessionMetrics & {
		maxContextLength: number;
		provider: string;
		model: string;
		estimatedCost: number;
	} {
		return {
			...this.sessionMetrics,
			maxContextLength: this.maxContextLength,
			provider: this.currentProvider,
			model: this.currentModel,
			estimatedCost: this.sessionMetrics.totalCost,
		};
	}

	/**
	 * Get context usage percentage
	 */
	getContextUsage(): {used: number; max: number; percentage: number} {
		return {
			used: this.sessionMetrics.contextLength,
			max: this.maxContextLength,
			percentage:
				(this.sessionMetrics.contextLength / this.maxContextLength) * 100,
		};
	}

	/**
	 * Check if rate limited
	 */
	isRateLimited(): boolean {
		return this.sessionMetrics.remainingRequests === 0;
	}

	/**
	 * Clear context while preserving system messages
	 */
	clearContext(): void {
		const systemMessages = this.context.filter(
			entry => entry.role === 'system',
		);
		this.context = systemMessages;
		this.recalculateContextLength();
		logInfo('Context cleared, preserving system messages');
	}

	/**
	 * Update model and recalculate context limits
	 */
	updateModel(model: string, provider: string): void {
		this.currentModel = model;
		this.currentProvider = provider;
		this.maxContextLength = ContextTracker.CONTEXT_LIMITS[model] || 8192;

		// Recalculate context with new model
		this.recalculateContextLength();
	}

	/**
	 * Get conversation summary for context trimming
	 */
	async getSummary(): Promise<string> {
		if (this.context.length === 0) return '';

		const recentMessages = this.context.slice(-10); // Last 10 messages
		const summary = recentMessages
			.map(entry => `${entry.role}: ${entry.content.slice(0, 100)}...`)
			.join('\n');

		return `Recent conversation summary:\n${summary}`;
	}

	/**
	 * Export context for analysis
	 */
	exportContext(): {
		context: ContextEntry[];
		metrics: SessionMetrics;
		model: string;
		provider: string;
		timestamp: Date;
	} {
		return {
			context: [...this.context],
			metrics: {...this.sessionMetrics},
			model: this.currentModel,
			provider: this.currentProvider,
			timestamp: new Date(),
		};
	}

	/**
	 * Clean up resources
	 */
	dispose(): void {
		this.tokenCounter.dispose();
		this.context = [];
	}

	// Private methods

	private updateMetrics(entry: ContextEntry): void {
		this.sessionMetrics.contextLength += entry.tokens;

		if (entry.role === 'user') {
			this.sessionMetrics.totalInputTokens += entry.tokens;
		} else if (entry.role === 'assistant') {
			this.sessionMetrics.totalOutputTokens += entry.tokens;
		}
	}

	private async trimContextIfNeeded(): Promise<void> {
		// Trim if context exceeds 85% of limit
		const threshold = this.maxContextLength * 0.85;

		if (this.sessionMetrics.contextLength > threshold) {
			logInfo('Context approaching limit, trimming older messages...');

			// Keep system messages and recent 50% of conversation
			const systemMessages = this.context.filter(
				entry => entry.role === 'system',
			);
			const nonSystemMessages = this.context.filter(
				entry => entry.role !== 'system',
			);

			const keepCount = Math.floor(nonSystemMessages.length * 0.5);
			const recentMessages = nonSystemMessages.slice(-keepCount);

			this.context = [...systemMessages, ...recentMessages];
			this.recalculateContextLength();

			logInfo(
				`Context trimmed to ${this.context.length} messages, ${this.sessionMetrics.contextLength} tokens`,
			);
		}
	}

	private async recalculateContextLength(): Promise<void> {
		let totalTokens = 0;
		for (const entry of this.context) {
			totalTokens += entry.tokens;
		}

		this.sessionMetrics.contextLength = totalTokens;
	}
}

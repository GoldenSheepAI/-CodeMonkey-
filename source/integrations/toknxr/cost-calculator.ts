/**
 * Cost Calculator - Calculate costs based on token usage and model pricing
 *
 * Provides accurate cost calculations for different AI models and usage patterns.
 */

import type {TokenUsage, CostBreakdown, ToknxrConfig} from './types.js';

export class CostCalculator {
	private readonly config: ToknxrConfig;

	constructor(config: ToknxrConfig) {
		this.config = config;
	}

	/**
	 * Calculate cost for a single token usage record
	 */
	calculateCost(usage: TokenUsage): CostBreakdown {
		const pricing = this.config.modelPricing[usage.model];

		if (!pricing) {
			throw new Error(`No pricing configured for model: ${usage.model}`);
		}

		const inputCost = usage.inputTokens * pricing.inputPerToken;
		const outputCost = usage.outputTokens * pricing.outputPerToken;
		const totalCost = inputCost + outputCost;

		return {
			inputCost,
			outputCost,
			totalCost,
			currency: this.config.currency,
		};
	}

	/**
	 * Calculate cost for multiple usage records
	 */
	calculateTotalCost(usages: TokenUsage[]): CostBreakdown {
		let totalInputCost = 0;
		let totalOutputCost = 0;

		for (const usage of usages) {
			const cost = this.calculateCost(usage);
			totalInputCost += cost.inputCost;
			totalOutputCost += cost.outputCost;
		}

		return {
			inputCost: totalInputCost,
			outputCost: totalOutputCost,
			totalCost: totalInputCost + totalOutputCost,
			currency: this.config.currency,
		};
	}

	/**
	 * Get current pricing for a model
	 */
	getPricing(model: string) {
		return this.config.modelPricing[model];
	}

	/**
	 * Update pricing for a model
	 */
	updatePricing(
		model: string,
		inputPerToken: number,
		outputPerToken: number,
	): void {
		this.config.modelPricing[model] = {
			inputPerToken,
			outputPerToken,
		};
	}

	/**
	 * Estimate cost for a conversation before it happens
	 */
	estimateCost(
		inputTokens: number,
		expectedOutputTokens: number,
		model: string,
	): CostBreakdown {
		const pricing = this.config.modelPricing[model];

		if (!pricing) {
			throw new Error(`No pricing configured for model: ${model}`);
		}

		const inputCost = inputTokens * pricing.inputPerToken;
		const outputCost = expectedOutputTokens * pricing.outputPerToken;

		return {
			inputCost,
			outputCost,
			totalCost: inputCost + outputCost,
			currency: this.config.currency,
		};
	}
}

/**
 * Toknxr Integration - Token and Cost Tracking
 *
 * This integration provides comprehensive token usage tracking,
 * cost calculation, and analytics for AI model interactions.
 */

export { TokenCounter } from './token-counter.ts';
export { CostCalculator } from './cost-calculator.ts';
export { UsageDatabase } from './usage-db.ts';
export { AnalyticsEngine } from './analytics.ts';

export interface TokenUsage {
	model: string;
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	timestamp: Date;
	sessionId?: string;
}

export interface CostBreakdown {
	inputCost: number;
	outputCost: number;
	totalCost: number;
	currency: string;
}

export interface UsageStats {
	totalTokens: number;
	totalCost: number;
	averageCostPerToken: number;
	modelsUsed: string[];
	timeRange: {
		start: Date;
		end: Date;
	};
}

export interface ToknxrConfig {
	enableTracking: boolean;
	enableAnalytics: boolean;
	currency: string;
	modelPricing: Record<string, {
		inputPerToken: number;
		outputPerToken: number;
	}>;
	databasePath?: string;
}
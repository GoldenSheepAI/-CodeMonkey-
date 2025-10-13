/**
 * ToknXR Type Definitions
 */

export interface TokenUsage {
	model: string;
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	timestamp: Date;
	sessionId?: string;
}

export interface CostEstimate {
	estimatedTokens: number;
	estimatedCost: number;
	provider: string;
	model: string;
}

export interface UsageRecord {
	id: string;
	timestamp: number;
	provider: string;
	model: string;
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	cost: number;
	command: string;
	success: boolean;
}

export interface AnalyticsSummary {
	totalCost: number;
	totalTokens: number;
	requestCount: number;
	averageCostPerRequest: number;
	byProvider: Record<
		string,
		{
			cost: number;
			tokens: number;
			requests: number;
		}
	>;
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
	modelPricing: Record<
		string,
		{
			inputPerToken: number;
			outputPerToken: number;
		}
	>;
	databasePath?: string;
}

/**
 * ToknXR Type Definitions
 */

export type TokenUsage = {
	model: string;
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	timestamp: Date;
	sessionId?: string;
};

export type CostEstimate = {
	estimatedTokens: number;
	estimatedCost: number;
	provider: string;
	model: string;
};

export type UsageRecord = {
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
};

export type AnalyticsSummary = {
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
};

export type CostBreakdown = {
	inputCost: number;
	outputCost: number;
	totalCost: number;
	currency: string;
};

export type UsageStats = {
	totalTokens: number;
	totalCost: number;
	averageCostPerToken: number;
	modelsUsed: string[];
	timeRange: {
		start: Date;
		end: Date;
	};
};

export type ToknxrConfig = {
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
};

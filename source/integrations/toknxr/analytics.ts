/**
 * Analytics Engine - Advanced analytics and reporting for token usage
 *
 * Provides insights, trends, and visualizations for token usage patterns
 * and cost optimization recommendations.
 */

import type {TokenUsage, UsageStats, ToknxrConfig} from './types.js';

export class AnalyticsEngine {
	private readonly config: ToknxrConfig;

	constructor(config: ToknxrConfig) {
		this.config = config;
	}

	/**
	 * Generate comprehensive usage statistics
	 */
	generateStats(usages: TokenUsage[]): UsageStats {
		if (usages.length === 0) {
			return {
				totalTokens: 0,
				totalCost: 0,
				averageCostPerToken: 0,
				modelsUsed: [],
				timeRange: {
					start: new Date(),
					end: new Date(),
				},
			};
		}

		const totalTokens = usages.reduce(
			(sum, usage) => sum + usage.totalTokens,
			0,
		);
		const modelsUsed = [...new Set(usages.map(usage => usage.model))];

		// Calculate total cost
		let totalCost = 0;
		for (const usage of usages) {
			const pricing = this.config.modelPricing[usage.model];
			if (pricing) {
				const cost =
					usage.inputTokens * pricing.inputPerToken +
					usage.outputTokens * pricing.outputPerToken;
				totalCost += cost;
			}
		}

		const timestamps = usages.map(u => u.timestamp.getTime());
		const start = new Date(Math.min(...timestamps));
		const end = new Date(Math.max(...timestamps));

		return {
			totalTokens,
			totalCost,
			averageCostPerToken: totalTokens > 0 ? totalCost / totalTokens : 0,
			modelsUsed,
			timeRange: {start, end},
		};
	}

	/**
	 * Analyze usage patterns and provide insights
	 */
	analyzePatterns(usages: TokenUsage[]): {
		topModels: Array<{model: string; usageCount: number; totalCost: number}>;
		costTrends: Array<{date: string; cost: number}>;
		efficiency: {averageTokensPerRequest: number; costEfficiency: number};
		recommendations: string[];
	} {
		const modelStats = new Map<string, {count: number; cost: number}>();

		// Aggregate by model
		for (const usage of usages) {
			const pricing = this.config.modelPricing[usage.model];
			if (!pricing) continue;

			const cost =
				usage.inputTokens * pricing.inputPerToken +
				usage.outputTokens * pricing.outputPerToken;

			const existing = modelStats.get(usage.model) || {count: 0, cost: 0};
			modelStats.set(usage.model, {
				count: existing.count + 1,
				cost: existing.cost + cost,
			});
		}

		// Get top models
		const topModels = [...modelStats.entries()]
			.map(([model, stats]) => ({
				model,
				usageCount: stats.count,
				totalCost: stats.cost,
			}))
			.sort((a, b) => b.totalCost - a.totalCost)
			.slice(0, 5);

		// Calculate cost trends (daily)
		const dailyCosts = new Map<string, number>();
		for (const usage of usages) {
			const pricing = this.config.modelPricing[usage.model];
			if (!pricing) continue;

			const cost =
				usage.inputTokens * pricing.inputPerToken +
				usage.outputTokens * pricing.outputPerToken;

			const date = usage.timestamp.toISOString().split('T')[0];
			dailyCosts.set(date, (dailyCosts.get(date) || 0) + cost);
		}

		const costTrends = [...dailyCosts.entries()]
			.map(([date, cost]) => ({date, cost}))
			.sort((a, b) => a.date.localeCompare(b.date));

		// Calculate efficiency metrics
		const totalTokens = usages.reduce((sum, u) => sum + u.totalTokens, 0);
		const totalCost = [...modelStats.values()].reduce(
			(sum, s) => sum + s.cost,
			0,
		);
		const averageTokensPerRequest =
			usages.length > 0 ? totalTokens / usages.length : 0;
		const costEfficiency = totalTokens > 0 ? totalCost / totalTokens : 0;

		// Generate recommendations
		const recommendations = this.generateRecommendations(
			topModels,
			costTrends,
			{averageTokensPerRequest, costEfficiency},
		);

		return {
			topModels,
			costTrends,
			efficiency: {averageTokensPerRequest, costEfficiency},
			recommendations,
		};
	}

	/**
	 * Generate cost optimization recommendations
	 */
	private generateRecommendations(
		topModels: Array<{model: string; usageCount: number; totalCost: number}>,
		costTrends: Array<{date: string; cost: number}>,
		efficiency: {averageTokensPerRequest: number; costEfficiency: number},
	): string[] {
		const recommendations: string[] = [];

		// Check for high-cost models
		if (topModels.length > 0) {
			const highestCostModel = topModels[0];
			recommendations.push(
				`Consider optimizing usage of ${
					highestCostModel.model
				} ($${highestCostModel.totalCost.toFixed(2)} total cost)`,
			);
		}

		// Check cost trends
		if (costTrends.length >= 7) {
			const recentCosts = costTrends.slice(-7).map(d => d.cost);
			const avgRecent =
				recentCosts.reduce((a, b) => a + b, 0) / recentCosts.length;
			const earlierCosts = costTrends.slice(0, -7).map(d => d.cost);
			const avgEarlier =
				earlierCosts.length > 0
					? earlierCosts.reduce((a, b) => a + b, 0) / earlierCosts.length
					: avgRecent;

			const changePercent = ((avgRecent - avgEarlier) / avgEarlier) * 100;
			if (changePercent > 10) {
				recommendations.push(
					`Cost trend increasing by ${changePercent.toFixed(
						1,
					)}% in recent days`,
				);
			}
		}

		// Efficiency recommendations
		if (efficiency.averageTokensPerRequest < 50) {
			recommendations.push(
				'Consider batching smaller requests to improve token efficiency',
			);
		}

		if (efficiency.costEfficiency > 0.01) {
			recommendations.push(
				'High cost per token detected - consider model optimization',
			);
		}

		return recommendations;
	}

	/**
	 * Export analytics data for external processing
	 */
	exportData(usages: TokenUsage[], format: 'json' | 'csv' = 'json'): string {
		if (format === 'csv') {
			const headers =
				'timestamp,model,inputTokens,outputTokens,totalTokens,sessionId\n';
			const rows = usages
				.map(
					usage =>
						`${usage.timestamp.toISOString()},${usage.model},${
							usage.inputTokens
						},${usage.outputTokens},${usage.totalTokens},${
							usage.sessionId || ''
						}`,
				)
				.join('\n');
			return headers + rows;
		}

		return JSON.stringify(usages, null, 2);
	}
}

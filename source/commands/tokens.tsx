import React from 'react';
import {Command} from '@/types/index.js';
import TokenDisplay from '@/components/token-display.js';
import RateLimitMonitor from '@/components/rate-limit-monitor.js';
import {Box} from 'ink';

// Mock data for demonstration - in real implementation this would come from context tracker
function getTokenStats() {
	return {
		inputTokens: 1250,
		outputTokens: 890,
		totalTokens: 2140,
		estimatedCost: 0.0128,
		contextLength: 1850,
		maxContextLength: 32768,
		remainingRequests: 47,
		maxRequests: 100,
		provider: 'Groq',
		model: 'llama-3.3-70b-versatile',
	};
}

function TokenStatsDisplay() {
	const stats = getTokenStats();
	
	// Sample rate limit data - in real implementation this would be from API headers
	const rateLimitData = {
		provider: stats.provider,
		remainingRequests: stats.remainingRequests || 0,
		maxRequests: stats.maxRequests || 100,
		resetTime: new Date(Date.now() + 3600000), // 1 hour from now
	};

	return (
		<Box flexDirection="column">
			<TokenDisplay
				inputTokens={stats.inputTokens}
				outputTokens={stats.outputTokens}
				totalTokens={stats.totalTokens}
				estimatedCost={stats.estimatedCost}
				contextLength={stats.contextLength}
				maxContextLength={stats.maxContextLength}
				remainingRequests={stats.remainingRequests}
				maxRequests={stats.maxRequests}
				provider={stats.provider}
				model={stats.model}
			/>
			
			{stats.remainingRequests !== undefined && stats.maxRequests && (
				<RateLimitMonitor
					provider={stats.provider}
					remainingRequests={stats.remainingRequests}
					maxRequests={stats.maxRequests}
					resetTime={rateLimitData.resetTime}
				/>
			)}
		</Box>
	);
}

export const tokensCommand: Command = {
	name: 'tokens',
	description: 'Show detailed token usage, context length, and rate limit status',
	handler: async (_args: string[], _messages, _metadata) => {
		return React.createElement(TokenStatsDisplay, {
			key: `tokens-${Date.now()}`,
		});
	},
};
import React, {memo, useMemo} from 'react';
import {Box, Text} from 'ink';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';

interface TokenDisplayProps {
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	estimatedCost?: number;
	contextLength: number;
	maxContextLength: number;
	remainingRequests?: number;
	maxRequests?: number;
	provider: string;
	model: string;
	compact?: boolean;
}

export default memo(function TokenDisplay({
	inputTokens,
	outputTokens,
	totalTokens,
	estimatedCost,
	contextLength,
	maxContextLength,
	remainingRequests,
	maxRequests,
	provider,
	model,
	compact = false,
}: TokenDisplayProps) {
	const {colors} = useTheme();
	const terminalWidth = useTerminalWidth();

	// Calculate percentages
	const contextPercentage = Math.min(
		100,
		(contextLength / maxContextLength) * 100,
	);
	const requestsPercentage =
		remainingRequests && maxRequests
			? ((maxRequests - remainingRequests) / maxRequests) * 100
			: 0;

	// Create visual progress bars
	const contextBarWidth = Math.max(20, Math.floor(terminalWidth * 0.3));
	const requestBarWidth = Math.max(20, Math.floor(terminalWidth * 0.3));

	const contextFilled = Math.floor((contextPercentage / 100) * contextBarWidth);
	const requestFilled = Math.floor(
		(requestsPercentage / 100) * requestBarWidth,
	);

	const contextBar =
		'█'.repeat(contextFilled) + '░'.repeat(contextBarWidth - contextFilled);
	const requestBar =
		'█'.repeat(requestFilled) + '░'.repeat(requestBarWidth - requestFilled);

	// Determine colors based on usage
	const contextColor =
		contextPercentage > 90
			? colors.error
			: contextPercentage > 75
			? colors.warning
			: colors.success;

	const requestColor =
		requestsPercentage > 90
			? colors.error
			: requestsPercentage > 75
			? colors.warning
			: colors.success;

	// Format numbers with commas
	const formatNumber = (num: number) => num.toLocaleString();

	if (compact) {
		return (
			<Box justifyContent="space-between" marginBottom={1}>
				<Text color={colors.secondary}>
					🪙 {formatNumber(totalTokens)} tokens
				</Text>
				<Text color={contextColor}>
					📄 {contextPercentage.toFixed(1)}% context
				</Text>
				{remainingRequests !== undefined && (
					<Text color={requestColor}>🔄 {remainingRequests} requests left</Text>
				)}
				{estimatedCost && (
					<Text color={colors.info}>💰 ${estimatedCost.toFixed(4)}</Text>
				)}
			</Box>
		);
	}

	return (
		<TitledBox
			borderStyle="round"
			titles={['📊 Token & Context Tracker']}
			titleStyles={titleStyles.pill}
			width={terminalWidth}
			borderColor={colors.info}
			paddingX={1}
			paddingY={1}
			flexDirection="column"
			marginBottom={1}
		>
			{/* Provider and Model Info */}
			<Box justifyContent="space-between" marginBottom={1}>
				<Text color={colors.primary} bold>
					{provider} • {model}
				</Text>
				{estimatedCost && (
					<Text color={colors.info} bold>
						💰 ${estimatedCost.toFixed(4)}
					</Text>
				)}
			</Box>

			{/* Token Usage */}
			<Box flexDirection="column" marginBottom={1}>
				<Box justifyContent="space-between" marginBottom={0}>
					<Text color={colors.secondary}>Token Usage</Text>
					<Text color={colors.white}>{formatNumber(totalTokens)} total</Text>
				</Box>
				<Box justifyContent="space-between">
					<Text color={colors.tool}>📥 Input: {formatNumber(inputTokens)}</Text>
					<Text color={colors.primary}>
						📤 Output: {formatNumber(outputTokens)}
					</Text>
				</Box>
			</Box>

			{/* Context Length Progress */}
			<Box flexDirection="column" marginBottom={1}>
				<Box justifyContent="space-between" marginBottom={0}>
					<Text color={colors.secondary}>Context Usage</Text>
					<Text color={contextColor}>
						{formatNumber(contextLength)} / {formatNumber(maxContextLength)} (
						{contextPercentage.toFixed(1)}%)
					</Text>
				</Box>
				<Box>
					<Text color={contextColor}>{contextBar}</Text>
				</Box>
			</Box>

			{/* Rate Limit Status */}
			{remainingRequests !== undefined && maxRequests && (
				<Box flexDirection="column" marginBottom={1}>
					<Box justifyContent="space-between" marginBottom={0}>
						<Text color={colors.secondary}>Rate Limit Status</Text>
						<Text color={requestColor}>
							{remainingRequests} / {maxRequests} remaining (
							{(100 - requestsPercentage).toFixed(1)}%)
						</Text>
					</Box>
					<Box>
						<Text color={requestColor}>{requestBar}</Text>
					</Box>
					{remainingRequests === 0 && (
						<Box marginTop={1}>
							<Text color={colors.error} bold>
								⚠️ Rate limit reached! Please wait before making new requests.
							</Text>
						</Box>
					)}
				</Box>
			)}

			{/* Usage Warnings */}
			{contextPercentage > 90 && (
				<Box marginTop={1}>
					<Text color={colors.warning}>
						⚠️ Context approaching limit. Consider summarizing conversation.
					</Text>
				</Box>
			)}
		</TitledBox>
	);
});

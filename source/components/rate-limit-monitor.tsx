import React, {memo, useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';

interface RateLimitMonitorProps {
	provider: string;
	remainingRequests: number;
	maxRequests: number;
	resetTime?: Date;
	onRateLimitReached?: () => void;
}

export default memo(function RateLimitMonitor({
	provider,
	remainingRequests,
	maxRequests,
	resetTime,
	onRateLimitReached,
}: RateLimitMonitorProps) {
	const {colors} = useTheme();
	const terminalWidth = useTerminalWidth();
	const [timeUntilReset, setTimeUntilReset] = useState<string>('');

	// Calculate usage percentage
	const usagePercentage =
		((maxRequests - remainingRequests) / maxRequests) * 100;
	const remainingPercentage = 100 - usagePercentage;

	// Determine status color
	const getStatusColor = () => {
		if (remainingRequests === 0) return colors.error;
		if (remainingPercentage < 10) return colors.error;
		if (remainingPercentage < 25) return colors.warning;
		return colors.success;
	};

	// Create progress bar
	const barWidth = Math.max(20, Math.floor(terminalWidth * 0.4));
	const filledWidth = Math.floor((usagePercentage / 100) * barWidth);
	const progressBar =
		'█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);

	// Update countdown timer
	useEffect(() => {
		if (!resetTime) return;

		const updateTimer = () => {
			const now = new Date();
			const timeDiff = resetTime.getTime() - now.getTime();

			if (timeDiff <= 0) {
				setTimeUntilReset('Ready for new requests');
				return;
			}

			const hours = Math.floor(timeDiff / (1000 * 60 * 60));
			const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

			if (hours > 0) {
				setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
			} else if (minutes > 0) {
				setTimeUntilReset(`${minutes}m ${seconds}s`);
			} else {
				setTimeUntilReset(`${seconds}s`);
			}
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);

		return () => clearInterval(interval);
	}, [resetTime]);

	// Trigger rate limit callback
	useEffect(() => {
		if (remainingRequests === 0 && onRateLimitReached) {
			onRateLimitReached();
		}
	}, [remainingRequests, onRateLimitReached]);

	const statusColor = getStatusColor();

	return (
		<TitledBox
			borderStyle="round"
			titles={['🔄 Rate Limit Monitor']}
			titleStyles={titleStyles.pill}
			width={terminalWidth}
			borderColor={statusColor}
			paddingX={1}
			paddingY={1}
			flexDirection="column"
			marginBottom={1}
		>
			{/* Provider and Status */}
			<Box justifyContent="space-between" marginBottom={1}>
				<Text color={colors.primary} bold>
					{provider}
				</Text>
				<Text color={statusColor} bold>
					{remainingRequests === 0
						? '🚫 RATE LIMITED'
						: remainingPercentage < 10
						? '⚠️ CRITICAL'
						: remainingPercentage < 25
						? '⚠️ WARNING'
						: '✅ HEALTHY'}
				</Text>
			</Box>

			{/* Usage Stats */}
			<Box justifyContent="space-between" marginBottom={1}>
				<Text color={colors.secondary}>Requests Available</Text>
				<Text color={statusColor}>
					{remainingRequests} / {maxRequests} ({remainingPercentage.toFixed(1)}
					%)
				</Text>
			</Box>

			{/* Progress Bar */}
			<Box marginBottom={1}>
				<Text color={statusColor}>{progressBar}</Text>
			</Box>

			{/* Reset Timer */}
			{resetTime && (
				<Box justifyContent="space-between" marginBottom={1}>
					<Text color={colors.secondary}>Reset Time</Text>
					<Text color={colors.info}>{timeUntilReset}</Text>
				</Box>
			)}

			{/* Status Messages */}
			{remainingRequests === 0 && (
				<Box marginTop={1}>
					<Text color={colors.error} bold>
						🚫 Rate limit reached! All requests are being rejected with HTTP
						429.
					</Text>
				</Box>
			)}

			{remainingRequests > 0 && remainingPercentage < 10 && (
				<Box marginTop={1}>
					<Text color={colors.warning}>
						⚠️ Critical: Only {remainingRequests} requests remaining before rate
						limit.
					</Text>
				</Box>
			)}

			{remainingRequests > 0 &&
				remainingPercentage < 25 &&
				remainingPercentage >= 10 && (
					<Box marginTop={1}>
						<Text color={colors.warning}>
							⚠️ Warning: {remainingRequests} requests remaining. Consider
							slowing down.
						</Text>
					</Box>
				)}

			{/* Reset Instructions */}
			{remainingRequests === 0 && resetTime && (
				<Box marginTop={1}>
					<Text color={colors.info}>
						💡 Requests will reset at {resetTime.toLocaleTimeString()}
					</Text>
				</Box>
			)}
		</TitledBox>
	);
});

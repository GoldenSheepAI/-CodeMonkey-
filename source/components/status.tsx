import {existsSync} from 'node:fs';
import {Box, Text} from 'ink';
import {memo} from 'react';

import {themes, getThemeColors} from '@/config/themes.js';
import type {ThemePreset} from '@/types/ui.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';

// Get CWD once at module load time
const cwd = process.cwd();

type UpdateInfo = {
	hasUpdate: boolean;
	currentVersion: string;
	latestVersion?: string;
	updateCommand?: string;
};

type StatusProps = {
	readonly provider: string;
	readonly model: string;
	readonly theme: ThemePreset;
	readonly updateInfo?: UpdateInfo | undefined;
	readonly agentsMdLoaded?: boolean;
	readonly contextUsage?: {
		used: number;
		max: number;
		percentage: number;
	};
	readonly tokenUsage?: {
		session: number;
		estimated: number;
	};
	readonly rateLimitInfo?: {
		remaining: number;
		max: number;
	};
};

export default memo(function Status({
	provider,
	model,
	theme,
	updateInfo,
	agentsMdLoaded,
	contextUsage,
	tokenUsage,
	rateLimitInfo,
}: StatusProps) {
	const colors = getThemeColors(theme);
	const terminalWidth = useTerminalWidth();

	// Check for AGENTS.md synchronously if not provided
	const hasAgentsMd = agentsMdLoaded ?? existsSync(`${cwd}/AGENTS.md`);

	// Determine sandbox status
	const sandboxStatus = hasAgentsMd ? '' : 'no sandbox';

	// Determine update status
	const updatePercent = updateInfo?.hasUpdate ? '(update available)' : '(100%)';

	// Extract directory name from full path
	const dirName = cwd.split('/').pop() || cwd;

	// Format numbers for display
	const formatNumber = (number_: number) => {
		if (number_ > 1_000_000) return `${(number_ / 1_000_000).toFixed(1)}M`;
		if (number_ > 1000) return `${(number_ / 1000).toFixed(1)}K`;
		return number_.toString();
	};

	// Context usage color
	const contextColor = contextUsage
		? contextUsage.percentage > 90
			? colors.error
			: contextUsage.percentage > 75
			? colors.warning
			: colors.success
		: colors.secondary;

	// Rate limit color
	const rateLimitColor = rateLimitInfo
		? rateLimitInfo.remaining === 0
			? colors.error
			: rateLimitInfo.remaining < rateLimitInfo.max * 0.1
			? colors.warning
			: colors.success
		: colors.secondary;

	// Calculate box width to fit within terminal
	const boxWidth = Math.min(terminalWidth, 120);

	return (
		<Box
			borderStyle="round"
			borderColor={colors.secondary}
			paddingX={3}
			width={boxWidth}
			justifyContent="space-between"
		>
			<Box>
				<Text color={colors.secondary}>
					~/{dirName} ({provider}*) {sandboxStatus} {model} {updatePercent}
				</Text>
			</Box>

			{/* Token/Context/Rate Limit Info */}
			{(tokenUsage || contextUsage || rateLimitInfo) && (
				<Box>
					{tokenUsage && (
						<Text color={colors.info}>
							🪙 {formatNumber(tokenUsage.session)}
						</Text>
					)}
					{tokenUsage && contextUsage && (
						<Text color={colors.secondary}> • </Text>
					)}
					{contextUsage && (
						<Text color={contextColor}>
							📄 {contextUsage.percentage.toFixed(0)}%
						</Text>
					)}
					{(tokenUsage || contextUsage) && rateLimitInfo && (
						<Text color={colors.secondary}> • </Text>
					)}
					{rateLimitInfo && (
						<Text color={rateLimitColor}>🔄 {rateLimitInfo.remaining}</Text>
					)}
				</Box>
			)}
		</Box>
	);
});

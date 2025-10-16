import React, {memo, useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import Spinner from 'ink-spinner';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import type {ToolExecutionIndicatorProps} from '@/types/index.js';

export default memo(function ToolExecutionIndicator({
	toolName,
	currentIndex,
	totalTools,
}: ToolExecutionIndicatorProps) {
	const {colors} = useTheme();
	const terminalWidth = useTerminalWidth();
	const [elapsedSeconds, setElapsedSeconds] = useState(0);

	// Timer for elapsed time tracking
	useEffect(() => {
		const startTime = Date.now();
		const timer = setInterval(() => {
			const elapsed = Math.floor((Date.now() - startTime) / 1000);
			setElapsedSeconds(elapsed);
		}, 1000);

		return () => {
			clearInterval(timer);
		};
	}, [toolName, currentIndex]); // Reset timer when tool changes

	// Calculate progress
	const progressPercentage = Math.floor(
		((currentIndex + 1) / totalTools) * 100,
	);
	const progressBarWidth = Math.max(20, Math.floor(terminalWidth * 0.5));
	const filledWidth = Math.floor((progressPercentage / 100) * progressBarWidth);
	const progressBar =
		'█'.repeat(filledWidth) + '░'.repeat(progressBarWidth - filledWidth);

	return (
		<TitledBox
			borderStyle="round"
			titles={['🔧 Tool Execution']}
			titleStyles={titleStyles.pill}
			width={terminalWidth}
			borderColor={colors.tool}
			paddingX={2}
			paddingY={1}
			flexDirection="column"
			marginBottom={1}
		>
			{/* Tool name and spinner */}
			<Box justifyContent="space-between" marginBottom={1}>
				<Box>
					<Spinner type="dots2" />
					<Text bold color={colors.tool}>
						{' '}
						Executing: {toolName}
					</Text>
				</Box>
				<Box>
					<Text color={colors.secondary}>{elapsedSeconds}s elapsed</Text>
				</Box>
			</Box>

			{/* Progress bar for multiple tools */}
			{totalTools > 1 && (
				<Box flexDirection="column" marginBottom={1}>
					<Box justifyContent="space-between" marginBottom={0}>
						<Text color={colors.secondary}>
							Tool {currentIndex + 1} of {totalTools}
						</Text>
						<Text color={colors.secondary}>{progressPercentage}%</Text>
					</Box>
					<Box>
						<Text color={colors.tool}>{progressBar}</Text>
					</Box>
				</Box>
			)}

			{/* Control hint */}
			<Box>
				<Text color={colors.secondary}>Press Escape to cancel</Text>
			</Box>
		</TitledBox>
	);
});

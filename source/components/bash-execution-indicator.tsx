import {memo, useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import Spinner from 'ink-spinner';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import type {BashExecutionIndicatorProps} from '@/types/index.js';

export default memo(function BashExecutionIndicator({
	command,
}: BashExecutionIndicatorProps) {
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
	}, [command]); // Reset timer when command changes

	// Truncate long commands for display
	const displayCommand = command.length > 50 ? `${command.slice(0, 47)}...` : command;

	return (
		<TitledBox
			borderStyle="round"
			titles={['💻 Command Execution']}
			titleStyles={titleStyles.pill}
			width={terminalWidth}
			borderColor={colors.secondary}
			paddingX={2}
			paddingY={1}
			flexDirection="column"
			marginBottom={1}
		>
			{/* Command and spinner */}
			<Box justifyContent="space-between" marginBottom={1}>
				<Box flexDirection="row">
					<Spinner type="dots2" />
					<Text color={colors.tool}> Executing: </Text>
					<Text color={colors.secondary}>{displayCommand}</Text>
				</Box>
				<Box>
					<Text color={colors.secondary}>
						{elapsedSeconds}s elapsed
					</Text>
				</Box>
			</Box>

			{/* Status info */}
			<Box justifyContent="space-between">
				<Text color={colors.info}>
					{elapsedSeconds < 5 
						? 'Executing command...' 
						: elapsedSeconds < 30 
							? 'Command running...' 
							: 'Long-running command...'
					}
				</Text>
				<Text color={colors.secondary}>Press Escape to cancel</Text>
			</Box>
		</TitledBox>
	);
});

import React from 'react';
import {Box, Text} from 'ink';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';

interface BudgetModeToggleProps {
	onComplete?: () => void;
}

export default function BudgetModeToggle({onComplete}: BudgetModeToggleProps) {
	const boxWidth = useTerminalWidth();
	const {colors} = useTheme();

	return (
		<Box>
			<TitledBox
				borderStyle="round"
				titles={['💰 Budget Mode - Coming Soon']}
				titleStyles={titleStyles.pill}
				width={boxWidth}
				borderColor={colors.primary}
				paddingX={2}
				paddingY={1}
				flexDirection="column"
			>
				<Text color={colors.white}>
					Budget Mode with cost tracking and token monitoring is coming soon!
				</Text>

				<Box marginTop={1}>
					<Text color={colors.white} dimColor>
						This feature will help you monitor AI usage costs, set spending limits,
						and track token consumption across all your conversations.
					</Text>
				</Box>

				<Box marginTop={1}>
					<Text color={colors.secondary}>
						🚀 Planned features:
					</Text>
				</Box>

				<Box marginTop={1} marginLeft={2}>
					<Text color={colors.white} dimColor>
						• Real-time cost tracking per request
					</Text>
				</Box>

				<Box marginLeft={2}>
					<Text color={colors.white} dimColor>
						• Monthly spending limits and alerts
					</Text>
				</Box>

				<Box marginLeft={2}>
					<Text color={colors.white} dimColor>
						• Token usage analytics
					</Text>
				</Box>

				<Box marginLeft={2}>
					<Text color={colors.white} dimColor>
						• Provider cost comparisons
					</Text>
				</Box>

				<Box marginTop={2}>
					<Text color={colors.white} dimColor>
						Stay tuned for updates! 🐒
					</Text>
				</Box>
			</TitledBox>
		</Box>
	);
}

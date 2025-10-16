import React, {memo} from 'react';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {Text, Box} from 'ink';

import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';

export default memo(function ToolMessage({
	title,
	message,
	hideTitle = false,
	hideBox = false,
	isBashMode = false,
}: {
	readonly title?: string;
	readonly message: string | React.ReactNode;
	readonly hideTitle?: boolean;
	readonly hideBox?: boolean;
	readonly isBashMode?: boolean;
}) {
	const boxWidth = useTerminalWidth();
	const {colors} = useTheme();
	// Handle both string and ReactNode messages
	const messageContent =
		typeof message === 'string' ? (
			<Text color={colors.white}>{message}</Text>
		) : (
			message
		);

	const borderColor = colors.tool;
	const borderStyle = 'round';

	return (
		<>
			{hideBox ? (
				<Box width={boxWidth} flexDirection="column" marginBottom={1}>
					{isBashMode && (
						<Text bold color={colors.tool}>
							Bash Command Output
						</Text>
					)}
					{messageContent}
					{isBashMode && (
						<Text dimColor color={colors.secondary}>
							Output truncated to 4k characters to save context
						</Text>
					)}
				</Box>
			) : hideTitle ? (
				<Box
					borderStyle={borderStyle}
					width={boxWidth}
					borderColor={borderColor}
					paddingX={2}
					paddingY={0}
					flexDirection="column"
				>
					{messageContent}
					{isBashMode && (
						<Text dimColor color={colors.white}>
							Output truncated to 4k characters to save context
						</Text>
					)}
				</Box>
			) : (
				<TitledBox
					key={colors.primary}
					borderStyle={borderStyle}
					titles={[title || 'Tool Message']}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={borderColor}
					paddingX={2}
					paddingY={1}
					flexDirection="column"
					marginBottom={1}
				>
					{messageContent}
					{isBashMode && (
						<Text dimColor color={colors.tool}>
							Output truncated to 4k characters to save context
						</Text>
					)}
				</TitledBox>
			)}
		</>
	);
});

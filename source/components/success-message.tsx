import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {Text, Box} from 'ink';
import {useEffect, useState} from 'react';

import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';

export default function SuccessMessage({
	message,
	hideTitle = false,
	hideBox = false,
	autoHide = false,
	autoHideDelay = 30_000, // 30 seconds
}: {
	readonly message: string;
	readonly hideTitle?: boolean;
	readonly hideBox?: boolean;
	readonly autoHide?: boolean;
	readonly autoHideDelay?: number;
}) {
	const boxWidth = Math.min(useTerminalWidth(), 120);
	const {colors} = useTheme();
	const [isVisible, setIsVisible] = useState(true);

	// Auto-hide functionality
	useEffect(() => {
		if (autoHide && isVisible) {
			const timer = setTimeout(() => {
				setIsVisible(false);
			}, autoHideDelay);

			return () => {
				clearTimeout(timer);
			};
		}
	}, [autoHide, autoHideDelay, isVisible]);

	// Don't render if auto-hidden
	if (!isVisible) {
		return null;
	}

	return (
		<>
			{hideBox ? (
				<Box
					width={Math.min(boxWidth + 30, 120)}
					flexDirection="column"
					marginBottom={1}
				>
					<Text color={colors.success}>{message}</Text>
				</Box>
			) : hideTitle ? (
				<Box
					borderStyle="round"
					width={boxWidth}
					borderColor={colors.success}
					paddingX={2}
					paddingY={0}
					flexDirection="column"
				>
					<Text color={colors.success}>{message}</Text>
				</Box>
			) : (
				<TitledBox
					key={colors.primary}
					borderStyle="round"
					titles={['Success']}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={colors.success}
					paddingX={2}
					paddingY={1}
					flexDirection="column"
				>
					<Text color={colors.success}>{message}</Text>
				</TitledBox>
			)}
		</>
	);
}

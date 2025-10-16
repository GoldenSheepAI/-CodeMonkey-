import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {Text, Box} from 'ink';

import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';

export default function InfoMessage({
	message,
	hideTitle = false,
	hideBox = false,
}: {
	readonly message: string;
	readonly hideTitle?: boolean;
	readonly hideBox?: boolean;
}) {
	const boxWidth = Math.min(useTerminalWidth(), 120);
	const {colors} = useTheme();
	return (
		<>
			{hideBox ? (
				<Box
					width={Math.min(boxWidth + 30, 120)}
					flexDirection="column"
					marginBottom={1}
				>
					<Text color={colors.info}>{message}</Text>
				</Box>
			) : hideTitle ? (
				<Box
					borderStyle="round"
					width={boxWidth}
					borderColor={colors.info}
					paddingX={2}
					paddingY={0}
					flexDirection="column"
				>
					<Text color={colors.info}>{message}</Text>
				</Box>
			) : (
				<TitledBox
					key={colors.primary}
					borderStyle="round"
					titles={['Info']}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={colors.info}
					paddingX={2}
					paddingY={1}
					flexDirection="column"
				>
					<Text color={colors.info}>{message}</Text>
				</TitledBox>
			)}
		</>
	);
}

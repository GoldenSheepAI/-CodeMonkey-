import {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import SelectInput from 'ink-select-input';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {themes} from '@/config/themes.js';
import type {ThemePreset} from '@/types/ui.js';

type ThemeSelectorProps = {
	readonly onThemeSelect: (theme: ThemePreset) => void;
	readonly onCancel: () => void;
};

type ThemeOption = {
	label: string;
	value: ThemePreset;
};

export default function ThemeSelector({
	onThemeSelect,
	onCancel,
}: ThemeSelectorProps) {
	const boxWidth = useTerminalWidth();
	const {colors, currentTheme, setCurrentTheme} = useTheme();
	const [originalTheme] = useState(currentTheme); // Store original theme for restore on cancel
	const [currentIndex, setCurrentIndex] = useState(0);

	// Handle escape key to cancel
	useInput((_, key) => {
		if (key.escape) {
			// Restore original theme on cancel
			setCurrentTheme(originalTheme);
			onCancel();
		}
	});

	// Create theme options from available themes
	const themeOptions: ThemeOption[] = Object.values(themes).map(theme => ({
		label:
			theme.displayName + (theme.name === originalTheme ? ' (current)' : ''),
		value: theme.name as ThemePreset,
	}));

	// Find index of current theme for initial selection
	useEffect(() => {
		const index = themeOptions.findIndex(
			option => option.value === originalTheme,
		);
		setCurrentIndex(index >= 0 ? index : 0);
	}, []);

	const handleSelect = (item: ThemeOption) => {
		onThemeSelect(item.value);
	};

	// Handle theme preview during navigation
	const handleHighlight = (item: ThemeOption) => {
		setCurrentTheme(item.value);
	};

	return (
		<>
			<Gradient colors={[colors.primary, colors.tool]}>
				<BigText text="Themes" font="tiny" />
			</Gradient>

			<TitledBox
				key={colors.primary}
				borderStyle="round"
				titles={[`✻ Try out different themes!`]}
				titleStyles={titleStyles.pill}
				width={boxWidth}
				borderColor={colors.primary}
				paddingX={2}
				paddingY={1}
				flexDirection="column"
				marginBottom={1}
			>
				<Box paddingBottom={1}>
					<Text color={colors.white}>Tips for getting started:</Text>
				</Box>
				<Box paddingBottom={1} flexDirection="column">
					<Text color={colors.secondary}>
						1. Use arrow keys to navigate and Enter to select.
					</Text>
					<Text color={colors.secondary}>
						2. Press Esc to cancel and revert to your original theme.
					</Text>
					<Text color={colors.secondary}>
						3. The CLI will remember your choice next time.
					</Text>
				</Box>
				<Text color={colors.white}>/help for help</Text>
			</TitledBox>
			<Box
				borderStyle="round"
				width={boxWidth}
				borderColor={colors.primary}
				paddingX={2}
				paddingY={1}
				marginBottom={1}
			>
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color={colors.secondary}>
							Select a theme (current: {themes[currentTheme].displayName})
						</Text>
					</Box>

					<Box marginBottom={1}>
						<Text color={colors.secondary}>
							↑/↓ Navigate • Enter Select • Esc Cancel
						</Text>
					</Box>

					<SelectInput
						items={themeOptions}
						onSelect={handleSelect}
						onHighlight={handleHighlight}
					/>
				</Box>
			</Box>
		</>
	);
}

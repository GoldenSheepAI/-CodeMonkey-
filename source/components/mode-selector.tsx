import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import SelectInput from 'ink-select-input';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {useTheme} from '@/hooks/useTheme.js';
import {WorkflowMode} from '@/types/modes.js';
import {getModeManager} from '@/modes/mode-manager.js';

interface ModeSelectorProps {
	currentMode: WorkflowMode;
	onSelect: (mode: WorkflowMode) => void;
	onCancel: () => void;
}

interface ModeOption {
	label: string;
	value: WorkflowMode;
}

export default function ModeSelector({
	currentMode,
	onSelect,
	onCancel,
}: ModeSelectorProps) {
	const boxWidth = useTerminalWidth();
	const {colors} = useTheme();
	const modeManager = getModeManager();

	// Build mode options
	const modes: ModeOption[] = Object.values(WorkflowMode).map(mode => {
		const config = modeManager.getModeConfigFor(mode);
		const isCurrent = mode === currentMode;
		return {
			label: `${config.icon} ${mode.padEnd(10)} - ${config.description}${isCurrent ? ' (current)' : ''}`,
			value: mode,
		};
	});

	const handleSelect = (item: ModeOption) => {
		onSelect(item.value);
	};

	useEffect(() => {
		const handleKeyPress = (str: string, key: any) => {
			if (key.escape) {
				onCancel();
			}
		};

		process.stdin.on('keypress', handleKeyPress);
		return () => {
			process.stdin.off('keypress', handleKeyPress);
		};
	}, [onCancel]);

	return (
		<TitledBox
			key={colors.primary}
			borderStyle="round"
			titles={['Select Workflow Mode']}
			titleStyles={titleStyles.pill}
			width={boxWidth}
			borderColor={colors.primary}
			paddingX={2}
			paddingY={1}
			flexDirection="column"
			marginBottom={1}
		>
			<Box marginBottom={1}>
				<Text color={colors.white}>
					Use ↑/↓ arrows to navigate, Enter to select, Esc to cancel
				</Text>
			</Box>

			<SelectInput items={modes} onSelect={handleSelect} />

			<Box marginTop={1}>
				<Text color={colors.secondary} dimColor>
					Current: {modeManager.getStatusString()}
				</Text>
			</Box>
		</TitledBox>
	);
}

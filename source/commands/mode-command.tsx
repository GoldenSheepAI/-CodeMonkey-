/**
 * Mode Command Handler
 * 
 * Handles the /mode command for switching between workflow modes.
 * 
 * @module commands/mode-command
 */

import React from 'react';
import {Box, Text} from 'ink';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {WorkflowMode, isValidWorkflowMode} from '@/types/modes.js';
import {getModeManager} from '@/modes/mode-manager.js';
import {MODE_HELP_TEXT} from '@/modes/mode-config.js';
import {Command} from '@/types/index.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {useTheme} from '@/hooks/useTheme.js';
import {savePreferences, loadPreferences} from '@/config/preferences.js';
import SuccessMessage from '@/components/success-message.js';
import ErrorMessage from '@/components/error-message.js';

/**
 * Mode Status Component
 * Shows current mode and available modes
 */
function ModeStatus() {
	const boxWidth = useTerminalWidth();
	const {colors} = useTheme();
	const modeManager = getModeManager();
	const currentMode = modeManager.getCurrentMode();

	return (
		<TitledBox
			key={colors.primary}
			borderStyle="round"
			titles={['/mode']}
			titleStyles={titleStyles.pill}
			width={boxWidth}
			borderColor={colors.primary}
			paddingX={2}
			paddingY={1}
			flexDirection="column"
			marginBottom={1}
		>
			<Box marginBottom={1}>
				<Text color={colors.primary} bold>
					Current Mode: {modeManager.getStatusString()}
				</Text>
			</Box>

			<Text color={colors.white}>{MODE_HELP_TEXT[currentMode]}</Text>

			<Box marginTop={1}>
				<Text color={colors.primary} bold>
					Available Modes:
				</Text>
			</Box>

			<Box flexDirection="column" marginLeft={1}>
				{Object.values(WorkflowMode).map(mode => {
					const modeConfig = modeManager.getModeConfigFor(mode);
					const isCurrent = mode === currentMode;
					return (
						<Text
							key={mode}
							color={isCurrent ? colors.success : colors.white}
							bold={isCurrent}
						>
							{modeConfig.icon} {mode.padEnd(10)} - {modeConfig.description}
							{isCurrent ? ' (current)' : ''}
						</Text>
					);
				})}
			</Box>

			<Box marginTop={1}>
				<Text color={colors.secondary}>
					Usage: /mode &lt;mode-name&gt; (e.g., /mode cosmo)
				</Text>
			</Box>
		</TitledBox>
	);
}

/**
 * Mode command handler
 */
export const modeCommand: Command = {
	name: 'mode',
	description: 'Switch between workflow modes (command/codegen/cosmo)',
	handler: async (args: string[], _messages, _metadata) => {
		const modeManager = getModeManager();

		// No arguments: show current mode and available modes
		if (args.length === 0) {
			return <ModeStatus key={`mode-status-${Date.now()}`} />;
		}

		// Get the requested mode
		const requestedMode = args[0].toLowerCase();

		// Validate mode
		if (!isValidWorkflowMode(requestedMode)) {
			return (
				<ErrorMessage
					key={`mode-error-${Date.now()}`}
					message={
						`"${requestedMode}" is not a valid workflow mode.\n\n` +
						'Available modes: command, codegen, cosmo\n' +
						'Usage: /mode <mode-name>'
					}
					hideBox={true}
				/>
			);
		}

		// Attempt to switch mode
		const result = modeManager.setMode(requestedMode as WorkflowMode);

		if (!result.success) {
			return (
				<ErrorMessage
					key={`mode-error-${Date.now()}`}
					message={result.error || 'Failed to change mode'}
					hideBox={true}
				/>
			);
		}

		// Save to preferences
		try {
			const prefs = loadPreferences();
			(prefs as any).workflowMode = requestedMode as WorkflowMode;
			savePreferences(prefs);
		} catch (error) {
			console.error('Failed to save mode preference:', error);
		}

		// Return success message with mode-specific help
		const mode = requestedMode as WorkflowMode;
		const helpMessages: Record<WorkflowMode, string> = {
			[WorkflowMode.COMMAND]:
				'Command Mode Active 🔧\n' +
				'• All utility commands available\n' +
				'• AI code generation disabled\n' +
				'• No AI costs incurred\n\n' +
				'Try: /help, /status, /mcp\n' +
				'To enable AI: /mode cosmo',

			[WorkflowMode.CODEGEN]:
				'Codegen Mode Active 🤖\n' +
				'• AI code generation enabled\n' +
				'• Limited commands available\n' +
				'• Type naturally for AI help\n\n' +
				'To enable all commands: /mode cosmo',

			[WorkflowMode.COSMO]:
				'Cosmo Mode Active 🌟\n' +
				'• Full power unlocked!\n' +
				'• All commands available\n' +
				'• AI code generation enabled\n\n' +
				'Use / for commands, or type naturally for AI',
		};

		return (
			<SuccessMessage
				key={`mode-success-${Date.now()}`}
				message={`${result.message}\n\n${helpMessages[mode]}`}
				hideBox={true}
			/>
		);
	},
};

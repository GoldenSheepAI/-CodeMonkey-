import {Box, Text, useFocus, useInput} from 'ink';
import TextInput from 'ink-text-input';
import {useCallback, useEffect, useState} from 'react';
import {useTheme} from '@/hooks/useTheme.js';
import {promptHistory} from '@/prompt-history.js';
import {commandRegistry} from '@/commands.js';
import {useUIStateContext} from '@/hooks/useUIState.js';
import {useInputState} from '@/hooks/useInputState.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {Completion} from '@/types/index.js';
import {DevelopmentMode, DEVELOPMENT_MODE_LABELS} from '@/types/core.js';

interface ChatProps {
	onSubmit?: (message: string) => void;
	placeholder?: string;
	customCommands?: string[]; // List of custom command names and aliases
	disabled?: boolean; // Disable input when AI is processing
	onCancel?: () => void; // Callback when user presses escape while thinking
	onToggleMode?: () => void; // Callback when user presses shift+tab to toggle development mode
	developmentMode?: DevelopmentMode; // Current development mode
}

export default function UserInput({
	onSubmit,
	placeholder = 'Type your message or @path/to/file',
	customCommands = [],
	disabled = false,
	onCancel,
	onToggleMode,
	developmentMode = 'normal',
}: ChatProps) {
	const {isFocused, focus} = useFocus({autoFocus: !disabled, id: 'user-input'});
	const {colors} = useTheme();
	const inputState = useInputState();
	const uiState = useUIStateContext();
	const terminalWidth = useTerminalWidth();
	const [textInputKey, setTextInputKey] = useState(0);

	const {
		input,
		hasLargeContent,
		originalInput,
		historyIndex,
		setOriginalInput,
		setHistoryIndex,
		updateInput,
		resetInput,
		cachedLineCount,
	} = inputState;

	const {
		showClearMessage,
		showFullContent,
		showCompletions,
		completions,
		setShowClearMessage,
		setShowFullContent,
		setShowCompletions,
		setCompletions,
		resetUIState,
	} = uiState;

	// Check if we're in bash mode (input starts with !)
	const isBashMode = input.trim().startsWith('!');

	// Load history on mount
	useEffect(() => {
		promptHistory.loadHistory();
	}, []);

	// Helper functions

	const getExpandKey = () => 'Ctrl+B';

	// Command completion logic
	const handleCommandCompletion = useCallback(
		(commandPrefix: string) => {
			const builtInCompletions = commandRegistry.getCompletions(commandPrefix);
			const customCompletions = customCommands.filter(cmd =>
				cmd.startsWith(commandPrefix),
			);

			const allCompletions: Completion[] = [
				...builtInCompletions.map(cmd => ({name: cmd, isCustom: false})),
				...customCompletions.map(cmd => ({name: cmd, isCustom: true})),
			];

			if (allCompletions.length === 1) {
				// Auto-complete when there's exactly one match
				const completion = allCompletions[0];
				const completedText = `/${completion.name}`;

				// Force TextInput to remount by changing its key, which resets cursor position
				updateInput(completedText);
				setTextInputKey(prev => prev + 1);
			} else if (allCompletions.length > 1) {
				// Show completions when there are multiple matches
				setCompletions(allCompletions);
				setShowCompletions(true);
			}
		},
		[customCommands, setCompletions, setShowCompletions, updateInput],
	);

	// Handle form submission
	const handleSubmit = useCallback(() => {
		if (input.trim() && onSubmit) {
			const message = input.trim();
			promptHistory.addPrompt(message);
			onSubmit(message);
			resetInput();
			resetUIState();
			promptHistory.resetIndex();
		}
	}, [input, onSubmit, resetInput, resetUIState]);

	// Handle escape key logic
	const handleEscape = useCallback(() => {
		if (showClearMessage) {
			resetInput();
			resetUIState();
			focus('user-input');
		} else {
			setShowClearMessage(true);
		}
	}, [showClearMessage, resetInput, resetUIState, setShowClearMessage, focus]);

	// History navigation
	const handleHistoryNavigation = useCallback(
		(direction: 'up' | 'down') => {
			const history = promptHistory.getHistory();
			if (history.length === 0) return;

			if (direction === 'up') {
				if (historyIndex === -1) {
					setOriginalInput(input);
					setHistoryIndex(history.length - 1);
					updateInput(history[history.length - 1]);
					setTextInputKey(prev => prev + 1);
				} else if (historyIndex > 0) {
					const newIndex = historyIndex - 1;
					setHistoryIndex(newIndex);
					updateInput(history[newIndex]);
					setTextInputKey(prev => prev + 1);
				} else {
					setHistoryIndex(-2);
					updateInput('');
					setTextInputKey(prev => prev + 1);
				}
			} else {
				if (historyIndex >= 0 && historyIndex < history.length - 1) {
					const newIndex = historyIndex + 1;
					setHistoryIndex(newIndex);
					updateInput(history[newIndex]);
					setTextInputKey(prev => prev + 1);
				} else if (historyIndex === history.length - 1) {
					setHistoryIndex(-1);
					updateInput(originalInput);
					setOriginalInput('');
					setTextInputKey(prev => prev + 1);
				} else if (historyIndex === -2) {
					setHistoryIndex(0);
					updateInput(history[0]);
					setTextInputKey(prev => prev + 1);
				}
			}
		},
		[
			historyIndex,
			input,
			originalInput,
			setHistoryIndex,
			setOriginalInput,
			updateInput,
		],
	);

	useInput((inputChar, key) => {
		// Handle escape for cancellation even when disabled
		if (key.escape && disabled && onCancel) {
			onCancel();
			return;
		}

		// Handle shift+tab to toggle development mode (always available)
		if (key.tab && key.shift && onToggleMode) {
			onToggleMode();
			return;
		}

		// Block all other input when disabled
		if (disabled) {
			return;
		}

		// Handle special keys
		if (key.escape) {
			handleEscape();
			return;
		}

		if (key.ctrl && inputChar === 'b') {
			if (hasLargeContent && input.length > 150) {
				setShowFullContent(prev => !prev);
			}
			return;
		}

		if (key.tab && input.startsWith('/')) {
			const commandPrefix = input.slice(1).split(' ')[0];
			handleCommandCompletion(commandPrefix);
			return;
		}

		// Clear UI state on other input
		if (showCompletions) {
			setShowCompletions(false);
			setCompletions([]);
		}
		if (showClearMessage) {
			setShowClearMessage(false);
			focus('user-input');
		}

		// Handle return keys
		if (key.return && key.shift) {
			updateInput(input + '\n');
			return;
		}

		// Handle navigation
		if (key.upArrow) {
			handleHistoryNavigation('up');
			return;
		}

		if (key.downArrow) {
			handleHistoryNavigation('down');
			return;
		}
	});

	// Render function - NEVER modifies state, only for display
	const renderDisplayContent = () => {
		if (!input) return placeholder;

		if (hasLargeContent && input.length > 150 && !showFullContent) {
			// Use cached line count from the hook (debounced)
			return (
				<>
					{`[${input.length} characters, ${cachedLineCount} lines] `}
					<Text color={colors.secondary}>({getExpandKey()} to expand)</Text>
				</>
			);
		}

		return input;
	};

	const textColor = disabled || !input ? colors.secondary : colors.white;
	const borderColor = isBashMode ? colors.tool : colors.primary;

	// Calculate box width to fit within terminal
	const boxWidth = Math.min(terminalWidth, 120);

	return (
		<Box flexDirection="column" width={boxWidth}>
			{/* Modern single-line input box */}
			<Box
				borderStyle="round"
				borderColor={borderColor}
				paddingX={1}
				width="100%"
			>
				{/* Input row */}
				{hasLargeContent && input.length > 150 && !showFullContent ? (
					<Text color={textColor}>
						{'> '} {renderDisplayContent()}
					</Text>
				) : (
					<Box>
						<Text color={textColor}>{'> '}</Text>
						{disabled ? (
							<Text color={colors.secondary}>...</Text>
						) : (
							<TextInput
								key={textInputKey}
								value={input}
								onChange={updateInput}
								onSubmit={handleSubmit}
								placeholder={placeholder}
								focus={isFocused}
							/>
						)}
					</Box>
				)}
			</Box>

			{/* Contextual hints below input */}
			{isBashMode && (
				<Box marginTop={1}>
					<Text color={colors.tool} dimColor>
						Bash Mode
					</Text>
				</Box>
			)}
			{showClearMessage && (
				<Box marginTop={1}>
					<Text color={colors.secondary} dimColor>
						Press escape again to clear
					</Text>
				</Box>
			)}
			{showCompletions && completions.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					<Text color={colors.secondary}>Available commands:</Text>
					{completions.map((completion, index) => (
						<Text
							key={index}
							color={completion.isCustom ? colors.info : colors.primary}
						>
							/{completion.name}
						</Text>
					))}
				</Box>
			)}

			{/* Development mode indicator - compact */}
			{developmentMode !== 'normal' && (
				<Box marginTop={1}>
					<Text
						color={
							developmentMode === 'auto-accept' ? colors.info : colors.warning
						}
					>
						<Text bold>{DEVELOPMENT_MODE_LABELS[developmentMode]}</Text>{' '}
						<Text dimColor>(Shift+Tab to cycle)</Text>
					</Text>
				</Box>
			)}
		</Box>
	);
}

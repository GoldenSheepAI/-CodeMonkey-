import React from 'react';
import {Box, Text} from 'ink';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {Command} from '@/types/index.js';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';

function TipsComponent() {
	const {colors} = useTheme();
	const boxWidth = useTerminalWidth();

	return (
		<Box flexDirection="column">
			<TitledBox
				borderStyle="round"
				titles={['💡 CodeMonkey Tips & Best Practices']}
				titleStyles={titleStyles.pill}
				width={boxWidth}
				borderColor={colors.info}
				paddingX={2}
				paddingY={1}
				flexDirection="column"
			>
				<Box flexDirection="column" gap={1}>
					{/* Command Shortcuts */}
					<Box flexDirection="column">
						<Text bold color={colors.primary}>
							⌨️  Command Shortcuts
						</Text>
						<Text color={colors.white}>
							• Type <Text bold color={colors.success}>/</Text> then press{' '}
							<Text bold color={colors.warning}>Tab</Text> to see all commands
						</Text>
						<Text color={colors.white}>
							• Type <Text bold color={colors.success}>/re</Text> + Tab to
							auto-complete <Text bold>/restart</Text>
						</Text>
						<Text color={colors.white}>
							• Use <Text bold color={colors.warning}>↑/↓</Text> arrows to
							navigate command history
						</Text>
						<Text color={colors.white}>
							• Press <Text bold color={colors.warning}>Shift+Tab</Text> to cycle
							through modes (normal/auto-accept/plan)
						</Text>
					</Box>

					{/* Essential Commands */}
					<Box flexDirection="column" marginTop={1}>
						<Text bold color={colors.primary}>
							🔧 Essential Commands
						</Text>
						<Text color={colors.white}>
							• <Text bold color={colors.success}>/help</Text> - Show all
							available commands
						</Text>
						<Text color={colors.white}>
							• <Text bold color={colors.success}>/status</Text> - Check current
							provider, model, and modes
						</Text>
						<Text color={colors.white}>
							• <Text bold color={colors.success}>/restart</Text> - Reload config
							and preferences (auto-restarts)
						</Text>
						<Text color={colors.white}>
							• <Text bold color={colors.success}>/model</Text> - Switch between
							AI models
						</Text>
						<Text color={colors.white}>
							• <Text bold color={colors.success}>/provider</Text> - Switch AI
							provider (Ollama, OpenRouter, etc.)
						</Text>
					</Box>

					{/* Special Modes */}
					<Box flexDirection="column" marginTop={1}>
						<Text bold color={colors.primary}>
							🎯 Special Modes
						</Text>
						<Text color={colors.white}>
							• <Text bold color={colors.success}>/budget</Text> - Enable cost
							tracking with ToknXR (auto-starts proxy)
						</Text>
						<Text color={colors.white}>
							• <Text bold color={colors.success}>/secure</Text> - Enable
							security scanning for sensitive data
						</Text>
						<Text color={colors.white}>
							• <Text bold color={colors.success}>/init</Text> - Initialize
							project with AGENTS.md file
						</Text>
					</Box>

					{/* Bash Commands */}
					<Box flexDirection="column" marginTop={1}>
						<Text bold color={colors.primary}>
							💻 Bash Commands
						</Text>
						<Text color={colors.white}>
							• Type <Text bold color={colors.success}>!</Text> before any
							command to run bash
						</Text>
						<Text color={colors.white}>
							• Example:{' '}
							<Text bold color={colors.success}>
								!ls -la
							</Text>{' '}
							or{' '}
							<Text bold color={colors.success}>
								!git status
							</Text>
						</Text>
						<Text color={colors.white}>
							• Bash mode shows a special border around input
						</Text>
					</Box>

					{/* Pro Tips */}
					<Box flexDirection="column" marginTop={1}>
						<Text bold color={colors.primary}>
							✨ Pro Tips
						</Text>
						<Text color={colors.white}>
							• Be specific in your requests - treat CodeMonkey like a senior
							engineer
						</Text>
						<Text color={colors.white}>
							• Use <Text bold>/clear</Text> to clear chat history and start fresh
						</Text>
						<Text color={colors.white}>
							• Check <Text bold>/status</Text> regularly to see active modes and
							settings
						</Text>
						<Text color={colors.white}>
							• Use <Text bold>/export</Text> to save your conversation to a file
						</Text>
						<Text color={colors.white}>
							• Press <Text bold color={colors.warning}>Ctrl+C</Text> or type{' '}
							<Text bold>/exit</Text> to quit
						</Text>
					</Box>

					{/* Getting Started */}
					<Box flexDirection="column" marginTop={1}>
						<Text bold color={colors.primary}>
							🚀 Getting Started
						</Text>
						<Text color={colors.white}>
							1. Run <Text bold color={colors.success}>/init</Text> to set up
							your project
						</Text>
						<Text color={colors.white}>
							2. Check <Text bold color={colors.success}>/status</Text> to see
							your current setup
						</Text>
						<Text color={colors.white}>
							3. Try <Text bold color={colors.success}>/budget</Text> for cost
							tracking (Ollama is free!)
						</Text>
						<Text color={colors.white}>
							4. Ask CodeMonkey to help with your code - be specific!
						</Text>
					</Box>

					{/* Footer */}
					<Box marginTop={1}>
						<Text color={colors.secondary} dimColor>
							💡 Tip: Type <Text bold>/help</Text> anytime to see all commands, or{' '}
							<Text bold>/tips</Text> to see this guide again
						</Text>
					</Box>
				</Box>
			</TitledBox>
		</Box>
	);
}

export const tipsCommand: Command = {
	name: 'tips',
	description: 'Show tips and best practices for using CodeMonkey',
	handler: async (_args: string[], _messages, _metadata) => {
		return React.createElement(TipsComponent);
	},
};

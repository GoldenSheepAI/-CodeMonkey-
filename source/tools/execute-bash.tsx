import {spawn} from 'node:child_process';
import {highlight} from 'cli-highlight';
import React from 'react';
import {Text, Box} from 'ink';
import type {
	ToolHandler,
	ToolDefinition,
	BashToolResult,
} from '@/types/index.js';
import {ThemeContext} from '@/hooks/useTheme.js';
import ToolMessage from '@/components/tool-message.js';

const handler: ToolHandler = async (args: {
	command: string;
}): Promise<string> => {
	return new Promise((resolve, reject) => {
		// Add timeout to prevent hanging indefinitely
		const timeout = setTimeout(() => {
			proc.kill('SIGKILL');
			reject(new Error('Command execution timed out after 60 seconds'));
		}, 60000); // 60 second timeout

		const proc = spawn('sh', ['-c', args.command]);
		let stdout = '';
		let stderr = '';

		proc.stdout.on('data', data => {
			stdout += data.toString();
		});

		proc.stderr.on('data', data => {
			stderr += data.toString();
		});

		proc.on('close', (code, signal) => {
			clearTimeout(timeout);
			
			let fullOutput = '';
			if (stderr) {
				fullOutput = `STDERR:
${stderr}
STDOUT:
${stdout}`;
			} else {
				fullOutput = stdout;
			}

			// Handle different exit scenarios
			if (signal) {
				fullOutput += `\n[Process terminated by signal: ${signal}]`;
			} else if (code !== 0) {
				fullOutput += `\n[Exit code: ${code}]`;
			}

			// Limit the context for LLM to first 4000 characters
			const llmContext =
				fullOutput.length > 4000 ? fullOutput.slice(0, 4000) : fullOutput;

			// Return as JSON string to maintain compatibility with ToolHandler type
			resolve(
				JSON.stringify({
					fullOutput,
					llmContext,
				} as BashToolResult),
			);
		});

		proc.on('error', error => {
			clearTimeout(timeout);
			reject(new Error(`Error executing command: ${error.message}`));
		});
	});
};

// Create a component that will re-render when theme changes
const ExecuteBashFormatter = React.memo(
	({args, result}: {readonly args: any; readonly result?: string}) => {
		const {colors} = React.useContext(ThemeContext)!;
		const command = args.command || 'unknown';

		let highlightedCommand;
		try {
			highlightedCommand = highlight(command, {
				language: 'bash',
				theme: 'default',
			});
		} catch {
			highlightedCommand = command;
		}

		// Parse the result if it's a JSON string
		let parsedResult: {fullOutput: string; llmContext: string} | undefined =
			undefined;
		if (result) {
			try {
				parsedResult = JSON.parse(result);
			} catch (error) {
				// If parsing fails, treat as plain string and create proper structure
				parsedResult = {
					fullOutput: result,
					llmContext: result.length > 4000 ? result.slice(0, 4000) : result,
				};
			}
		}

		// Calculate token estimation for the output if result is provided
		let outputSize = 0;
		let estimatedTokens = 0;
		let fullOutputSize = 0;
		if (parsedResult) {
			outputSize = parsedResult.llmContext.length;
			fullOutputSize = parsedResult.fullOutput.length;
			estimatedTokens = Math.ceil(outputSize / 4); // ~4 characters per token
		}

		const messageContent = (
			<Box flexDirection="column">
				<Text color={colors.tool}>⚒ execute_bash</Text>

				<Box>
					<Text color={colors.secondary}>Command: </Text>
					<Text color={colors.primary}>{command}</Text>
				</Box>

				{parsedResult && (
					<Box>
						<Text color={colors.secondary}>Output: </Text>
						<Text color={colors.white}>
							{fullOutputSize} characters (~{estimatedTokens} tokens sent to
							LLM)
						</Text>
					</Box>
				)}
			</Box>
		);

		return <ToolMessage hideBox message={messageContent} />;
	}
);

const formatter = async (
	args: any,
	result?: string,
): Promise<React.ReactElement> => {
	return <ExecuteBashFormatter args={args} result={result} />;
};

const validator = async (args: {
	command: string;
}): Promise<{valid: true} | {valid: false; error: string}> => {
	const command = args.command?.trim();

	// Check if command is empty
	if (!command) {
		return {
			valid: false,
			error: '⚒ Command cannot be empty',
		};
	}

	// Check for extremely dangerous commands
	const dangerousPatterns = [
		/rm\s+-rf\s+\/(?!\w)/i, // Rm -rf / (but allow /path)
		/mkfs/i, // Format filesystem
		/dd\s+if=/i, // Direct disk write
		/:(){:|:&};:/i, // Fork bomb
		/>\s*\/dev\/sd[a-z]/i, // Writing to raw disk devices
		/chmod\s+-r\s+000/i, // Remove all permissions recursively
	];

	for (const pattern of dangerousPatterns) {
		if (pattern.test(command)) {
			return {
				valid: false,
				error: `⚒ Command contains potentially destructive operation: "${command}". This command is blocked for safety.`,
			};
		}
	}

	return {valid: true};
};

export const executeBashTool: ToolDefinition = {
	handler,
	formatter,
	validator,
	config: {
		type: 'function',
		function: {
			name: 'execute_bash',
			description: 'Execute a bash command and return its output',
			parameters: {
				type: 'object',
				properties: {
					command: {
						type: 'string',
						description: 'The bash command to execute.',
					},
				},
				required: ['command'],
			},
		},
	},
};

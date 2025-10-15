#!/usr/bin/env node
import {render} from 'ink';
import App from './app.js';
import {commandRegistry} from './commands.js';

// Parse command line arguments
const args = process.argv.slice(2);

// Non-interactive command execution
async function executeNonInteractiveCommand(commandArgs: string[]) {
	try {
		// Import necessary modules for command execution
		const result = await commandRegistry.execute(commandArgs.join(' '), [], {
			provider: 'CLI',
			model: 'command-line',
			tokens: 0,
		});
		
		if (typeof result === 'string' && result.trim()) {
			console.log(result);
		} else {
			// For React components, we can't render them in CLI mode
			console.log('Command executed successfully');
		}
		process.exit(0);
	} catch (error) {
		console.error('Error executing command:', error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

// Check for non-interactive commands that don't require TTY
const nonInteractiveCommands = [
	'init',
	'custom-commands', 
	'status',
	'help',
	'--help',
	'-h',
	'--version',
	'-v'
];

const isNonInteractiveCommand = args.length > 0 && 
	nonInteractiveCommands.some(cmd => args[0] === cmd || args[0] === cmd.replace('--', ''));

// Handle non-interactive commands first
if (isNonInteractiveCommand) {
	executeNonInteractiveCommand(args);
} else {
	// Check if stdin supports raw mode (TTY) for interactive mode
	if (!process.stdin.isTTY) {
		console.error('Error: CodeMonkey requires an interactive terminal (TTY) for chat mode.');
		console.error('');
		console.error('Usage:');
		console.error('  codemonkey                    # Interactive chat mode (requires TTY)');
		console.error('  codemonkey init               # Initialize project');
		console.error('  codemonkey custom-commands    # List custom commands');
		console.error('  codemonkey status             # Show status');
		console.error('  codemonkey --help             # Show help');
		console.error('');
		console.error('For automated scripts, use specific non-interactive commands.');
		process.exit(1);
	}

	// Start interactive mode
	render(<App />);
}

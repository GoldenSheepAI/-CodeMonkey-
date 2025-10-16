import React from 'react';
import {type Command} from './types/index.js';
import ErrorMessage from './components/error-message.js';

export class CommandRegistry {
	private readonly commands = new Map<string, Command>();

	register(command: Command | Command[]): void {
		if (Array.isArray(command)) {
			for (const cmd of command) this.register(cmd);
			return;
		}

		this.commands.set(command.name, command);
	}

	get(name: string): Command | undefined {
		return this.commands.get(name);
	}

	getAll(): Command[] {
		return [...this.commands.values()];
	}

	getCompletions(prefix: string): string[] {
		return [...this.commands.keys()]
			.filter(name => name.startsWith(prefix))
			.sort();
	}

	async execute(
		input: string,
		messages: Array<import('./types/index.js').Message>,
		metadata: {provider: string; model: string; tokens: number},
	): Promise<void | string | React.ReactNode> {
		const parts = input.trim().split(/\s+/);
		const commandName = parts[0];
		if (!commandName) {
			return React.createElement(ErrorMessage, {
				key: `error-${Date.now()}`,
				message: 'Invalid command. Type /help for available commands.',
				hideBox: true,
			});
		}

		const args = parts.slice(1);

		const command = this.get(commandName);
		if (!command) {
			return React.createElement(ErrorMessage, {
				key: `error-${Date.now()}`,
				message: `Unknown command: ${commandName}. Type /help for available commands.`,
				hideBox: true,
			});
		}

		return command.handler(args, messages, metadata);
	}
}

export const commandRegistry = new CommandRegistry();

import {type Message} from './core.js';

export type Command<T = React.ReactElement> = {
	name: string;
	description: string;
	handler: (
		args: string[],
		messages: Message[],
		metadata: {provider: string; model: string; tokens: number},
	) => Promise<T>;
};

export type ParsedCommand = {
	isCommand: boolean;
	command?: string;
	args?: string[];
	fullCommand?: string;
	// Bash command properties
	isBashCommand?: boolean;
	bashCommand?: string;
};

export type CustomCommandMetadata = {
	description?: string;
	aliases?: string[];
	parameters?: string[];
};

export type CustomCommand = {
	name: string;
	path: string;
	namespace?: string;
	fullName: string; // E.g., "refactor:dry" or just "test"
	metadata: CustomCommandMetadata;
	content: string; // The markdown content without frontmatter
};

export type ParsedCustomCommand = {
	metadata: CustomCommandMetadata;
	content: string;
};

import type React from 'react';

export type Message = {
	role: 'user' | 'assistant' | 'system' | 'tool';
	content: string;
	tool_calls?: ToolCall[];
	tool_call_id?: string;
	name?: string;
};

export type ToolCall = {
	id: string;
	function: {
		name: string;
		arguments: Record<string, any>;
	};
};

export type ToolResult = {
	tool_call_id: string;
	role: 'tool';
	name: string;
	content: string;
};

export type Tool = {
	type: 'function';
	function: {
		name: string;
		description: string;
		parameters: {
			type: 'object';
			properties: Record<string, any>;
			required: string[];
		};
	};
};

export type ToolHandler = (input: any) => Promise<string>;

export type ToolDefinition = {
	handler: ToolHandler;
	config: Tool;
	formatter?: (
		args: any,
		result?: string,
	) =>
		| string
		| Promise<string>
		| React.ReactElement
		| Promise<React.ReactElement>;
	requiresConfirmation?: boolean;
	validator?: (
		args: any,
	) => Promise<{valid: true} | {valid: false; error: string}>;
};

export type LLMClient = {
	getCurrentModel(): string;
	setModel(model: string): void;
	getContextSize(): number;
	getAvailableModels(): Promise<string[]>;
	chat(messages: Message[], tools: Tool[]): Promise<any>;
	chatStream(messages: Message[], tools: Tool[]): AsyncIterable<any>;
	clearContext(): Promise<void>;
};

export type ToolExecutionResult = {
	executed: boolean;
	results: ToolResult[];
};

export type DevelopmentMode = 'normal' | 'auto-accept' | 'plan';

export const DEVELOPMENT_MODE_LABELS: Record<DevelopmentMode, string> = {
	normal: '▶ normal mode on',
	'auto-accept': '⏵⏵ auto-accept mode on',
	plan: '⏸ plan mode on',
};

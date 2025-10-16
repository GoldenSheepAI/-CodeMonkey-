import {type ReactNode} from 'react';
import {type ToolCall, type LLMClient} from './core.js';
import {type CustomCommand} from './commands.js';

export type AssistantMessageProps = {
	message: string;
	model: string;
};

export type BashExecutionIndicatorProps = {
	command: string;
};

export type ChatQueueProps = {
	staticComponents?: ReactNode[];
	queuedComponents?: ReactNode[];
	displayCount?: number;
	forceAllStatic?: boolean; // Force all messages to Static (e.g., during tool confirmation)
};

export type ChatProps = {
	onSubmit?: (message: string) => void;
	placeholder?: string;
	customCommands?: string[];
	disabled?: boolean;
	onCancel?: () => void;
};

export type Completion = {name: string; isCustom: boolean};

export type CustomCommandsProps = {
	commands: CustomCommand[];
};

export type ModelSelectorProps = {
	client: LLMClient | undefined;
	currentModel: string;
	onModelSelect: (model: string) => void;
	onCancel: () => void;
};

export type ModelOption = {
	value: string;
	label: string;
	description?: string;
};

export type ProviderSelectorProps = {
	currentProvider: string;
	onProviderSelect: (provider: string) => void;
	onCancel: () => void;
};

export type ProviderOption = {
	value: string;
	label: string;
	available: boolean;
};

export type StatusProps = {
	conversationContext: any;
	currentProvider: string;
	currentModel: string;
	updateInfo?: any;
};

export type ToolConfirmationProps = {
	toolCall: ToolCall;
	onConfirm: (confirmed: boolean) => void;
	onCancel: () => void;
};

export type ConfirmationOption = {
	key: string;
	label: string;
	action: () => void;
};

export type ToolExecutionIndicatorProps = {
	toolName: string;
	currentIndex: number;
	totalTools: number;
};

export type UserMessageProps = {
	message: string;
};

export type MCPProps = {
	mcpServers: any[];
};

export type DebugProps = {
	messages: any[];
};

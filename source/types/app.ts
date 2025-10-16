import type React from 'react';
import {type CustomCommandLoader} from '@/custom-commands/loader.js';
import {type CustomCommandExecutor} from '@/custom-commands/executor.js';

export type MessageSubmissionOptions = {
	customCommandCache: Map<string, any>;
	customCommandLoader: CustomCommandLoader | undefined;
	customCommandExecutor: CustomCommandExecutor | undefined;
	onClearMessages: () => Promise<void>;
	onEnterModelSelectionMode: () => void;
	onEnterProviderSelectionMode: () => void;
	onEnterThemeSelectionMode: () => void;
	onEnterRecommendationsMode: () => void;
	onShowStatus: () => void;
	onHandleChatMessage: (message: string) => Promise<void>;
	onAddToChatQueue: (component: React.ReactNode) => void;
	componentKeyCounter: number;
	setMessages: (messages: any[]) => void;
	messages: any[];
	setIsBashExecuting: (executing: boolean) => void;
	setCurrentBashCommand: (command: string) => void;
	provider: string;
	model: string;
	theme: string;
	updateInfo: any;
	getMessageTokens: (message: any) => number;
};

export type ThinkingStats = {
	totalTokens: number;
	totalCost: number;
	elapsedTime: number;
	isThinking: boolean;
};

export type ConversationContext = {
	currentTokenCount: number;
	maxTokens: number;
	tokenPercentage: number;
};

export type UseAppInitializationProps = {
	isInitialized: boolean;
	client: any | undefined;
	currentProvider: string;
	currentModel: string;
	availableModels: any[];
	preferences: any;
	hasUpdate: boolean;
	updateInfo: any;
	isLoading: boolean;
	initError: string | undefined;
};

import type React from 'react';

export type UseModeHandlersProps = {
	onEnterModelSelectionMode: () => void;
	onEnterProviderSelectionMode: () => void;
	onExitSelectionMode: () => void;
};

export type UseToolHandlerProps = {
	client: any;
	setIsThinking: (thinking: boolean) => void;
	onAddToChatQueue: (component: React.ReactNode) => void;
	componentKeyCounter: number;
	messages: any[];
	setMessages: (messages: any[]) => void;
};

export type UseChatHandlerProps = {
	client: any;
	setIsThinking: (thinking: boolean) => void;
	onAddToChatQueue: (component: React.ReactNode) => void;
	componentKeyCounter: number;
	messages: any[];
	setMessages: (messages: any[]) => void;
	setConversationContext: (context: any) => void;
};

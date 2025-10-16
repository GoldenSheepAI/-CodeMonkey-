import {ChatOpenAI} from '@langchain/openai';
import {Agent, fetch, type RequestInfo, type RequestInit} from 'undici';
import {
	AIMessage,
	HumanMessage,
	SystemMessage,
	ToolMessage,
	type BaseMessage,
} from '@langchain/core/messages';
import type {
	Message,
	Tool,
	LLMClient,
	LangChainProviderConfig,
} from './types/index.js';
import {logError} from './utils/message-queue.js';
import {XMLToolCallParser} from './tool-calling/xml-parser.js';

/**
 * Converts our Message format to LangChain BaseMessage format
 */
function convertToLangChainMessage(message: Message): BaseMessage {
	switch (message.role) {
		case 'user': {
			return new HumanMessage(message.content || '');
		}

		case 'system': {
			return new SystemMessage(message.content || '');
		}

		case 'assistant': {
			if (message.tool_calls && message.tool_calls.length > 0) {
				return new AIMessage({
					content: message.content || '',
					tool_calls: message.tool_calls.map(tc => ({
						id: tc.id,
						name: tc.function.name,
						args: tc.function.arguments,
					})),
				});
			}

			return new AIMessage(message.content || '');
		}

		case 'tool': {
			return new ToolMessage({
				content: message.content || '',
				tool_call_id: message.tool_call_id || '',
				name: message.name || '',
			});
		}

		default: {
			throw new Error(`Unsupported message role: ${message.role}`);
		}
	}
}

/**
 * Converts LangChain AIMessage back to our Message format
 */
function convertFromLangChainMessage(message: AIMessage): Message {
	const result: Message = {
		role: 'assistant',
		content: message.content as string,
	};

	if (message.tool_calls && message.tool_calls.length > 0) {
		result.tool_calls = message.tool_calls.map(tc => ({
			id: tc.id || '',
			function: {
				name: tc.name,
				arguments: tc.args,
			},
		}));
	}

	return result;
}

export class LangGraphClient implements LLMClient {
	private chatModel: ChatOpenAI;
	private currentModel: string;
	private readonly availableModels: string[];
	private readonly providerConfig: LangChainProviderConfig;
	private readonly modelInfoCache = new Map<string, any>();
	private readonly undiciAgent: Agent;

	constructor(providerConfig: LangChainProviderConfig) {
		this.providerConfig = providerConfig;
		this.availableModels = providerConfig.models;
		this.currentModel = providerConfig.models[0] || '';

		const {requestTimeout, socketTimeout, connectionPool} = this.providerConfig;
		const resolvedSocketTimeout =
			socketTimeout === -1
				? 0
				: socketTimeout || requestTimeout === -1
				? 0
				: requestTimeout || 120_000;

		this.undiciAgent = new Agent({
			connect: {
				timeout: resolvedSocketTimeout,
			},
			bodyTimeout: resolvedSocketTimeout,
			headersTimeout: resolvedSocketTimeout,
			keepAliveTimeout: connectionPool?.idleTimeout,
			keepAliveMaxTimeout: connectionPool?.cumulativeMaxIdleTimeout,
		});

		this.chatModel = this.createChatModel();
	}

	static async create(
		providerConfig: LangChainProviderConfig,
	): Promise<LangGraphClient> {
		const client = new LangGraphClient(providerConfig);
		return client;
	}

	private createChatModel(): ChatOpenAI {
		const {config, requestTimeout} = this.providerConfig;

		const customFetch = async (url: RequestInfo, options: RequestInit) => {
			return fetch(url, {
				...options,
				dispatcher: this.undiciAgent,
			});
		};

		const chatConfig: any = {
			modelName: this.currentModel,
			openAIApiKey: config.apiKey || 'dummy-key',
			configuration: {
				baseURL: config.baseURL,
				fetch: customFetch,
			},
			...config,
		};

		if (requestTimeout === -1) {
			chatConfig.timeout = undefined;
		} else if (requestTimeout) {
			chatConfig.timeout = requestTimeout;
		} else {
			// Default
			chatConfig.timeout = 120_000; // 2 minutes
		}

		return new ChatOpenAI(chatConfig);
	}

	setModel(model: string): void {
		this.currentModel = model;
		this.chatModel = this.createChatModel();
	}

	getCurrentModel(): string {
		return this.currentModel;
	}

	getContextSize(): number {
		// For OpenRouter, get from cached model info
		if (this.providerConfig.name === 'openrouter') {
			const modelData = this.modelInfoCache.get(this.currentModel);
			if (modelData && modelData.context_length) {
				return modelData.context_length;
			}

			return 0;
		}

		// For OpenAI-compatible (local models), we can't reliably know the context
		if (this.providerConfig.name === 'openai-compatible') {
			return 0;
		}

		// Try to get from LangChain model if available
		if (this.chatModel && (this.chatModel as any).maxTokens) {
			return (this.chatModel as any).maxTokens;
		}

		return 0;
	}

	async getAvailableModels(): Promise<string[]> {
		return this.availableModels;
	}

	async chat(messages: Message[], tools: Tool[]): Promise<any> {
		try {
			const langchainMessages = messages.map(convertToLangChainMessage);
			let result: AIMessage;

			// Try to bind tools if available - fallback to XML parsing
			if (tools.length > 0) {
				try {
					// Convert our tools to LangChain format
					const langchainTools = tools.map(tool => ({
						type: 'function' as const,
						function: {
							name: tool.function.name,
							description: tool.function.description,
							parameters: tool.function.parameters,
						},
					}));

					// Try binding tools to the model
					const modelWithTools = this.chatModel.bindTools(langchainTools);
					result = (await modelWithTools.invoke(
						langchainMessages,
					)) as AIMessage;
				} catch {
					// Tool binding failed, fall back to base model
					result = (await this.chatModel.invoke(
						langchainMessages,
					)) as AIMessage;
				}
			} else {
				// No tools, use base model
				result = (await this.chatModel.invoke(langchainMessages)) as AIMessage;
			}

			let convertedMessage = convertFromLangChainMessage(result);

			// If no native tool calls but tools are available, try XML parsing
			if (
				tools.length > 0 &&
				(!convertedMessage.tool_calls ||
					convertedMessage.tool_calls.length === 0) &&
				convertedMessage.content
			) {
				const {content} = convertedMessage;

				if (XMLToolCallParser.hasToolCalls(content)) {
					const parsedToolCalls = XMLToolCallParser.parseToolCalls(content);
					const toolCalls =
						XMLToolCallParser.convertToToolCalls(parsedToolCalls);
					const cleanedContent =
						XMLToolCallParser.removeToolCallsFromContent(content);

					convertedMessage = {
						...convertedMessage,
						content: cleanedContent,
						tool_calls: toolCalls,
					};
				}
			}

			return {
				choices: [
					{
						message: convertedMessage,
					},
				],
			};
		} catch (error) {
			logError(`LangGraph chat error: ${error}`);
			return null;
		}
	}

	async *chatStream(messages: Message[], tools: Tool[]): AsyncIterable<any> {
		try {
			// Use the non-streaming chat method which handles tool calls properly
			const result = await this.chat(messages, tools);

			if (!result) {
				yield {done: true};
				return;
			}

			const {message} = result.choices[0];

			// If there are tool calls, yield them with preserved content
			if (message.tool_calls && message.tool_calls.length > 0) {
				yield {
					message: {
						content: message.content || '',
						tool_calls: message.tool_calls,
					},
					done: false,
				};
			} else if (message.content) {
				// If there's content, simulate streaming by yielding it in chunks
				const content = message.content as string;
				const chunkSize = 50;

				for (let i = 0; i < content.length; i += chunkSize) {
					const chunk = content.slice(i, i + chunkSize);
					yield {
						message: {
							content: chunk,
						},
						done: false,
					};

					// Small delay to simulate streaming
					await new Promise(resolve => setTimeout(resolve, 10));
				}

				yield {done: true};
			} else {
				yield {done: true};
			}
		} catch (error) {
			logError(`LangGraph stream error: ${error}`);
		}
	}

	async clearContext(): Promise<void> {
		// No internal state to clear in unified approach
	}
}

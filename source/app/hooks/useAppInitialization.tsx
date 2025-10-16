import React, {useEffect} from 'react';
import {type LLMClient} from '@/types/core.js';
import {ToolManager} from '@/tools/tool-manager.js';
import {CustomCommandLoader} from '@/custom-commands/loader.js';
import {CustomCommandExecutor} from '@/custom-commands/executor.js';
import {createLLMClient} from '@/client-factory.js';
import {
	getLastUsedModel,
	loadPreferences,
	updateLastUsed,
} from '@/config/preferences.js';
import type {
	MCPInitResult,
	UserPreferences,
	UpdateInfo,
} from '@/types/index.js';
import {
	setToolManagerGetter,
	setToolRegistryGetter,
} from '@/message-handler.js';
import {commandRegistry} from '@/commands.js';
import {shouldLog} from '@/config/logging.js';
import {appConfig} from '@/config/index.js';
import {
	clearCommand,
	commandsCommand,
	debugCommand,
	exitCommand,
	exportCommand,
	feedbackCommand,
	helpCommand,
	initCommand,
	mcpCommand,
	modelCommand,
	providerCommand,
	recommendationsCommand,
	statusCommand,
	themeCommand,
	tokensCommand,
	updateCommand,
} from '@/commands/index.js';
import SuccessMessage from '@/components/success-message.js';
import ErrorMessage from '@/components/error-message.js';
import InfoMessage from '@/components/info-message.js';
import {checkForUpdates} from '@/utils/update-checker.js';

type UseAppInitializationProps = {
	setClient: (client: LLMClient | undefined) => void;
	setCurrentModel: (model: string) => void;
	setCurrentProvider: (provider: string) => void;
	setToolManager: (manager: ToolManager | undefined) => void;
	setCustomCommandLoader: (loader: CustomCommandLoader | undefined) => void;
	setCustomCommandExecutor: (
		executor: CustomCommandExecutor | undefined,
	) => void;
	setCustomCommandCache: (cache: Map<string, any>) => void;
	setStartChat: (start: boolean) => void;
	setMcpInitialized: (initialized: boolean) => void;
	setUpdateInfo: (info: UpdateInfo | undefined) => void;
	addToChatQueue: (component: React.ReactNode) => void;
	componentKeyCounter: number;
	customCommandCache: Map<string, any>;
};

export function useAppInitialization({
	setClient,
	setCurrentModel,
	setCurrentProvider,
	setToolManager,
	setCustomCommandLoader,
	setCustomCommandExecutor,
	setCustomCommandCache,
	setStartChat,
	setMcpInitialized,
	setUpdateInfo,
	addToChatQueue,
	componentKeyCounter,
	customCommandCache,
}: UseAppInitializationProps) {
	// Initialize LLM client and model
	const initializeClient = async (preferredProvider?: string) => {
		const {client, actualProvider} = await createLLMClient(preferredProvider);
		setClient(client);
		setCurrentProvider(actualProvider);

		// Try to use the last used model for this provider
		const lastUsedModel = getLastUsedModel(actualProvider);

		let finalModel: string;
		if (lastUsedModel) {
			const availableModels = await client.getAvailableModels();
			if (availableModels.includes(lastUsedModel)) {
				client.setModel(lastUsedModel);
				finalModel = lastUsedModel;
			} else {
				finalModel = client.getCurrentModel();
			}
		} else {
			finalModel = client.getCurrentModel();
		}

		setCurrentModel(finalModel);

		// Save the preference - use actualProvider and the model that was actually set
		updateLastUsed(actualProvider, finalModel);
	};

	// Load and cache custom commands
	const loadCustomCommands = async (loader: CustomCommandLoader) => {
		await loader.loadCommands();
		const customCommands = loader.getAllCommands() || [];

		// Populate command cache for better performance
		customCommandCache.clear();
		for (const command of customCommands) {
			customCommandCache.set(command.name, command);
			// Also cache aliases for quick lookup
			if (command.metadata?.aliases) {
				for (const alias of command.metadata.aliases) {
					customCommandCache.set(alias, command);
				}
			}
		}

		if (customCommands.length > 0 && shouldLog('info')) {
			addToChatQueue(
				<InfoMessage
					key={`custom-commands-loaded-${componentKeyCounter}`}
					hideBox
					message={`Loaded ${customCommands.length} custom commands from .codemonkey/commands`}
				/>,
			);
		}
	};

	// Initialize MCP servers if configured
	const initializeMCPServers = async (toolManager: ToolManager) => {
		if (appConfig.mcpServers && appConfig.mcpServers.length > 0) {
			// Add connecting message to chat queue
			addToChatQueue(
				<InfoMessage
					key={`mcp-connecting-${componentKeyCounter}`}
					hideBox
					message={`Connecting to ${appConfig.mcpServers.length} MCP server${
						appConfig.mcpServers.length > 1 ? 's' : ''
					}...`}
				/>,
			);

			// Define progress callback to show live updates
			const onProgress = (result: MCPInitResult) => {
				if (result.success) {
					addToChatQueue(
						<SuccessMessage
							key={`mcp-success-${result.serverName}-${componentKeyCounter}`}
							hideBox
							message={`Connected to MCP server "${result.serverName}" with ${result.toolCount} tools`}
						/>,
					);
				} else {
					addToChatQueue(
						<ErrorMessage
							key={`mcp-error-${result.serverName}-${componentKeyCounter}`}
							hideBox
							message={`Failed to connect to MCP server "${result.serverName}": ${result.error}`}
						/>,
					);
				}
			};

			try {
				await toolManager.initializeMCP(appConfig.mcpServers, onProgress);
			} catch (error) {
				addToChatQueue(
					<ErrorMessage
						key={`mcp-fatal-error-${componentKeyCounter}`}
						hideBox
						message={`Failed to initialize MCP servers: ${error}`}
					/>,
				);
			}

			// Mark MCP as initialized whether successful or not
			setMcpInitialized(true);
		} else {
			// No MCP servers configured, mark as initialized immediately
			setMcpInitialized(true);
		}
	};

	const start = async (
		newToolManager: ToolManager,
		newCustomCommandLoader: CustomCommandLoader,
		preferences: UserPreferences,
	): Promise<void> => {
		try {
			await initializeClient(preferences.lastProvider);
		} catch (error) {
			// Don't crash the app - just show the error and continue without a client
			addToChatQueue(
				<ErrorMessage
					key={`init-error-${componentKeyCounter}`}
					hideBox
					message={`No providers available: ${error}`}
				/>,
			);
			// Leave client as null - the UI will handle this gracefully
		}

		try {
			await loadCustomCommands(newCustomCommandLoader);
		} catch (error) {
			addToChatQueue(
				<ErrorMessage
					key={`commands-error-${componentKeyCounter}`}
					hideBox
					message={`Failed to load custom commands: ${error}`}
				/>,
			);
		}
	};

	useEffect(() => {
		const initializeApp = async () => {
			try {
				setClient(undefined);
				setCurrentModel('');

				const newToolManager = new ToolManager();
				const newCustomCommandLoader = new CustomCommandLoader();
				const newCustomCommandExecutor = new CustomCommandExecutor();

				setToolManager(newToolManager);
				setCustomCommandLoader(newCustomCommandLoader);
				setCustomCommandExecutor(newCustomCommandExecutor);

				// Load preferences - we'll pass them directly to avoid state timing issues
				const preferences = loadPreferences();

				// Set up the tool registry getter for the message handler
				setToolRegistryGetter(() => newToolManager.getToolRegistry());

				// Set up the tool manager getter for commands that need it
				setToolManagerGetter(() => newToolManager);

				commandRegistry.register([
					helpCommand,
					exitCommand,
					clearCommand,
					modelCommand,
					providerCommand,
					commandsCommand,
					debugCommand,
					mcpCommand,
					initCommand,
					themeCommand,
					exportCommand,
					updateCommand,
					recommendationsCommand,
					statusCommand,
					feedbackCommand,
					tokensCommand,
				]);

				// Now start with the properly initialized objects (excluding MCP)
				await start(newToolManager, newCustomCommandLoader, preferences);

				// Check for updates before showing UI
				try {
					const info = await checkForUpdates();
					setUpdateInfo(info);
				} catch {
					// Silent failure - don't show errors for update checks
					setUpdateInfo(undefined);
				}

				setStartChat(true);

				// Initialize MCP servers after UI is shown - with error handling
				try {
					await initializeMCPServers(newToolManager);
				} catch (error) {
					// Log MCP initialization error but don't crash the app
					console.error('MCP initialization failed:', error);
					// App continues to work without MCP
				}
			} catch (error) {
				// Critical app initialization error - show error and exit gracefully
				console.error('Critical initialization error:', error);
				addToChatQueue(
					<ErrorMessage
						key={`init-error-${Date.now()}`}
						message={`Failed to initialize CodeMonkey: ${error instanceof Error ? error.message : 'Unknown error'}`}
					/>,
				);
				// Still allow basic functionality by setting minimal state
				setStartChat(true);
			}
		};

		initializeApp();
	}, []);

	return {
		initializeClient,
		loadCustomCommands,
		initializeMCPServers,
	};
}

import {LangGraphClient} from './langgraph-client.js';
import {appConfig} from './config/index.js';
import {loadPreferences} from './config/preferences.js';
import type {LLMClient, LangChainProviderConfig} from './types/index.js';
import {existsSync} from 'fs';
import {join} from 'path';
import {detectOllamaModels} from './utils/ollama-detector.js';
import {secureKeyStorage} from './utils/secure-key-storage.js';

export async function createLLMClient(
	provider?: string,
): Promise<{client: LLMClient; actualProvider: string}> {
	// Check if agents.config.json exists
	const agentsJsonPath = join(process.cwd(), 'agents.config.json');
	const hasConfigFile = existsSync(agentsJsonPath);

	// Always use LangGraph - it handles both tool-calling and non-tool-calling models
	return createLangGraphClient(provider, hasConfigFile);
}

async function createLangGraphClient(
	requestedProvider?: string,
	hasConfigFile = true,
): Promise<{client: LLMClient; actualProvider: string}> {
	// Load provider configs
	const providers = await loadProviderConfigs();

	if (providers.length === 0) {
		if (!hasConfigFile) {
			throw new Error(
				'No agents.config.json found. Please create a configuration file with provider settings.',
			);
		} else {
			throw new Error('No providers configured in agents.config.json');
		}
	}

	// Determine which provider to try first
	let targetProvider: string;
	if (requestedProvider) {
		targetProvider = requestedProvider;
	} else {
		// Use preferences or default to first available provider
		const preferences = loadPreferences();
		targetProvider = preferences.lastProvider || providers[0].name;
	}

	// Order providers: requested first, then others
	const availableProviders = providers.map(p => p.name);
	const providerOrder = [
		targetProvider,
		...availableProviders.filter(p => p !== targetProvider),
	];

	const errors: string[] = [];

	for (const providerType of providerOrder) {
		try {
			const providerConfig = providers.find(p => p.name === providerType);
			if (!providerConfig) {
				continue;
			}

			// Test provider connection
			await testProviderConnection(providerConfig);

			const client = await LangGraphClient.create(providerConfig);

			return {client, actualProvider: providerType};
		} catch (error: any) {
			errors.push(`${providerType}: ${error.message}`);
		}
	}

	// If we get here, all providers failed
	if (!hasConfigFile) {
		const combinedError = `No providers available: ${
			errors[0]?.split(': ')[1] || 'Unknown error'
		}\n\nPlease create an agents.config.json file with provider configuration.`;
		throw new Error(combinedError);
	} else {
		const combinedError = `All configured providers failed:\n${errors
			.map(e => `• ${e}`)
			.join(
				'\n',
			)}\n\nPlease check your provider configuration in agents.config.json`;
		throw new Error(combinedError);
	}
}

async function loadProviderConfigs(): Promise<LangChainProviderConfig[]> {
	const providers: LangChainProviderConfig[] = [];
	const preferences = loadPreferences();
	const budgetMode = preferences.budgetMode;

	// Load providers from the new API Providers array structure
	if (appConfig["API Providers"]) {
		for (const provider of appConfig["API Providers"]) {
			// Skip disabled providers
			if (provider.enabled === false) {
				continue;
			}

			// Ignore Budget Mode proxying (ToknXR disabled). Always use provider base URL.
			let baseURL = provider.baseUrl;

			// Auto-detect Ollama models if enabled
			let models = provider.models || [];
			if (provider.autoDetectModels && provider.name === 'Local Ollama') {
				const detectedModels = await detectOllamaModels();
				if (detectedModels.length > 0) {
					models = detectedModels;
				}
			}

			// Check for stored API key first, then fall back to config
			let apiKey = provider.apiKey || 'dummy-key';

			// Try to get stored key if the config key looks like a placeholder
			if (apiKey.includes('YOUR_') || apiKey.includes('${')) {
				const storedKey = secureKeyStorage.getKey(provider.name);
				if (storedKey) {
					apiKey = storedKey;
				}
			}

			providers.push({
				name: provider.name,
				type: 'openai',
				models,
				requestTimeout: provider.requestTimeout,
				socketTimeout: provider.socketTimeout,
				connectionPool: provider.connectionPool,
				config: {
					baseURL,
					apiKey,
				},
			});
		}
	}

	return providers;
}

async function testProviderConnection(
	providerConfig: LangChainProviderConfig,
): Promise<void> {
	// Test local servers for connectivity
	if (
		providerConfig.config.baseURL &&
		providerConfig.config.baseURL.includes('localhost')
	) {
		try {
			await fetch(providerConfig.config.baseURL, {
				signal: AbortSignal.timeout(5000),
			});
			// Don't check response.ok as some servers return 404 for root path
			// We just need to confirm the server responded (not a network error)
		} catch (error) {
			// Only throw if it's a network error, not a 404 or other HTTP response
			if (error instanceof TypeError) {
				throw new Error(
					`Server not accessible at ${providerConfig.config.baseURL}`,
				);
			}
			// For AbortError (timeout), also throw
			if (error instanceof Error && error.name === 'AbortError') {
				throw new Error(
					`Server not accessible at ${providerConfig.config.baseURL}`,
				);
			}
			// Other errors (like HTTP errors) mean the server is responding, so pass
		}
	}
	// Require API key for hosted providers
	if (
		!providerConfig.config.apiKey &&
		!providerConfig.config.baseURL?.includes('localhost')
	) {
		throw new Error('API key required for hosted providers');
	}
}

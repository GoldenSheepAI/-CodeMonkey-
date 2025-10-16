import type {ThemePreset} from './ui.js';

// LangChain provider configurations
export type LangChainProviderConfig = {
	name: string;
	type: string;
	models: string[];
	requestTimeout?: number;
	socketTimeout?: number;
	connectionPool?: {
		idleTimeout?: number;
		cumulativeMaxIdleTimeout?: number;
	};
	config: Record<string, any>;
};

export type AppConfig = {
	// Providers array structure - all OpenAI compatible
	providers?: Array<{
		name: string;
		baseUrl?: string;
		apiKey?: string;
		models: string[];
		requestTimeout?: number;
		socketTimeout?: number;
		connectionPool?: {
			idleTimeout?: number;
			cumulativeMaxIdleTimeout?: number;
		};
		[key: string]: any; // Allow additional provider-specific config
	}>;

	mcpServers?: Array<{
		name: string;
		command: string;
		args?: string[];
		env?: Record<string, string>;
	}>;
};

export type UserPreferences = {
	lastProvider?: string;
	lastModel?: string;
	providerModels?: {
		[key in string]?: string;
	};
	lastUpdateCheck?: number;
	selectedTheme?: ThemePreset;
	trustedDirectories?: string[];
};

export type LogLevel = 'silent' | 'normal' | 'verbose';

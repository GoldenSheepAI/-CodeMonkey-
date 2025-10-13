import type {ThemePreset} from './ui.js';

// LangChain provider configurations
export interface LangChainProviderConfig {
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
}

export interface AppConfig {
	// Providers array structure - all OpenAI compatible
	providers?: {
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
	}[];

	mcpServers?: {
		name: string;
		command: string;
		args?: string[];
		env?: Record<string, string>;
	}[];
}

export interface UserPreferences {
	lastProvider?: string;
	lastModel?: string;
	providerModels?: {
		[key in string]?: string;
	};
	lastUpdateCheck?: number;
	selectedTheme?: ThemePreset;
	trustedDirectories?: string[];
	budgetMode?: {
		enabled: boolean;
		toknxrProxyUrl?: string;
		showCosts?: boolean;
		budgetLimit?: number;
		currentSpend?: number;
	};
	secureMode?: {
		enabled: boolean;
		autoRedact?: boolean;
		warnOnly?: boolean;
		scanPatterns?: string[];
		detectedLeaks?: number;
	};
}

export type LogLevel = 'silent' | 'normal' | 'verbose';

import {existsSync, readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {config as loadEnv} from 'dotenv';
import {loadPreferences} from './preferences.js';
import {getThemeColors, defaultTheme} from './themes.js';
import {substituteEnvVars} from './env-substitution.js';
import {logError} from '@/utils/message-queue.js';
import type {AppConfig, Colors} from '@/types/index.js';

// Load .env file from working directory (shell environment takes precedence)
// Suppress dotenv console output by temporarily redirecting stdout
const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
	const originalWrite = process.stdout.write;
	process.stdout.write = () => true;
	try {
		loadEnv({path: envPath});
	} finally {
		process.stdout.write = originalWrite;
	}
}

// Function to load app configuration from agents.config.json if it exists
function loadAppConfig(): AppConfig {
	const agentsJsonPath = join(process.cwd(), 'agents.config.json');

	if (existsSync(agentsJsonPath)) {
		try {
			const rawData = readFileSync(agentsJsonPath, 'utf-8');
			try {
				const agentsData = JSON.parse(rawData);

				// Apply environment variable substitution
				const processedData = substituteEnvVars(agentsData);

				if (processedData.codemonkey) {
					return {
						providers: processedData.codemonkey.providers,
						mcpServers: processedData.codemonkey.mcpServers,
					};
				}
			} catch (parseError) {
				logError(`Failed to parse agents.config.json: ${parseError}`);
			}
		} catch (readError) {
			logError(`Failed to read agents.config.json: ${readError}`);
		}
	}

	return {};
}

export const appConfig = loadAppConfig();

// Legacy config for backwards compatibility (no longer specific to any provider)
export const legacyConfig = {
	maxTokens: 4096,
	contextSize: 4000,
};

export function getColors(): Colors {
	const preferences = loadPreferences();
	const selectedTheme = preferences.selectedTheme || defaultTheme;
	return getThemeColors(selectedTheme);
}

// Legacy export for backwards compatibility
export const colors: Colors = getColors();

// Get the package root directory (where this module is installed)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Go up from dist/config to package root, then to source/app/prompts/main-prompt.md
export const promptPath = join(
	__dirname,
	'../../source/app/prompts/main-prompt.md',
);

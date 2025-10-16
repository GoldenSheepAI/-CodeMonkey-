import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {shouldLog} from './logging.js';
import {logError} from '@/utils/message-queue.js';

import type {UserPreferences} from '@/types/index.js';

const PREFERENCES_PATH = join(homedir(), '.codemonkey-preferences.json');

export function loadPreferences(): UserPreferences {
	if (existsSync(PREFERENCES_PATH)) {
		try {
			const data = readFileSync(PREFERENCES_PATH, 'utf-8');
			try {
				return JSON.parse(data);
			} catch (parseError) {
				if (shouldLog('warn')) {
					logError(`Failed to parse preferences file: ${parseError}`);
				}
				// Return empty preferences if parsing fails
				return {};
			}
		} catch (readError) {
			if (shouldLog('warn')) {
				logError(`Failed to read preferences file: ${readError}`);
			}
		}
	}

	return {};
}

export function savePreferences(preferences: UserPreferences): void {
	try {
		writeFileSync(PREFERENCES_PATH, JSON.stringify(preferences, null, 2));
	} catch (error) {
		if (shouldLog('warn')) {
			logError(`Failed to save preferences: ${error}`);
		}
	}
}

export function updateLastUsed(provider: string, model: string): void {
	const preferences = loadPreferences();
	preferences.lastProvider = provider;
	preferences.lastModel = model;

	// Also save the model for this specific provider
	if (!preferences.providerModels) {
		preferences.providerModels = {};
	}

	preferences.providerModels[provider] = model;

	savePreferences(preferences);
}

export function getLastUsedModel(provider: string): string | undefined {
	const preferences = loadPreferences();
	return preferences.providerModels?.[provider];
}

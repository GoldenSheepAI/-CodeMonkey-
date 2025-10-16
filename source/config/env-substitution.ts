import {shouldLog} from './logging.js';
import {logError} from '@/utils/message-queue.js';

// Check if a string contains environment variable references
export function isEnvVarReference(string_: string): boolean {
	if (typeof string_ !== 'string') {
		return false;
	}

	return /\${[A-Z_][A-Z\d_]*(?::-[^}]*)?}|\$[A-Z_][A-Z\d_]*/g.test(string_);
}

// Expand environment variable references in a string
export function expandEnvVar(string_: string): string {
	if (typeof string_ !== 'string') {
		return string_;
	}

	const regex = /\${([A-Z_][A-Z\d_]*)(?::-(.*?))?}|\$([A-Z_][A-Z\d_]*)/g;

	return string_.replace(
		regex,
		(match, bracedVarName, defaultValue, unbracedVarName) => {
			const varName = bracedVarName || unbracedVarName;
			const envValue = process.env[varName];

			if (envValue !== undefined) {
				return envValue;
			}

			if (defaultValue !== undefined) {
				return defaultValue;
			}

			if (shouldLog('warn')) {
				logError(
					`Environment variable ${varName} not found in config, using empty string`,
				);
			}

			return '';
		},
	);
}

// Recursively substitute environment variables in objects, arrays, and strings
export function substituteEnvVars(value: any): any {
	if (value === null || value === undefined) {
		return value;
	}

	if (typeof value === 'string') {
		return expandEnvVar(value);
	}

	if (Array.isArray(value)) {
		return value.map(item => substituteEnvVars(item));
	}

	if (typeof value === 'object') {
		const result: any = {};
		for (const [key, value_] of Object.entries(value)) {
			result[key] = substituteEnvVars(value_);
		}

		return result;
	}

	return value;
}

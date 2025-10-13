/**
 * Security Scanner - NoLeakAI Integration
 * Scans prompts for sensitive data before sending to AI
 */

import {loadPreferences} from '@/config/preferences.js';

export interface ScanResult {
	isSafe: boolean;
	detectedSecrets: Array<{
		type: string;
		pattern: string;
		position: number;
	}>;
	redactedText?: string;
	warnings: string[];
}

/**
 * Common patterns for sensitive data detection
 */
const SECURITY_PATTERNS = {
	apiKeys: [
		/sk-[a-zA-Z0-9]{48}/g, // OpenAI keys
		/sk-or-v1-[a-zA-Z0-9]{64}/g, // OpenRouter keys
		/sk-ant-[a-zA-Z0-9-]{95}/g, // Anthropic keys
		/AIza[0-9A-Za-z-_]{35}/g, // Google API keys
		/ghp_[a-zA-Z0-9]{36}/g, // GitHub personal access tokens
		/gho_[a-zA-Z0-9]{36}/g, // GitHub OAuth tokens
	],
	awsKeys: [
		/AKIA[0-9A-Z]{16}/g, // AWS Access Key ID
		/[0-9a-zA-Z/+=]{40}/g, // AWS Secret (less specific, use with caution)
	],
	privateKeys: [
		/-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
	],
	passwords: [
		/password\s*[:=]\s*["']?[^\s"']+/gi,
		/pwd\s*[:=]\s*["']?[^\s"']+/gi,
	],
	emails: [
		/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
	],
	ipAddresses: [
		/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
	],
};

/**
 * Scan text for sensitive data
 */
export function scanForSecrets(text: string): ScanResult {
	const prefs = loadPreferences();
	const secureMode = prefs.secureMode;

	// If secure mode is disabled, return safe
	if (!secureMode?.enabled) {
		return {
			isSafe: true,
			detectedSecrets: [],
			warnings: [],
		};
	}

	const detectedSecrets: ScanResult['detectedSecrets'] = [];
	const warnings: string[] = [];
	let redactedText = text;

	// Scan for API keys
	for (const pattern of SECURITY_PATTERNS.apiKeys) {
		const matches = text.matchAll(pattern);
		for (const match of matches) {
			detectedSecrets.push({
				type: 'API Key',
				pattern: match[0].substring(0, 10) + '...',
				position: match.index || 0,
			});
			warnings.push(`⚠️  Detected API key: ${match[0].substring(0, 10)}...`);

			// Redact if auto-redact is enabled
			if (secureMode.autoRedact) {
				redactedText = redactedText.replace(match[0], '[REDACTED_API_KEY]');
			}
		}
	}

	// Scan for AWS keys
	for (const pattern of SECURITY_PATTERNS.awsKeys) {
		const matches = text.matchAll(pattern);
		for (const match of matches) {
			// Only flag if it looks like AWS (starts with AKIA)
			if (match[0].startsWith('AKIA')) {
				detectedSecrets.push({
					type: 'AWS Access Key',
					pattern: match[0].substring(0, 10) + '...',
					position: match.index || 0,
				});
				warnings.push(`⚠️  Detected AWS key: ${match[0].substring(0, 10)}...`);

				if (secureMode.autoRedact) {
					redactedText = redactedText.replace(match[0], '[REDACTED_AWS_KEY]');
				}
			}
		}
	}

	// Scan for private keys
	for (const pattern of SECURITY_PATTERNS.privateKeys) {
		const matches = text.matchAll(pattern);
		for (const match of matches) {
			detectedSecrets.push({
				type: 'Private Key',
				pattern: 'SSH/TLS Private Key',
				position: match.index || 0,
			});
			warnings.push('⚠️  Detected private key in prompt');

			if (secureMode.autoRedact) {
				redactedText = redactedText.replace(match[0], '[REDACTED_PRIVATE_KEY]');
			}
		}
	}

	// Scan for passwords
	for (const pattern of SECURITY_PATTERNS.passwords) {
		const matches = text.matchAll(pattern);
		for (const match of matches) {
			detectedSecrets.push({
				type: 'Password',
				pattern: 'password=***',
				position: match.index || 0,
			});
			warnings.push('⚠️  Detected password in prompt');

			if (secureMode.autoRedact) {
				redactedText = redactedText.replace(match[0], 'password=[REDACTED]');
			}
		}
	}

	const isSafe = detectedSecrets.length === 0 || (secureMode.warnOnly ?? true);

	return {
		isSafe,
		detectedSecrets,
		redactedText: secureMode.autoRedact ? redactedText : undefined,
		warnings,
	};
}

/**
 * Get security status message
 */
export function getSecurityStatus(): string {
	const prefs = loadPreferences();
	const secureMode = prefs.secureMode;

	if (!secureMode?.enabled) {
		return '🔓 Secure Mode: OFF';
	}

	if (secureMode.autoRedact) {
		return '🔒 Secure Mode: AUTO-REDACT';
	}

	if (secureMode.warnOnly) {
		return '⚠️  Secure Mode: WARN-ONLY';
	}

	return '🛡️  Secure Mode: BLOCK';
}

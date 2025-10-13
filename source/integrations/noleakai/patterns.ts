/**
 * NoLeakAI Security Patterns
 * Defines patterns for detecting sensitive data and security issues
 */

export interface SecurityPattern {
	name: string;
	pattern: RegExp;
	severity: 'critical' | 'high' | 'medium' | 'low';
	description: string;
	suggestion: string;
}

export const SECURITY_PATTERNS: SecurityPattern[] = [
	{
		name: 'API_KEY',
		pattern: /(?:api[_-]?key|apikey)[\s]*[=:][\s]*['"]([^'"]+)['"]/gi,
		severity: 'critical',
		description: 'Potential API key exposure',
		suggestion: 'Move API keys to environment variables',
	},
	{
		name: 'AWS_ACCESS_KEY',
		pattern: /AKIA[0-9A-Z]{16}/g,
		severity: 'critical',
		description: 'AWS Access Key detected',
		suggestion: 'Remove hardcoded AWS credentials',
	},
	{
		name: 'PRIVATE_KEY',
		pattern: /-----BEGIN (?:RSA |DSA |EC )?PRIVATE KEY-----/g,
		severity: 'critical',
		description: 'Private key detected',
		suggestion: 'Remove private keys from source code',
	},
	{
		name: 'JWT_TOKEN',
		pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
		severity: 'high',
		description: 'JWT token detected',
		suggestion: 'Remove hardcoded JWT tokens',
	},
];

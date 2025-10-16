/**
 * Noleakai Integration - Security scanning and data redaction
 *
 * Advanced security scanning for sensitive data detection and redaction
 * in AI conversations and outputs.
 */

export {SecurityScanner} from './scanner.js';
export {SECURITY_PATTERNS} from './patterns.js';
export {Redactor} from './redactor.js';

export type SecurityScan = {
	id: string;
	content: string;
	timestamp: Date;
	findings: SecurityFinding[];
	severity: 'low' | 'medium' | 'high' | 'critical';
	status: 'clean' | 'flagged' | 'redacted';
};

export type SecurityFinding = {
	type: 'pii' | 'sensitive' | 'malicious' | 'credential' | 'api_key';
	pattern: string;
	line: number;
	column: number;
	confidence: number;
	severity: 'low' | 'medium' | 'high' | 'critical';
	suggestion: string;
};

export type RedactionRule = {
	pattern: RegExp;
	replacement: string;
	description: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
};

export type NoleakaiConfig = {
	enableScanning: boolean;
	enableRedaction: boolean;
	strictMode: boolean;
	customPatterns: RedactionRule[];
	scanTypes: Array<
		'pii' | 'sensitive' | 'malicious' | 'credential' | 'api_key'
	>;
	redactionMarker: string;
};

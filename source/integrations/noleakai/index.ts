/**
 * Noleakai Integration - Security scanning and data redaction
 *
 * Advanced security scanning for sensitive data detection and redaction
 * in AI conversations and outputs.
 */

export {SecurityScanner} from './scanner.js';
export {SECURITY_PATTERNS} from './patterns.js';
export {Redactor} from './redactor.js';

export interface SecurityScan {
	id: string;
	content: string;
	timestamp: Date;
	findings: SecurityFinding[];
	severity: 'low' | 'medium' | 'high' | 'critical';
	status: 'clean' | 'flagged' | 'redacted';
}

export interface SecurityFinding {
	type: 'pii' | 'sensitive' | 'malicious' | 'credential' | 'api_key';
	pattern: string;
	line: number;
	column: number;
	confidence: number;
	severity: 'low' | 'medium' | 'high' | 'critical';
	suggestion: string;
}

export interface RedactionRule {
	pattern: RegExp;
	replacement: string;
	description: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface NoleakaiConfig {
	enableScanning: boolean;
	enableRedaction: boolean;
	strictMode: boolean;
	customPatterns: RedactionRule[];
	scanTypes: ('pii' | 'sensitive' | 'malicious' | 'credential' | 'api_key')[];
	redactionMarker: string;
}

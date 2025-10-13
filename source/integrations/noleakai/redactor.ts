/**
 * NoLeakAI Redactor
 * Redacts sensitive information from code and logs
 */

import {SECURITY_PATTERNS} from './patterns.js';

export interface RedactionResult {
	original: string;
	redacted: string;
	redactedCount: number;
	patterns: string[];
}

export class Redactor {
	private maskChar = '*';
	private partialReveal = 4; // Show first/last N characters

	redact(text: string, options?: {full?: boolean}): RedactionResult {
		let redacted = text;
		let redactedCount = 0;
		const matchedPatterns: string[] = [];

		for (const pattern of SECURITY_PATTERNS) {
			const matches = text.match(pattern.pattern);
			if (matches) {
				for (const match of matches) {
					if (options?.full) {
						redacted = redacted.replace(
							match,
							this.maskChar.repeat(match.length),
						);
					} else {
						redacted = redacted.replace(match, this.partialRedact(match));
					}
					redactedCount++;
					if (!matchedPatterns.includes(pattern.name)) {
						matchedPatterns.push(pattern.name);
					}
				}
			}
		}

		return {
			original: text,
			redacted,
			redactedCount,
			patterns: matchedPatterns,
		};
	}

	private partialRedact(value: string): string {
		if (value.length <= this.partialReveal * 2) {
			return this.maskChar.repeat(value.length);
		}
		const start = value.slice(0, this.partialReveal);
		const end = value.slice(-this.partialReveal);
		const middle = this.maskChar.repeat(value.length - this.partialReveal * 2);
		return `${start}${middle}${end}`;
	}
}

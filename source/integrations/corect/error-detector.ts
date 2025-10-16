/**
 * CoRect Error Detector
 * Detects and categorizes errors in code
 */

export type DetectedError = {
	type: 'syntax' | 'runtime' | 'logical' | 'type' | 'unknown';
	severity: 'critical' | 'high' | 'medium' | 'low';
	message: string;
	location?: {
		file: string;
		line: number;
		column: number;
	};
	stackTrace?: string;
	context?: string;
};

export class ErrorDetector {
	detect(error: Error, code?: string): DetectedError {
		return {
			type: this.categorizeError(error),
			severity: this.assessSeverity(error),
			message: error.message,
			stackTrace: error.stack,
			context: code,
		};
	}

	private categorizeError(error: Error): DetectedError['type'] {
		const name = error.name.toLowerCase();
		const message = error.message.toLowerCase();

		if (name.includes('syntax') || message.includes('syntax')) {
			return 'syntax';
		}

		if (name.includes('type') || message.includes('type')) {
			return 'type';
		}

		if (name.includes('reference') || name.includes('range')) {
			return 'runtime';
		}

		return 'unknown';
	}

	private assessSeverity(error: Error): DetectedError['severity'] {
		// Severity assessment logic
		return 'medium';
	}
}

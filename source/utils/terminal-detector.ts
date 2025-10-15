// Terminal capability detection utility for cross-terminal compatibility
export function detectTerminalCapabilities() {
	// Basic terminal detection
	const isBasicTerminal =
		process.env.TERM === 'dumb' ||
		process.env.TERM === 'unknown' ||
		!process.env.TERM;

	// Unicode support detection (more robust)
	const hasUnicodeSupport = (() => {
		// Check environment variables for UTF support
		const hasUtfEnv =
			process.env.LANG?.includes('UTF') ||
			process.env.LC_ALL?.includes('UTF') ||
			process.env.LC_CTYPE?.includes('UTF');

		// Check for common terminals that support Unicode
		const isKnownGoodTerminal =
			process.env.TERM?.includes('color') ||
			process.env.TERM === 'xterm-256color' ||
			process.env.TERM === 'screen-256color' ||
			process.env.COLORTERM === 'truecolor' ||
			process.env.COLORTERM === '24bit';

		// Conservative check: assume Unicode support for known good terminals
		return hasUtfEnv || isKnownGoodTerminal || false;
	})();

	// Color support detection
	const hasColorSupport = (() => {
		const hasColorTerm =
			process.env.TERM?.includes('color') || process.env.COLORTERM;
		const hasColorEnv =
			process.env.NO_COLOR !== '1' && process.env.FORCE_COLOR !== '0';
		return hasColorTerm && hasColorEnv;
	})();

	// Advanced UI support (progress bars, spinners, borders)
	const supportsAdvancedUI =
		hasUnicodeSupport && hasColorSupport && !isBasicTerminal;

	// Fallback detection for problematic terminals
	const isProblematicTerminal =
		process.env.TERM === 'linux' ||
		process.env.TERM === 'ansi' ||
		process.env.TERM?.includes('dumb');

	return {
		isBasicTerminal,
		hasUnicodeSupport,
		hasColorSupport,
		supportsAdvancedUI,
		isProblematicTerminal,
		terminalType: process.env.TERM || 'unknown',
		colorTerm: process.env.COLORTERM || 'none',
		lang: process.env.LANG || 'unknown',
	};
}

export function getCompatibilityMode() {
	const capabilities = detectTerminalCapabilities();

	// Force basic mode for known problematic terminals
	if (capabilities.isProblematicTerminal) {
		return 'basic';
	}

	// Use basic mode for truly basic terminals
	if (capabilities.isBasicTerminal) {
		return 'basic';
	}

	// Use enhanced mode only for terminals we know work well
	if (capabilities.supportsAdvancedUI) {
		return 'enhanced';
	}

	// Default to compatible mode for unknown terminals
	return 'compatible';
}

export function getTerminalSafeConfig() {
	const mode = getCompatibilityMode();
	const capabilities = detectTerminalCapabilities();

	return {
		mode,
		capabilities,
		features: {
			progressBars: mode === 'enhanced' && capabilities.hasUnicodeSupport,
			spinners: mode === 'enhanced' && capabilities.hasUnicodeSupport,
			unicodeBorders: mode === 'enhanced' && capabilities.hasUnicodeSupport,
			colors: capabilities.hasColorSupport,
			advancedLayout: mode === 'enhanced',
		},
	};
}

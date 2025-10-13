/**
 * Mode Configuration
 * 
 * Defines the configuration for each workflow mode including
 * permissions, descriptions, and metadata.
 * 
 * @module modes/mode-config
 */

import { WorkflowMode, type ModeConfig } from '../types/modes.js';

/**
 * Commands that are always allowed regardless of mode
 * These are essential commands that should work in any mode
 */
export const ALWAYS_ALLOWED_COMMANDS = [
	'help',
	'exit',
	'mode',
	'restart'
] as const;

/**
 * Mode configurations map
 * Defines the capabilities and metadata for each workflow mode
 */
export const MODE_CONFIGS: Record<WorkflowMode, ModeConfig> = {
	[WorkflowMode.COMMAND]: {
		mode: WorkflowMode.COMMAND,
		allowCommands: true,
		allowCodegen: false,
		description: 'Utility commands only, no AI costs',
		icon: '🔧',
		alwaysAllowedCommands: [...ALWAYS_ALLOWED_COMMANDS]
	},
	
	[WorkflowMode.CODEGEN]: {
		mode: WorkflowMode.CODEGEN,
		allowCommands: false,
		allowCodegen: true,
		description: 'AI code generation only',
		icon: '🤖',
		alwaysAllowedCommands: [...ALWAYS_ALLOWED_COMMANDS]
	},
	
	[WorkflowMode.COSMO]: {
		mode: WorkflowMode.COSMO,
		allowCommands: true,
		allowCodegen: true,
		description: 'Full power mode (Commands + Codegen)',
		icon: '🌟',
		alwaysAllowedCommands: [...ALWAYS_ALLOWED_COMMANDS]
	}
};

/**
 * Default workflow mode
 * Cosmo mode is the default to maintain backward compatibility
 */
export const DEFAULT_MODE: WorkflowMode = WorkflowMode.COSMO;

/**
 * Mode display names for UI
 */
export const MODE_DISPLAY_NAMES: Record<WorkflowMode, string> = {
	[WorkflowMode.COMMAND]: 'Command Mode',
	[WorkflowMode.CODEGEN]: 'Codegen Mode',
	[WorkflowMode.COSMO]: 'Cosmo Mode'
};

/**
 * Mode descriptions for help text
 */
export const MODE_HELP_TEXT: Record<WorkflowMode, string> = {
	[WorkflowMode.COMMAND]: 
		'Command Mode: Use utility commands without AI costs. Perfect for exploring commands and managing settings.',
	
	[WorkflowMode.CODEGEN]: 
		'Codegen Mode: Pure AI code generation experience. Natural language prompts trigger AI responses.',
	
	[WorkflowMode.COSMO]: 
		'Cosmo Mode 🌟: Full power mode combining commands and codegen. For power users who want everything.'
};

/**
 * Error messages for mode violations
 */
export const MODE_ERROR_MESSAGES = {
	COMMAND_NOT_ALLOWED: {
		title: 'Command Not Available',
		message: (command: string, currentMode: WorkflowMode) => 
			`The command "/${command}" is not available in ${MODE_DISPLAY_NAMES[currentMode]}.`,
		suggestion: (command: string) => 
			`Switch to Command Mode or Cosmo Mode to use /${command}: /mode cosmo`
	},
	
	CODEGEN_NOT_ALLOWED: {
		title: 'Code Generation Disabled',
		message: (currentMode: WorkflowMode) => 
			`Code generation is disabled in ${MODE_DISPLAY_NAMES[currentMode]}.`,
		suggestion: () => 
			'Switch to Codegen Mode or Cosmo Mode to use AI features: /mode cosmo'
	},
	
	INVALID_MODE: {
		title: 'Invalid Mode',
		message: (mode: string) => 
			`"${mode}" is not a valid workflow mode.`,
		suggestion: () => 
			'Valid modes are: command, codegen, cosmo. Use /mode to see available modes.'
	}
} as const;

/**
 * Get mode configuration
 * 
 * @param {WorkflowMode} mode - The mode to get configuration for
 * @returns {ModeConfig} Mode configuration
 * @throws {Error} If mode is invalid
 */
export function getModeConfig(mode: WorkflowMode): ModeConfig {
	const config = MODE_CONFIGS[mode];
	if (!config) {
		throw new Error(`Invalid workflow mode: ${mode}`);
	}
	return config;
}

/**
 * Check if a command is always allowed
 * 
 * @param {string} command - The command to check (without /)
 * @returns {boolean} True if command is always allowed
 */
export function isAlwaysAllowedCommand(command: string): boolean {
	return ALWAYS_ALLOWED_COMMANDS.includes(command as any);
}

/**
 * Get formatted mode list for display
 * 
 * @returns {string} Formatted list of available modes
 */
export function getFormattedModeList(): string {
	return Object.values(WorkflowMode)
		.map(mode => {
			const config = MODE_CONFIGS[mode];
			return `  ${config.icon} ${mode.padEnd(10)} - ${config.description}`;
		})
		.join('\n');
}

/**
 * Get mode icon
 * 
 * @param {WorkflowMode} mode - The mode to get icon for
 * @returns {string} Mode icon
 */
export function getModeIcon(mode: WorkflowMode): string {
	return MODE_CONFIGS[mode].icon;
}

/**
 * Get mode display name
 * 
 * @param {WorkflowMode} mode - The mode to get display name for
 * @returns {string} Display name
 */
export function getModeDisplayName(mode: WorkflowMode): string {
	return MODE_DISPLAY_NAMES[mode];
}

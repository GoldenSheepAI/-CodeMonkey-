/**
 * Mode Manager
 * 
 * Core class for managing workflow modes in CodeMonkey.
 * Handles mode transitions, validation, and state management.
 * 
 * @module modes/mode-manager
 */

import {
	WorkflowMode,
	type IModeManager,
	type ModeConfig,
	type ModeState,
	type ModeTransitionResult,
	type ModeValidationResult,
	isValidWorkflowMode
} from '../types/modes.js';

import {
	MODE_CONFIGS,
	DEFAULT_MODE,
	MODE_ERROR_MESSAGES,
	getModeConfig,
	isAlwaysAllowedCommand,
	getModeDisplayName,
	getModeIcon
} from './mode-config.js';

/**
 * ModeManager class
 * Singleton class for managing workflow modes
 * 
 * @implements {IModeManager}
 */
export class ModeManager implements IModeManager {
	private state: ModeState;
	private static instance: ModeManager | null = null;

	/**
	 * Private constructor (singleton pattern)
	 * Initializes with default mode (Cosmo)
	 */
	private constructor() {
		this.state = {
			currentMode: DEFAULT_MODE,
			previousMode: undefined,
			changedAt: new Date(),
			changeCount: 0
		};
	}

	/**
	 * Get singleton instance
	 * 
	 * @returns {ModeManager} The singleton instance
	 */
	public static getInstance(): ModeManager {
		if (!ModeManager.instance) {
			ModeManager.instance = new ModeManager();
		}
		return ModeManager.instance;
	}

	/**
	 * Reset singleton instance (for testing)
	 * @internal
	 */
	public static resetInstance(): void {
		ModeManager.instance = null;
	}

	/**
	 * Get the current workflow mode
	 * 
	 * @returns {WorkflowMode} The current mode
	 */
	public getCurrentMode(): WorkflowMode {
		return this.state.currentMode;
	}

	/**
	 * Set the workflow mode
	 * 
	 * @param {WorkflowMode} mode - The mode to switch to
	 * @returns {ModeTransitionResult} Result of the transition
	 */
	public setMode(mode: WorkflowMode): ModeTransitionResult {
		// Validate mode
		if (!isValidWorkflowMode(mode)) {
			return {
				success: false,
				previousMode: this.state.currentMode,
				error: MODE_ERROR_MESSAGES.INVALID_MODE.message(mode),
				message: MODE_ERROR_MESSAGES.INVALID_MODE.suggestion()
			};
		}

		// Check if already in this mode
		if (this.state.currentMode === mode) {
			return {
				success: true,
				newMode: mode,
				previousMode: this.state.currentMode,
				message: `Already in ${getModeDisplayName(mode)}`
			};
		}

		// Perform transition
		const previousMode = this.state.currentMode;
		this.state = {
			currentMode: mode,
			previousMode: previousMode,
			changedAt: new Date(),
			changeCount: this.state.changeCount + 1
		};

		return {
			success: true,
			newMode: mode,
			previousMode: previousMode,
			message: `Switched to ${getModeDisplayName(mode)} ${getModeIcon(mode)}`
		};
	}

	/**
	 * Check if a command can be executed in the current mode
	 * 
	 * @param {string} command - The command to check (without /)
	 * @returns {ModeValidationResult} Validation result
	 */
	public canExecuteCommand(command: string): ModeValidationResult {
		const config = this.getModeConfig();
		
		// Always allowed commands work in any mode
		if (isAlwaysAllowedCommand(command)) {
			return {
				allowed: true
			};
		}

		// Check if commands are allowed in current mode
		if (!config.allowCommands) {
			return {
				allowed: false,
				reason: MODE_ERROR_MESSAGES.COMMAND_NOT_ALLOWED.message(
					command,
					this.state.currentMode
				),
				suggestion: MODE_ERROR_MESSAGES.COMMAND_NOT_ALLOWED.suggestion(command),
				suggestedMode: WorkflowMode.COSMO
			};
		}

		return {
			allowed: true
		};
	}

	/**
	 * Check if code generation can be executed in the current mode
	 * 
	 * @returns {ModeValidationResult} Validation result
	 */
	public canExecuteCodegen(): ModeValidationResult {
		const config = this.getModeConfig();

		if (!config.allowCodegen) {
			return {
				allowed: false,
				reason: MODE_ERROR_MESSAGES.CODEGEN_NOT_ALLOWED.message(
					this.state.currentMode
				),
				suggestion: MODE_ERROR_MESSAGES.CODEGEN_NOT_ALLOWED.suggestion(),
				suggestedMode: WorkflowMode.COSMO
			};
		}

		return {
			allowed: true
		};
	}

	/**
	 * Get the configuration for the current mode
	 * 
	 * @returns {ModeConfig} Current mode configuration
	 */
	public getModeConfig(): ModeConfig {
		return getModeConfig(this.state.currentMode);
	}

	/**
	 * Get the configuration for a specific mode
	 * 
	 * @param {WorkflowMode} mode - The mode to get config for
	 * @returns {ModeConfig} Mode configuration
	 */
	public getModeConfigFor(mode: WorkflowMode): ModeConfig {
		return getModeConfig(mode);
	}

	/**
	 * Get a human-readable description of the current mode
	 * 
	 * @returns {string} Mode description
	 */
	public getModeDescription(): string {
		const config = this.getModeConfig();
		return `${getModeDisplayName(config.mode)} ${config.icon} - ${config.description}`;
	}

	/**
	 * Get the current mode state
	 * 
	 * @returns {ModeState} Current state
	 */
	public getState(): ModeState {
		return { ...this.state };
	}

	/**
	 * Reset to default mode (Cosmo)
	 * 
	 * @returns {ModeTransitionResult} Result of the reset
	 */
	public reset(): ModeTransitionResult {
		return this.setMode(DEFAULT_MODE);
	}

	/**
	 * Initialize mode from user preferences
	 * 
	 * @param {WorkflowMode} mode - The mode from preferences
	 * @returns {boolean} True if successfully initialized
	 */
	public initializeFromPreferences(mode: WorkflowMode): boolean {
		if (!isValidWorkflowMode(mode)) {
			return false;
		}

		this.state = {
			currentMode: mode,
			previousMode: undefined,
			changedAt: new Date(),
			changeCount: 0
		};

		return true;
	}

	/**
	 * Get formatted status string for display
	 * 
	 * @returns {string} Formatted status
	 */
	public getStatusString(): string {
		const config = this.getModeConfig();
		const features: string[] = [];
		
		if (config.allowCommands) features.push('Commands');
		if (config.allowCodegen) features.push('Codegen');
		
		return `${config.icon} ${getModeDisplayName(config.mode)} (${features.join(' + ')})`;
	}
}

/**
 * Get the global mode manager instance
 * 
 * @returns {ModeManager} The singleton instance
 */
export function getModeManager(): ModeManager {
	return ModeManager.getInstance();
}

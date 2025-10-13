/**
 * Workflow Modes Type Definitions
 * 
 * Defines the three workflow modes for CodeMonkey:
 * - Command: Utility commands only, no AI costs
 * - Codegen: AI code generation only
 * - Cosmo: Full power mode (commands + codegen)
 * 
 * @module types/modes
 */

/**
 * Workflow mode enumeration
 * 
 * @enum {string}
 */
export enum WorkflowMode {
	/** Utility commands only, no AI code generation */
	COMMAND = 'command',
	
	/** AI code generation only, limited commands */
	CODEGEN = 'codegen',
	
	/** Full power mode: commands + codegen (default) */
	COSMO = 'cosmo'
}

/**
 * Mode configuration interface
 * Defines the capabilities and metadata for each mode
 * 
 * @interface ModeConfig
 */
export interface ModeConfig {
	/** The workflow mode */
	mode: WorkflowMode;
	
	/** Whether commands are allowed in this mode */
	allowCommands: boolean;
	
	/** Whether code generation is allowed in this mode */
	allowCodegen: boolean;
	
	/** Human-readable description of the mode */
	description: string;
	
	/** Icon/emoji representing the mode */
	icon: string;
	
	/** List of commands that are always allowed (even if allowCommands is false) */
	alwaysAllowedCommands: string[];
}

/**
 * Mode state interface
 * Tracks the current mode and transition history
 * 
 * @interface ModeState
 */
export interface ModeState {
	/** Current active workflow mode */
	currentMode: WorkflowMode;
	
	/** Previous mode (for undo/history) */
	previousMode?: WorkflowMode;
	
	/** Timestamp when mode was last changed */
	changedAt: Date;
	
	/** Number of times mode has been changed in this session */
	changeCount: number;
}

/**
 * Mode transition result
 * Result of attempting to change modes
 * 
 * @interface ModeTransitionResult
 */
export interface ModeTransitionResult {
	/** Whether the transition was successful */
	success: boolean;
	
	/** The new mode (if successful) */
	newMode?: WorkflowMode;
	
	/** The previous mode */
	previousMode: WorkflowMode;
	
	/** Error message (if failed) */
	error?: string;
	
	/** Additional context or warnings */
	message?: string;
}

/**
 * Mode validation result
 * Result of validating an operation in the current mode
 * 
 * @interface ModeValidationResult
 */
export interface ModeValidationResult {
	/** Whether the operation is allowed */
	allowed: boolean;
	
	/** Reason why operation is not allowed (if applicable) */
	reason?: string;
	
	/** Suggested action to enable the operation */
	suggestion?: string;
	
	/** The mode that would allow this operation */
	suggestedMode?: WorkflowMode;
}

/**
 * Mode manager interface
 * Core interface for managing workflow modes
 * 
 * @interface IModeManager
 */
export interface IModeManager {
	/**
	 * Get the current workflow mode
	 * @returns {WorkflowMode} The current mode
	 */
	getCurrentMode(): WorkflowMode;
	
	/**
	 * Set the workflow mode
	 * @param {WorkflowMode} mode - The mode to switch to
	 * @returns {ModeTransitionResult} Result of the transition
	 */
	setMode(mode: WorkflowMode): ModeTransitionResult;
	
	/**
	 * Check if a command can be executed in the current mode
	 * @param {string} command - The command to check (without /)
	 * @returns {ModeValidationResult} Validation result
	 */
	canExecuteCommand(command: string): ModeValidationResult;
	
	/**
	 * Check if code generation can be executed in the current mode
	 * @returns {ModeValidationResult} Validation result
	 */
	canExecuteCodegen(): ModeValidationResult;
	
	/**
	 * Get the configuration for the current mode
	 * @returns {ModeConfig} Current mode configuration
	 */
	getModeConfig(): ModeConfig;
	
	/**
	 * Get the configuration for a specific mode
	 * @param {WorkflowMode} mode - The mode to get config for
	 * @returns {ModeConfig} Mode configuration
	 */
	getModeConfigFor(mode: WorkflowMode): ModeConfig;
	
	/**
	 * Get a human-readable description of the current mode
	 * @returns {string} Mode description
	 */
	getModeDescription(): string;
	
	/**
	 * Get the current mode state
	 * @returns {ModeState} Current state
	 */
	getState(): ModeState;
	
	/**
	 * Reset to default mode (Cosmo)
	 * @returns {ModeTransitionResult} Result of the reset
	 */
	reset(): ModeTransitionResult;
}

/**
 * Mode preference for persistence
 * 
 * @interface ModePreference
 */
export interface ModePreference {
	/** The preferred workflow mode */
	workflowMode: WorkflowMode;
	
	/** Timestamp when preference was last updated */
	updatedAt: string;
}

/**
 * Type guard to check if a string is a valid WorkflowMode
 * 
 * @param {string} value - The value to check
 * @returns {value is WorkflowMode} True if valid mode
 */
export function isValidWorkflowMode(value: string): value is WorkflowMode {
	return Object.values(WorkflowMode).includes(value as WorkflowMode);
}

/**
 * Type for mode-specific error messages
 */
export type ModeErrorType = 
	| 'command_not_allowed'
	| 'codegen_not_allowed'
	| 'invalid_mode'
	| 'transition_failed';

/**
 * Mode error interface
 * 
 * @interface ModeError
 */
export interface ModeError extends Error {
	/** Type of mode error */
	type: ModeErrorType;
	
	/** Current mode when error occurred */
	currentMode: WorkflowMode;
	
	/** Suggested mode to fix the error */
	suggestedMode?: WorkflowMode;
	
	/** User-friendly error message */
	userMessage: string;
}

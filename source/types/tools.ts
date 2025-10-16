export type EditMode =
	| 'insert'
	| 'replace'
	| 'delete'
	| 'move'
	| 'find_replace';

export type EditArgs = {
	path: string;
	mode: EditMode;
	line_number?: number;
	end_line?: number;
	content?: string;
	target_line?: number;
	old_text?: string;
	new_text?: string;
	replace_all?: boolean;
};

export type EditResult = {
	success: boolean;
	message: string;
	context?: string;
};

export type LineChange = {
	lineNum: number;
	lineContent: string;
	startPos: number;
};

export type ValidationResult = {
	isValid: boolean;
	error?: string;
};

export type BashToolResult = {
	fullOutput: string;
	llmContext: string;
};

export type MCPServer = {
	name: string;
	command: string;
	args?: string[];
	env?: Record<string, string>;
};

export type MCPTool = {
	name: string;
	description?: string;
	inputSchema?: any;
	serverName: string;
};

export type MCPInitResult = {
	serverName: string;
	success: boolean;
	toolCount?: number;
	error?: string;
};

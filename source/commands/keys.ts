import React from 'react';
import {Command} from '@/types/index.js';
import Setup from './setup.js';

export const setupCommand: Command = {
	name: 'setup',
	description: 'Interactive setup for API keys and configuration',
	handler: async (_args: string[], _messages, _metadata) => {
		return React.createElement(Setup);
	},
};

export const keysCommand: Command = {
	name: 'keys',
	description: 'Manage stored API keys',
	handler: async (_args: string[], _messages, _metadata) => {
		return React.createElement(Setup);
	},
};

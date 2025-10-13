import React from 'react';
import {Command} from '@/types/index.js';
import SecureModeToggle from '@/components/secure-mode-toggle.js';

export const secureCommand: Command = {
	name: 'secure',
	description: 'Toggle Secure Mode with NoLeakAI protection',
	handler: async (_args: string[], _messages, _metadata) => {
		return React.createElement(SecureModeToggle);
	},
};

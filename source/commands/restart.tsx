import React from 'react';
import {Command} from '@/types/index.js';
import InfoMessage from '@/components/info-message.js';

export const restartCommand: Command = {
	name: 'restart',
	description: 'Restart CodeMonkey (reloads config and preferences)',
	handler: async (_args: string[], _messages, _metadata) => {
		// Show restart message
		const message = React.createElement(InfoMessage, {
			key: 'restart-message',
			message: '🔄 Restarting CodeMonkey...',
			hideBox: true,
		});

		// Exit and restart
		setTimeout(() => {
			process.exit(0);
		}, 500);

		return message;
	},
};

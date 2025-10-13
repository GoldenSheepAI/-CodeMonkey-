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
			message: '🔄 Restarting CodeMonkey... (auto-relaunching)',
			hideBox: true,
		});

		// Spawn a new detached instance of the CLI, then exit this one
		setTimeout(() => {
			try {
				const {spawn} = require('child_process');
				// process.execPath is the Node binary. argv[1] should be the CLI entry (dist/cli.js)
				const nodeBin = process.execPath;
				const cliEntry = process.argv[1];
				if (cliEntry) {
					const child = spawn(nodeBin, [cliEntry], {
						detached: true,
						stdio: 'ignore',
						env: process.env,
					});
					child.unref();
				}
			} catch {
				// Swallow spawn errors; worst case user can relaunch manually
			}

			// Clear any pending timers/intervals and exit
			if (global.gc) {
				try { global.gc(); } catch {}
			}
			process.exit(0);
		}, 500);

		return message;
	},
};

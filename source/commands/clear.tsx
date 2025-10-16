import React from 'react';
import {type Command} from '@/types/index.js';
import SuccessMessage from '@/components/success-message.js';

function Clear() {
	return <SuccessMessage hideBox message="✔️ Chat Cleared..." />;
}

export const clearCommand: Command = {
	name: 'clear',
	description: 'Clear the chat history and model context',
	async handler(_args: string[]) {
		// Return info message saying chat was cleared
		return React.createElement(Clear, {
			key: `clear-${Date.now()}`,
		});
	},
};

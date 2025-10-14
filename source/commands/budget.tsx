import React from 'react';
import {Command} from '@/types/index.js';
import InfoMessage from '@/components/info-message.js';

export const budgetCommand: Command = {
	name: 'budget',
	description: 'Budget Mode (Coming Soon)',
	handler: async (_args: string[], _messages, _metadata) => {
		return React.createElement(InfoMessage, {
			message: '💰 Budget Mode with cost tracking is coming soon! This feature will help you monitor AI usage costs and set spending limits.',
			hideBox: false,
		});
	},
};

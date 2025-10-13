import React from 'react';
import {Command} from '@/types/index.js';
import BudgetModeToggle from '@/components/budget-mode-toggle.js';

export const budgetCommand: Command = {
	name: 'budget',
	description: 'Toggle Budget Mode with ToknXR cost tracking',
	handler: async (_args: string[], _messages, _metadata) => {
		return React.createElement(BudgetModeToggle);
	},
};

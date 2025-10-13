import React from 'react';
import {Command} from '@/types/index.js';
import ProviderSwitcher from '@/components/provider-switcher.js';

export const providerCommand: Command = {
	name: 'provider',
	description: 'Switch between AI providers (only one active at a time)',
	handler: async (_args: string[], _messages, _metadata) => {
		return React.createElement(ProviderSwitcher);
	},
};

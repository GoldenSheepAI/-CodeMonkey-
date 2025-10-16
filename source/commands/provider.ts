import React from 'react';
import {type Command} from '@/types/index.js';
import ProviderSwitcher from '@/components/provider-switcher.js';

export const providerCommand: Command = {
	name: 'provider',
	description: 'Switch between AI providers (only one active at a time)',
	async handler(_args: string[], _messages, _metadata) {
		return React.createElement(ProviderSwitcher);
	},
};

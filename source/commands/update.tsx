import React from 'react';
import {type Command} from '@/types/index.js';
import UpdateMessage from '@/components/update-message.js';

export const updateCommand: Command = {
	name: 'update',
	description: 'Update CodeMonkey to the latest version',
	async handler(_args: string[]) {
		return React.createElement(UpdateMessage);
	},
};

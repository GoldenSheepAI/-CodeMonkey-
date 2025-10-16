export type MessageType = 'info' | 'error' | 'success';

export type MessageQueueItem = {
	type: MessageType;
	message: string;
	key?: string;
	hideBox?: boolean;
};

export type NpmRegistryResponse = {
	version: string;
	name: string;
	[key: string]: any;
};

export type UpdateInfo = {
	hasUpdate: boolean;
	currentVersion: string;
	latestVersion?: string;
	updateCommand?: string;
};

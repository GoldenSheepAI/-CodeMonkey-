import React, {useEffect, useState} from 'react';
import InfoMessage from './info-message.js';
import SuccessMessage from './success-message.js';
import ErrorMessage from './error-message.js';
import {toolRegistry} from '@/tools/index.js';
import {checkForUpdates} from '@/utils/update-checker.js';

enum Status {
	Checking = 'checking',
	Updating = 'updating',
	NoUpdate = 'no-update',
	Success = 'success',
	Error = 'error',
}

export default function UpdateMessage() {
	const [status, setStatus] = useState<Status>(Status.Checking);
	const [error, setError] = useState<Error | undefined>(undefined);

	useEffect(() => {
		let isMounted = true;

		const check = async () => {
			try {
				const updateInfo = await checkForUpdates();
				if (isMounted) {
					if (updateInfo.hasUpdate) {
						setStatus(Status.Updating);
						update();
					} else {
						setStatus(Status.NoUpdate);
					}
				}
			} catch (error_) {
				if (isMounted) {
					setStatus(Status.Error);
					setError(error_ as Error);
				}
			}
		};

		const update = async () => {
			try {
				await toolRegistry.execute_bash({
					command: 'npm update -g @goldensheepai/codemonkey',
				});
				if (isMounted) {
					setStatus(Status.Success);
				}
			} catch (error_) {
				if (isMounted) {
					setStatus(Status.Error);
					setError(error_ as Error);
				}
			}
		};

		check();

		return () => {
			isMounted = false;
		};
	}, []);

	if (status === Status.Checking) {
		return React.createElement(InfoMessage, {
			message: 'Checking for available updates...',
			hideBox: true,
		});
	}

	if (status === Status.Updating) {
		return React.createElement(InfoMessage, {
			message: 'Downloading and installing the latest CodeMonkey update...',
			hideBox: true,
		});
	}

	if (status === Status.NoUpdate) {
		return React.createElement(SuccessMessage, {
			message: 'CodeMonkey is already up to date.',
			hideBox: true,
		});
	}

	if (status === Status.Success) {
		return React.createElement(SuccessMessage, {
			message:
				'CodeMonkey has been updated to the latest version. Please restart your session to apply the update.',
			hideBox: true,
		});
	}

	if (status === Status.Error) {
		return React.createElement(ErrorMessage, {
			message: `Failed to update CodeMonkey: ${error?.message}`,
			hideBox: true,
		});
	}

	return null;
}

import React, {useEffect, useState} from 'react';
import {toolRegistry} from '@/tools/index.js';
import InfoMessage from './info-message.js';
import SuccessMessage from './success-message.js';
import ErrorMessage from './error-message.js';
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
	const [error, setError] = useState<Error | null>(null);

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
			} catch (e) {
				if (isMounted) {
					setStatus(Status.Error);
					setError(e as Error);
				}
			}
		};

		const update = async () => {
			try {
				// Get the current package name from package.json
				const {readFileSync} = await import('fs');
				const {join, dirname} = await import('path');
				const {fileURLToPath} = await import('url');
				const __dirname = dirname(fileURLToPath(import.meta.url));
				const packageJsonPath = join(__dirname, '../../package.json');
				const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
				const packageName = packageJson.name || '@goldensheepai/codemonkey';

				await toolRegistry.execute_bash({
					command: `npm update -g ${packageName}`,
				});
				if (isMounted) {
					setStatus(Status.Success);
				}
			} catch (e) {
				if (isMounted) {
					setStatus(Status.Error);
					setError(e as Error);
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

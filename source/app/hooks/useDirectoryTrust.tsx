import path from 'node:path';
import {useState, useEffect, useCallback} from 'react';
import {loadPreferences, savePreferences} from '@/config/preferences.js';
import {logError} from '@/utils/message-queue.js';
import {shouldLog} from '@/config/logging.js';

export type UseDirectoryTrustReturn = {
	isTrusted: boolean;
	handleConfirmTrust: () => void;
	isTrustLoading: boolean;
	isTrustedError: string | undefined;
};

/**
 * Custom hook for managing directory trust functionality.
 * Handles checking if a directory is trusted and adding it to trusted directories.
 *
 * @param directory - The directory path to check trust for (defaults to current working directory)
 * @returns Object containing trust state and handler functions
 */
export function useDirectoryTrust(
	directory: string = process.cwd(),
): UseDirectoryTrustReturn {
	const [isTrusted, setIsTrusted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | undefined>(undefined);

	// Check if directory is trusted on mount and when directory changes
	useEffect(() => {
		const checkTrustStatus = async () => {
			try {
				setIsLoading(true);
				setError(undefined);

				const preferences = loadPreferences();
				const trustedDirectories = preferences.trustedDirectories || [];

				// Normalize paths for comparison (resolve any relative path components)
				const normalizedDirectory = path.resolve(directory);
				const isTrustedDir = trustedDirectories.some(
					trustedDir => path.resolve(trustedDir) === normalizedDirectory,
				);

				setIsTrusted(isTrustedDir);
			} catch (error_) {
				const errorMessage =
					error_ instanceof Error ? error_.message : 'Unknown error occurred';
				setError(`Failed to check directory trust status: ${errorMessage}`);

				if (shouldLog('warn')) {
					logError(`useDirectoryTrust: ${errorMessage}`);
				}
			} finally {
				setIsLoading(false);
			}
		};

		checkTrustStatus();
	}, [directory]);

	// Handler to confirm trust for the current directory
	const handleConfirmTrust = useCallback(() => {
		try {
			setError(undefined);

			const preferences = loadPreferences();
			const trustedDirectories = preferences.trustedDirectories || [];

			// Normalize the directory path before storing and checking
			const normalizedDirectory = path.resolve(directory);

			// Only add if not already trusted (check using normalized paths)
			if (
				!trustedDirectories.some(
					trustedDir => path.resolve(trustedDir) === normalizedDirectory,
				)
			) {
				trustedDirectories.push(normalizedDirectory);
				preferences.trustedDirectories = trustedDirectories;
				savePreferences(preferences);

				if (shouldLog('info')) {
					logError(
						`useDirectoryTrust (info): Directory added to trusted list: ${normalizedDirectory}`,
					);
				}
			}

			setIsTrusted(true);
		} catch (error_) {
			const errorMessage =
				error_ instanceof Error ? error_.message : 'Unknown error occurred';
			setError(`Failed to save directory trust: ${errorMessage}`);

			if (shouldLog('warn')) {
				logError(`useDirectoryTrust: ${errorMessage}`);
			}
		}
	}, [directory]);

	return {
		isTrusted,
		handleConfirmTrust,
		isTrustLoading: isLoading,
		isTrustedError: error,
	};
}

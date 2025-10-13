/**
 * ToknXR Process Manager
 * Automatically starts/stops ToknXR proxy when Budget Mode is enabled
 */

import {spawn, ChildProcess} from 'child_process';
import {join} from 'path';
import {logInfo, logError} from '@/utils/message-queue.js';

class ToknXRManager {
	private process: ChildProcess | null = null;
	private isRunning = false;
	private port = 8788;
	private startupTimeout = 10000; // 10 seconds

	/**
	 * Start ToknXR proxy server
	 */
	async start(): Promise<boolean> {
		if (this.isRunning) {
			logInfo('ToknXR is already running');
			return true;
		}

		try {
			logInfo('Starting ToknXR proxy server...');

			// Path to ToknXR CLI
			const toknxrPath = join(
				process.cwd(),
				'node_modules',
				'.bin',
				'toknxr',
			);

			// Spawn ToknXR process
			this.process = spawn(toknxrPath, ['start'], {
				stdio: ['ignore', 'pipe', 'pipe'],
				detached: false,
				env: {
					...process.env,
					PORT: this.port.toString(),
				},
			});

			// Handle stdout
			this.process.stdout?.on('data', data => {
				const output = data.toString();
				if (output.includes('Server running') || output.includes('listening')) {
					this.isRunning = true;
					logInfo(`ToknXR proxy started on port ${this.port}`);
				}
			});

			// Handle stderr
			this.process.stderr?.on('data', data => {
				const error = data.toString();
				// Only log actual errors, not warnings
				if (error.toLowerCase().includes('error')) {
					logError(`ToknXR error: ${error}`);
				}
			});

			// Handle process exit
			this.process.on('exit', (code, signal) => {
				this.isRunning = false;
				this.process = null;
				if (code !== 0 && code !== null) {
					logError(`ToknXR exited with code ${code}`);
				}
			});

			// Wait for startup
			await this.waitForStartup();

			return this.isRunning;
		} catch (error) {
			logError(`Failed to start ToknXR: ${(error as Error).message}`);
			return false;
		}
	}

	/**
	 * Stop ToknXR proxy server
	 */
	stop(): void {
		if (!this.process) {
			return;
		}

		try {
			logInfo('Stopping ToknXR proxy server...');
			this.process.kill('SIGTERM');
			this.isRunning = false;
			this.process = null;
		} catch (error) {
			logError(`Failed to stop ToknXR: ${(error as Error).message}`);
		}
	}

	/**
	 * Check if ToknXR is running
	 */
	getStatus(): boolean {
		return this.isRunning;
	}

	/**
	 * Get proxy URL
	 */
	getProxyUrl(): string {
		return `http://localhost:${this.port}`;
	}

	/**
	 * Wait for ToknXR to start up
	 */
	private async waitForStartup(): Promise<void> {
		const startTime = Date.now();

		while (!this.isRunning && Date.now() - startTime < this.startupTimeout) {
			await new Promise(resolve => setTimeout(resolve, 500));
		}

		if (!this.isRunning) {
			throw new Error('ToknXR failed to start within timeout period');
		}
	}

	/**
	 * Fetch usage stats from ToknXR API
	 */
	async getStats(): Promise<{
		totalCost: number;
		totalTokens: number;
		requestCount: number;
	} | null> {
		if (!this.isRunning) {
			return null;
		}

		try {
			// ToknXR would expose stats via API endpoint
			// For now, return mock data until we integrate with actual ToknXR API
			return {
				totalCost: 0,
				totalTokens: 0,
				requestCount: 0,
			};
		} catch (error) {
			return null;
		}
	}
}

// Singleton instance
export const toknxrManager = new ToknXRManager();

// Clean shutdown on process exit
process.on('exit', () => {
	toknxrManager.stop();
});

process.on('SIGINT', () => {
	toknxrManager.stop();
	process.exit(0);
});

process.on('SIGTERM', () => {
	toknxrManager.stop();
	process.exit(0);
});

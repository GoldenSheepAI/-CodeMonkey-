/**
 * Usage Database - Persistent storage for token usage records
 *
 * Handles storing, retrieving, and managing token usage data
 * with efficient querying and aggregation capabilities.
 */

import {promises as fs} from 'node:fs';
import path from 'node:path';
import type {TokenUsage, ToknxrConfig} from './types.js';

type DatabaseRecord = {
	id: string;
} & TokenUsage;

export class UsageDatabase {
	private readonly config: ToknxrConfig;
	private readonly dbPath: string;
	private readonly cache = new Map<string, DatabaseRecord>();

	constructor(config: ToknxrConfig) {
		this.config = config;
		this.dbPath =
			config.databasePath || path.join(process.cwd(), 'usage.db.json');
	}

	/**
	 * Initialize the database
	 */
	async initialize(): Promise<void> {
		try {
			await fs.access(this.dbPath);
			await this.loadCache();
		} catch {
			// Database doesn't exist, will be created on first write
			await this.saveCache();
		}
	}

	/**
	 * Store a token usage record
	 */
	async storeUsage(usage: TokenUsage): Promise<string> {
		const id = this.generateId();
		const record: DatabaseRecord = {
			...usage,
			id,
		};

		this.cache.set(id, record);
		await this.saveCache();

		return id;
	}

	/**
	 * Retrieve usage records for a time range
	 */
	async getUsageInRange(startDate: Date, endDate: Date): Promise<TokenUsage[]> {
		const records = [...this.cache.values()]
			.filter(
				record => record.timestamp >= startDate && record.timestamp <= endDate,
			)
			.map(({id, ...usage}) => usage); // Remove internal id

		return records;
	}

	/**
	 * Get usage statistics for a model
	 */
	async getModelUsage(model: string, days = 30): Promise<TokenUsage[]> {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		return this.getUsageInRange(startDate, new Date()).then(usages =>
			usages.filter(usage => usage.model === model),
		);
	}

	/**
	 * Get total usage statistics
	 */
	async getTotalStats(days = 30): Promise<{
		totalTokens: number;
		totalRecords: number;
		modelsUsed: string[];
		averageTokensPerRequest: number;
	}> {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const usages = await this.getUsageInRange(startDate, new Date());
		const totalTokens = usages.reduce(
			(sum, usage) => sum + usage.totalTokens,
			0,
		);
		const modelsUsed = [...new Set(usages.map(usage => usage.model))];

		return {
			totalTokens,
			totalRecords: usages.length,
			modelsUsed,
			averageTokensPerRequest:
				usages.length > 0 ? totalTokens / usages.length : 0,
		};
	}

	/**
	 * Clear old records (older than specified days)
	 */
	async clearOldRecords(daysToKeep = 90): Promise<number> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

		let removedCount = 0;
		for (const [id, record] of this.cache.entries()) {
			if (record.timestamp < cutoffDate) {
				this.cache.delete(id);
				removedCount++;
			}
		}

		if (removedCount > 0) {
			await this.saveCache();
		}

		return removedCount;
	}

	/**
	 * Generate a unique ID for records
	 */
	private generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
	}

	/**
	 * Load cache from disk
	 */
	private async loadCache(): Promise<void> {
		const data = await fs.readFile(this.dbPath, 'utf8');
		const records: DatabaseRecord[] = JSON.parse(data);

		this.cache.clear();
		for (const record of records) {
			// Convert timestamp strings back to Date objects
			record.timestamp = new Date(record.timestamp);
			this.cache.set(record.id, record);
		}
	}

	/**
	 * Save cache to disk
	 */
	private async saveCache(): Promise<void> {
		const records = [...this.cache.values()];
		const data = JSON.stringify(records, null, 2);
		await fs.writeFile(this.dbPath, data, 'utf-8');
	}
}

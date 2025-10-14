/**
 * Secure API Key Storage System
 * Encrypts and stores API keys locally without requiring user accounts
 */

import {homedir} from 'os';
import {join} from 'path';
import {readFileSync, writeFileSync, existsSync} from 'fs';
import {createCipheriv, createDecipheriv, randomBytes, scryptSync} from 'crypto';

interface StoredApiKey {
	provider: string;
	key: string;
	created: number;
	lastUsed?: number;
}

interface EncryptedStorage {
	salt: string;
	data: string; // encrypted JSON
}

const STORAGE_PATH = join(homedir(), '.codemonkey-keys.enc');
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

/**
 * Derive encryption key from master password
 */
function deriveKey(masterPassword: string, salt: Buffer): Buffer {
	return scryptSync(masterPassword, salt, KEY_LENGTH);
}

/**
 * Generate a master password for first-time setup
 */
function generateMasterPassword(): string {
	return randomBytes(32).toString('hex');
}

/**
 * Encrypt data using AES-256-GCM
 */
function encrypt(text: string, masterPassword: string): EncryptedStorage {
	const salt = randomBytes(SALT_LENGTH);
	const key = deriveKey(masterPassword, salt);
	const iv = randomBytes(16);

	const cipher = createCipheriv(ALGORITHM, key, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	const authTag = cipher.getAuthTag();

	return {
		salt: salt.toString('hex'),
		data: iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex')
	};
}

/**
 * Decrypt data using AES-256-GCM
 */
function decrypt(encryptedStorage: EncryptedStorage, masterPassword: string): string {
	const key = deriveKey(masterPassword, Buffer.from(encryptedStorage.salt, 'hex'));
	const [ivHex, encryptedHex, authTagHex] = encryptedStorage.data.split(':');

	const iv = Buffer.from(ivHex, 'hex');
	const authTag = Buffer.from(authTagHex, 'hex');

	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}

/**
 * Secure API Key Storage Class
 */
export class SecureKeyStorage {
	private masterPassword: string;
	private keys: Map<string, StoredApiKey> = new Map();

	constructor() {
		// For now, use a simple master password
		// In production, this could be derived from machine ID or user input
		this.masterPassword = this.getOrCreateMasterPassword();
		this.loadKeys();
	}

	/**
	 * Get or create master password for encryption
	 */
	private getOrCreateMasterPassword(): string {
		// Simple approach: use a fixed master password for now
		// In production, this could be more sophisticated
		return 'codemonkey-default-master-key-2024';
	}

	/**
	 * Load encrypted keys from storage
	 */
	private loadKeys(): void {
		if (!existsSync(STORAGE_PATH)) {
			return;
		}

		try {
			const encryptedData = JSON.parse(readFileSync(STORAGE_PATH, 'utf-8'));
			const decryptedData = decrypt(encryptedData, this.masterPassword);
			const keysArray: StoredApiKey[] = JSON.parse(decryptedData);

			this.keys.clear();
			for (const keyData of keysArray) {
				this.keys.set(keyData.provider, keyData);
			}
		} catch (error) {
			// If decryption fails, start with empty keys
			console.warn('Failed to load encrypted keys, starting fresh');
			this.keys.clear();
		}
	}

	/**
	 * Save keys to encrypted storage
	 */
	private saveKeys(): void {
		try {
			const keysArray = Array.from(this.keys.values());
			const keysJson = JSON.stringify(keysArray, null, 2);
			const encryptedData = encrypt(keysJson, this.masterPassword);

			writeFileSync(STORAGE_PATH, JSON.stringify(encryptedData, null, 2));
		} catch (error) {
			console.error('Failed to save encrypted keys:', error);
		}
	}

	/**
	 * Store an API key for a provider
	 */
	storeKey(provider: string, key: string): void {
		const now = Date.now();
		const keyData: StoredApiKey = {
			provider,
			key,
			created: now,
			lastUsed: now
		};

		this.keys.set(provider, keyData);
		this.saveKeys();
	}

	/**
	 * Retrieve an API key for a provider
	 */
	getKey(provider: string): string | null {
		const keyData = this.keys.get(provider);
		if (keyData) {
			// Update last used timestamp
			keyData.lastUsed = Date.now();
			this.saveKeys();
			return keyData.key;
		}
		return null;
	}

	/**
	 * Remove an API key for a provider
	 */
	removeKey(provider: string): boolean {
		const deleted = this.keys.delete(provider);
		if (deleted) {
			this.saveKeys();
		}
		return deleted;
	}

	/**
	 * List all stored providers (without revealing keys)
	 */
	listProviders(): string[] {
		return Array.from(this.keys.keys());
	}

	/**
	 * Check if a provider has a stored key
	 */
	hasKey(provider: string): boolean {
		return this.keys.has(provider);
	}

	/**
	 * Get key info for a provider (without revealing the actual key)
	 */
	getKeyInfo(provider: string): { exists: boolean; created?: number; lastUsed?: number } | null {
		const keyData = this.keys.get(provider);
		if (keyData) {
			return {
				exists: true,
				created: keyData.created,
				lastUsed: keyData.lastUsed
			};
		}
		return null;
	}

	/**
	 * Clear all stored keys
	 */
	clearAllKeys(): void {
		this.keys.clear();
		this.saveKeys();
	}
}

// Singleton instance
export const secureKeyStorage = new SecureKeyStorage();

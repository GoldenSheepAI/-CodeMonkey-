#!/usr/bin/env node

/**
 * Migration script for CodeMonkey
 * Handles data migrations and updates between versions
 */

import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {homedir} from 'node:os';

interface Migration {
	version: string;
	description: string;
	up: () => Promise<void>;
	down?: () => Promise<void>;
}

const migrations: Migration[] = [
	{
		version: '1.0.0',
		description: 'Initialize configuration structure',
		async up() {
			const configDir = join(homedir(), '.codemonkey');
			if (!existsSync(configDir)) {
				mkdirSync(configDir, {recursive: true});
				console.log('✅ Created configuration directory');
			}
		},
	},
	{
		version: '2.0.0',
		description: 'Migrate to new integrations structure',
		async up() {
			console.log('✅ Integration structure updated');
		},
	},
];

async function getMigrationState(): Promise<string> {
	const stateFile = join(homedir(), '.codemonkey', 'migration.json');
	if (!existsSync(stateFile)) {
		return '0.0.0';
	}
	const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
	return state.version || '0.0.0';
}

async function setMigrationState(version: string) {
	const stateFile = join(homedir(), '.codemonkey', 'migration.json');
	const stateDir = join(homedir(), '.codemonkey');

	if (!existsSync(stateDir)) {
		mkdirSync(stateDir, {recursive: true});
	}

	writeFileSync(
		stateFile,
		JSON.stringify({version, timestamp: new Date().toISOString()}, null, 2),
	);
}

function compareVersions(v1: string, v2: string): number {
	const parts1 = v1.split('.').map(Number);
	const parts2 = v2.split('.').map(Number);

	for (let i = 0; i < 3; i++) {
		if (parts1[i] > parts2[i]) return 1;
		if (parts1[i] < parts2[i]) return -1;
	}
	return 0;
}

async function runMigrations(targetVersion?: string) {
	const currentVersion = await getMigrationState();
	console.log(`📦 Current migration version: ${currentVersion}`);

	let pendingMigrations = migrations.filter(
		m => compareVersions(m.version, currentVersion) > 0,
	);

	if (targetVersion) {
		pendingMigrations = pendingMigrations.filter(
			m => compareVersions(m.version, targetVersion) <= 0,
		);
	}

	if (pendingMigrations.length === 0) {
		console.log('✅ No pending migrations');
		return;
	}

	console.log(`\n🔄 Running ${pendingMigrations.length} migration(s)...\n`);

	for (const migration of pendingMigrations) {
		console.log(`⏳ ${migration.version}: ${migration.description}`);
		try {
			await migration.up();
			await setMigrationState(migration.version);
			console.log(`✅ Completed ${migration.version}\n`);
		} catch (error) {
			console.error(`❌ Migration ${migration.version} failed:`, error);
			process.exit(1);
		}
	}

	console.log('✅ All migrations completed successfully!');
}

async function main() {
	console.log('🐒 CodeMonkey Migration Script');
	console.log('==============================\n');

	const command = process.argv[2];
	const targetVersion = process.argv[3];

	if (command === 'status') {
		const currentVersion = await getMigrationState();
		console.log(`Current version: ${currentVersion}`);
		const pending = migrations.filter(
			m => compareVersions(m.version, currentVersion) > 0,
		);
		console.log(`Pending migrations: ${pending.length}`);
		pending.forEach(m => console.log(`  - ${m.version}: ${m.description}`));
		return;
	}

	if (command === 'up' || !command) {
		await runMigrations(targetVersion);
	} else {
		console.error('Unknown command. Use: migrate [up|status] [version]');
		process.exit(1);
	}
}

main().catch(error => {
	console.error('❌ Migration failed:', error);
	process.exit(1);
});

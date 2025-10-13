#!/usr/bin/env node

/**
 * Release automation script
 * Handles version bumping, changelog generation, and publishing
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // major, minor, patch

function exec(command: string): string {
	return execSync(command, { encoding: 'utf-8' }).trim();
}

function getCurrentVersion(): string {
	const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
	return pkg.version;
}

function updateVersion(type: string): string {
	exec(`pnpm version ${type} --no-git-tag-version`);
	return getCurrentVersion();
}

function updateChangelog(newVersion: string) {
	const date = new Date().toISOString().split('T')[0];
	const changelogPath = 'CHANGELOG.md';
	
	try {
		const changelog = readFileSync(changelogPath, 'utf-8');
		const newEntry = `\n## [${newVersion}] - ${date}\n\n### Added\n\n### Changed\n\n### Fixed\n\n`;
		const updated = changelog.replace('# Changelog\n', `# Changelog\n${newEntry}`);
		writeFileSync(changelogPath, updated);
	} catch (error) {
		console.log('⚠️  No CHANGELOG.md found, skipping...');
	}
}

async function main() {
	console.log('🐒 CodeMonkey Release Script');
	console.log('============================\n');

	// Check git status
	const status = exec('git status --porcelain');
	if (status) {
		console.error('❌ Working directory not clean. Commit or stash changes first.');
		process.exit(1);
	}

	// Run tests
	console.log('🧪 Running tests...');
	exec('pnpm test');

	// Build
	console.log('🔨 Building...');
	exec('pnpm run build');

	// Update version
	const oldVersion = getCurrentVersion();
	console.log(`📦 Current version: ${oldVersion}`);
	const newVersion = updateVersion(versionType);
	console.log(`📦 New version: ${newVersion}`);

	// Update changelog
	console.log('📝 Updating changelog...');
	updateChangelog(newVersion);

	// Commit changes
	console.log('💾 Committing changes...');
	exec('git add .');
	exec(`git commit -m "chore: release v${newVersion}"`);
	exec(`git tag -a v${newVersion} -m "Release v${newVersion}"`);

	console.log('\n✅ Release prepared!');
	console.log('\nNext steps:');
	console.log('  git push origin main');
	console.log(`  git push origin v${newVersion}`);
	console.log('  pnpm publish');
}

main().catch((error) => {
	console.error('❌ Release failed:', error);
	process.exit(1);
});

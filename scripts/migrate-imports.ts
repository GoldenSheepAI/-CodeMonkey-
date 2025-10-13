#!/usr/bin/env node
/**
 * Import Migration Script
 * Converts relative imports to path alias imports (@/...)
 */

import {readFileSync, writeFileSync, readdirSync, statSync} from 'fs';
import {join, relative, dirname} from 'path';

interface ImportReplacement {
	file: string;
	oldImport: string;
	newImport: string;
}

const sourceDir = join(process.cwd(), 'source');
const replacements: ImportReplacement[] = [];

/**
 * Convert relative import to alias import
 */
function convertToAlias(filePath: string, importPath: string): string | null {
	// Skip if already using alias
	if (importPath.startsWith('@/')) {
		return null;
	}

	// Skip if not a relative import
	if (!importPath.startsWith('.')) {
		return null;
	}

	// Calculate absolute path
	const fileDir = dirname(filePath);
	const absoluteImportPath = join(fileDir, importPath);
	const relativeToSource = relative(sourceDir, absoluteImportPath);

	// Convert to alias
	return `@/${relativeToSource}`;
}

/**
 * Process a single file
 */
function processFile(filePath: string): number {
	const content = readFileSync(filePath, 'utf-8');
	let modified = content;
	let changeCount = 0;

	// Match import/export statements with relative paths
	const importRegex = /from\s+['"](\.\.[^'"]+)['"]/g;
	const matches = [...content.matchAll(importRegex)];

	for (const match of matches) {
		const oldImport = match[1];
		const newImport = convertToAlias(filePath, oldImport);

		if (newImport) {
			const oldStatement = match[0];
			const newStatement = oldStatement.replace(oldImport, newImport);
			modified = modified.replace(oldStatement, newStatement);
			changeCount++;

			replacements.push({
				file: relative(process.cwd(), filePath),
				oldImport,
				newImport,
			});
		}
	}

	if (changeCount > 0) {
		writeFileSync(filePath, modified, 'utf-8');
	}

	return changeCount;
}

/**
 * Recursively process directory
 */
function processDirectory(dir: string): void {
	const entries = readdirSync(dir);

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			// Skip node_modules, dist, etc.
			if (!['node_modules', 'dist', '.git'].includes(entry)) {
				processDirectory(fullPath);
			}
		} else if (stat.isFile() && /\.(ts|tsx)$/.test(entry)) {
			const changes = processFile(fullPath);
			if (changes > 0) {
				console.log(
					`✓ ${relative(process.cwd(), fullPath)} (${changes} imports)`,
				);
			}
		}
	}
}

// Main execution
console.log('🔄 Migrating imports to path aliases...\n');

try {
	processDirectory(sourceDir);

	console.log(`\n✅ Migration complete!`);
	console.log(
		`   Total files modified: ${new Set(replacements.map(r => r.file)).size}`,
	);
	console.log(`   Total imports updated: ${replacements.length}`);

	// Show sample replacements
	if (replacements.length > 0) {
		console.log('\n📝 Sample replacements:');
		replacements.slice(0, 5).forEach(r => {
			console.log(`   ${r.oldImport} → ${r.newImport}`);
		});
	}
} catch (error) {
	console.error('❌ Migration failed:', error);
	process.exit(1);
}

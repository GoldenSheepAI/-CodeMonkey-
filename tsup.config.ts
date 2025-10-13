import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['source/cli.tsx'],
	outDir: 'dist',
	format: ['esm'],
	clean: true,
	splitting: false,
	sourcemap: true,
	minify: false,
	external: ['react', 'ink', 'ink-*'],
	banner: {
		js: '#!/usr/bin/env node',
	},
	loader: {
		'.md': 'text',
	},
	define: {
		__DEV__: 'false',
	},
});
/// <reference types="vitest" />
import {defineConfig} from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		setupFiles: ['./tests/setup.ts'],
		include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		exclude: ['tests/e2e/**'],
		coverage: {
			reporter: ['text', 'json', 'html'],
			exclude: [
				'dist/**',
				'node_modules/**',
				'tests/**',
				'scripts/**',
				'*.config.{js,ts}',
				'coverage/**',
			],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'source'),
		},
	},
});

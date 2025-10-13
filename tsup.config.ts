import {defineConfig} from 'tsup';

export default defineConfig({
	entry: ['source/cli.tsx'],
	outDir: 'dist',
	format: ['esm'],
	clean: true,
	splitting: false,
	sourcemap: true,
	minify: false,
	bundle: true,
	shims: true,
	external: ['react', 'ink', 'ink-*'],
	loader: {
		'.md': 'text',
	},
	define: {
		__DEV__: 'false',
	},
	tsconfig: 'tsconfig.json',
	esbuildOptions(options) {
		options.alias = {
			'@': './source',
		};
	},
});

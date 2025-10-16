import {readFileSync, existsSync} from 'node:fs';
import {join, basename} from 'node:path';
import {FileScanner} from './file-scanner.js';
import {LanguageDetector, type DetectedLanguages} from './language-detector.js';
import {
	FrameworkDetector,
	type ProjectDependencies,
} from './framework-detector.js';

export type ProjectAnalysis = {
	projectPath: string;
	projectName: string;
	languages: DetectedLanguages;
	dependencies: ProjectDependencies;
	projectType: string;
	keyFiles: {
		config: string[];
		documentation: string[];
		build: string[];
		test: string[];
		[key: string]: string[];
	};
	structure: {
		totalFiles: number;
		scannedFiles: number;
		directories: string[];
		importantDirectories: string[];
	};
	buildCommands: Record<string, string>;
	description?: string;
	repository?: string;
};

export class ProjectAnalyzer {
	private readonly fileScanner: FileScanner;
	private readonly frameworkDetector: FrameworkDetector;

	constructor(private readonly projectPath: string) {
		this.fileScanner = new FileScanner(projectPath);
		this.frameworkDetector = new FrameworkDetector(projectPath);
	}

	/**
	 * Perform comprehensive project analysis
	 */
	public analyze(): ProjectAnalysis {
		// Scan files
		const scanResult = this.fileScanner.scan();
		const keyFiles = this.fileScanner.getProjectFiles() as {
			config: string[];
			documentation: string[];
			build: string[];
			test: string[];
			[key: string]: string[];
		};

		// Detect languages
		const codeFiles = scanResult.files.filter(
			file => this.isCodeFile(file) && !this.isTestFile(file),
		);
		const languages = LanguageDetector.detectLanguages(codeFiles);

		// Detect frameworks and dependencies
		const dependencies = this.frameworkDetector.detectDependencies();

		// Analyze project structure
		const importantDirectories = this.getImportantDirectories(
			scanResult.directories,
		);

		// Get build commands
		const buildCommands = this.frameworkDetector.getBuildCommands();

		// Extract project metadata
		const {projectName, description, repository} =
			this.extractProjectMetadata();

		// Determine project type
		const projectType = this.determineProjectType(languages, dependencies);

		return {
			projectPath: this.projectPath,
			projectName,
			languages,
			dependencies,
			projectType,
			keyFiles,
			structure: {
				totalFiles: scanResult.totalFiles,
				scannedFiles: scanResult.scannedFiles,
				directories: scanResult.directories,
				importantDirectories,
			},
			buildCommands,
			description,
			repository,
		};
	}

	/**
	 * Check if a file is a code file
	 */
	private isCodeFile(file: string): boolean {
		const codeExtensions = [
			'.js',
			'.jsx',
			'.ts',
			'.tsx',
			'.py',
			'.rs',
			'.go',
			'.java',
			'.kt',
			'.c',
			'.cpp',
			'.h',
			'.hpp',
			'.cs',
			'.php',
			'.rb',
			'.swift',
			'.dart',
			'.vue',
			'.svelte',
		];

		const ext = file.slice(Math.max(0, file.lastIndexOf('.')));
		return codeExtensions.includes(ext);
	}

	/**
	 * Check if a file is a test file
	 */
	private isTestFile(file: string): boolean {
		const fileName = basename(file).toLowerCase();
		return (
			fileName.includes('test') ||
			fileName.includes('spec') ||
			file.includes('__tests__') ||
			file.includes('/test/') ||
			file.includes('/tests/') ||
			file.includes('/spec/')
		);
	}

	/**
	 * Get important directories based on common patterns
	 */
	private getImportantDirectories(directories: string[]): string[] {
		const important = new Set<string>();

		const sourcePatterns = new Set([
			'src',
			'source',
			'app',
			'lib',
			'libs',
			'components',
			'pages',
			'views',
			'routes',
			'api',
			'server',
			'backend',
			'frontend',
			'models',
			'controllers',
			'services',
			'utils',
			'config',
			'configs',
			'settings',
			'assets',
			'static',
			'public',
			'docs',
			'documentation',
		]);

		const testPatterns = ['test', 'tests', '__tests__', 'spec'];

		// First pass: Add all source directories
		for (const dir of directories) {
			const dirName = basename(dir).toLowerCase();
			const dirParts = dir.split('/');

			// Check if this is a source directory (not inside test directories)
			const isInTestDir = dirParts.some(part =>
				testPatterns.includes(part.toLowerCase()),
			);

			if (!isInTestDir) {
				// Add if directory name matches source patterns
				if (sourcePatterns.has(dirName)) {
					important.add(dir);
				}

				// Add if any part of the path matches source patterns (e.g., "src/components")
				if (dirParts.some(part => sourcePatterns.has(part.toLowerCase()))) {
					important.add(dir);
				}
			}
		}

		// Second pass: Add test directories only if we don't have many source directories
		if (important.size < 5) {
			for (const dir of directories) {
				const dirName = basename(dir).toLowerCase();
				const dirParts = dir.split('/');

				// Check if this is a test directory
				const isTestDir =
					testPatterns.includes(dirName) ||
					dirParts.some(part => testPatterns.includes(part.toLowerCase()));

				if (
					isTestDir && // Only add test directories that contain meaningful structure
					(dirParts.length > 1 ||
						directories.filter(d => d.startsWith(dir)).length > 1)
				) {
					important.add(dir);
				}
			}
		}

		// Sort with source directories first, then by depth (fewer levels first), then alphabetically
		return [...important].sort((a, b) => {
			const aIsTest = testPatterns.some(pattern => a.includes(pattern));
			const bIsTest = testPatterns.some(pattern => b.includes(pattern));

			// Source directories first
			if (aIsTest !== bIsTest) {
				return aIsTest ? 1 : -1;
			}

			// Then by depth (fewer levels first for better overview)
			const aDepth = a.split('/').length;
			const bDepth = b.split('/').length;
			if (aDepth !== bDepth) {
				return aDepth - bDepth;
			}

			// Finally alphabetically
			return a.localeCompare(b);
		});
	}

	/**
	 * Extract project metadata from package.json, README, etc.
	 */
	private extractProjectMetadata(): {
		projectName: string;
		description?: string;
		repository?: string;
	} {
		const defaultName = basename(this.projectPath);
		let projectName = defaultName;
		let description: string | undefined;
		let repository: string | undefined;

		// Try package.json first
		const packageJsonPath = join(this.projectPath, 'package.json');
		if (existsSync(packageJsonPath)) {
			try {
				const content = readFileSync(packageJsonPath, 'utf-8');
				try {
					const pkg = JSON.parse(content);
					if (pkg.name) projectName = pkg.name;
					if (pkg.description) description = pkg.description;
					if (pkg.repository) {
						if (typeof pkg.repository === 'string') {
							repository = pkg.repository;
						} else if (pkg.repository.url) {
							repository = pkg.repository.url;
						}
					}
				} catch (parseError) {
					console.error('Error parsing package.json:', parseError);
					// Continue without package.json data
				}
			} catch (readError) {
				// File read error - continue without package.json data
			}
		}

		// Try Cargo.toml for Rust projects
		if (!description) {
			const cargoPath = join(this.projectPath, 'Cargo.toml');
			if (existsSync(cargoPath)) {
				try {
					const content = readFileSync(cargoPath, 'utf-8');
					const nameMatch = /^name\s*=\s*"([^"]+)"/m.exec(content);
					const descMatch = /^description\s*=\s*"([^"]+)"/m.exec(content);

					if (nameMatch) projectName = nameMatch[1];
					if (descMatch) description = descMatch[1];
				} catch {
					// Ignore parsing errors
				}
			}
		}

		// Try to extract description from README
		if (!description) {
			const readmeFiles = ['README.md', 'README.rst', 'README.txt', 'README'];
			for (const readmeFile of readmeFiles) {
				const readmePath = join(this.projectPath, readmeFile);
				if (existsSync(readmePath)) {
					try {
						const content = readFileSync(readmePath, 'utf-8');
						const lines = content.split('\n').filter(line => line.trim());

						// Look for the first non-title line as description
						for (const line of lines.slice(1)) {
							if (
								line.trim() &&
								!line.startsWith('#') &&
								!line.startsWith('!')
							) {
								description = line.trim();
								break;
							}
						}

						break;
					} catch {
						// Ignore parsing errors
					}
				}
			}
		}

		return {projectName, description, repository};
	}

	/**
	 * Determine the overall project type
	 */
	private determineProjectType(
		languages: DetectedLanguages,
		dependencies: ProjectDependencies,
	): string {
		// Use framework-based detection first
		const webFrameworks = dependencies.frameworks.filter(
			f => f.category === 'web',
		);
		const backendFrameworks = dependencies.frameworks.filter(
			f => f.category === 'backend',
		);
		const mobileFrameworks = dependencies.frameworks.filter(
			f => f.category === 'mobile',
		);
		const desktopFrameworks = dependencies.frameworks.filter(
			f => f.category === 'desktop',
		);

		if (mobileFrameworks.length > 0) {
			return `${mobileFrameworks[0].name} Mobile Application`;
		}

		if (desktopFrameworks.length > 0) {
			return `${desktopFrameworks[0].name} Desktop Application`;
		}

		if (webFrameworks.length > 0 && backendFrameworks.length > 0) {
			return `Full Stack Web Application (${webFrameworks[0].name} + ${backendFrameworks[0].name})`;
		}

		if (webFrameworks.length > 0) {
			return `${webFrameworks[0].name} Web Application`;
		}

		if (backendFrameworks.length > 0) {
			return `${backendFrameworks[0].name} Backend Application`;
		}

		// Fall back to language-based detection
		return LanguageDetector.suggestProjectType(languages);
	}

	/**
	 * Get coding conventions based on detected languages and frameworks
	 */
	public getCodingConventions(): string[] {
		const analysis = this.analyze();
		const conventions: string[] = [];

		// Language-specific conventions
		if (analysis.languages.primary) {
			const lang = analysis.languages.primary.name;

			switch (lang) {
				case 'JavaScript':
				case 'TypeScript': {
					conventions.push(
						'Use camelCase for variables and functions',
						'Use PascalCase for classes and components',
						'Use const/let instead of var',
					);
					if (
						analysis.dependencies.frameworks.some(f => f.name.includes('React'))
					) {
						conventions.push(
							'Use functional components with hooks',
							'Follow React naming conventions',
						);
					}

					break;
				}

				case 'Python': {
					conventions.push(
						'Follow PEP 8 style guide',
						'Use snake_case for variables and functions',
						'Use PascalCase for classes',
						'Include type hints where appropriate',
					);
					break;
				}

				case 'Rust': {
					conventions.push(
						'Follow Rust naming conventions (snake_case)',
						'Use cargo fmt for formatting',
						'Handle errors explicitly with Result<T, E>',
					);
					break;
				}

				case 'Go': {
					conventions.push(
						'Follow Go naming conventions',
						'Use gofmt for formatting',
						'Handle errors explicitly',
						'Use interfaces for abstraction',
					);
					break;
				}
			}
		}

		// Testing conventions
		if (analysis.dependencies.testingFrameworks.length > 0) {
			conventions.push(
				`Write tests using ${analysis.dependencies.testingFrameworks.join(
					', ',
				)}`,
				'Maintain good test coverage',
			);
		}

		return conventions;
	}
}

/**
 * Ollama Model Auto-Detection
 * Automatically detects installed Ollama models
 */

export interface OllamaModel {
	name: string;
	size: number;
	modified_at: string;
}

/**
 * Fetch installed Ollama models from local server
 */
export async function detectOllamaModels(): Promise<string[]> {
	try {
		const response = await fetch('http://localhost:11434/api/tags', {
			signal: AbortSignal.timeout(3000),
		});

		if (!response.ok) {
			return [];
		}

		const data = (await response.json()) as {models?: OllamaModel[]};
		
		if (!data.models || !Array.isArray(data.models)) {
			return [];
		}

		// Return model names
		return data.models.map((model: OllamaModel) => model.name);
	} catch (error) {
		// Ollama not running or not accessible
		return [];
	}
}

/**
 * Check if Ollama is running
 */
export async function isOllamaRunning(): Promise<boolean> {
	try {
		const response = await fetch('http://localhost:11434/api/tags', {
			signal: AbortSignal.timeout(2000),
		});
		return response.ok;
	} catch (error) {
		return false;
	}
}

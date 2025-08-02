import { Ollama } from "ollama";
import { ollamaConfig } from "../config/index.js";
import { errorColor } from "../ui/colors.js";
import type { Message, Tool, LLMClient } from "../types/index.js";

export class OllamaClient implements LLMClient {
  private ollama: Ollama;
  private currentModel: string;
  private initialized: Promise<void>;

  constructor() {
    this.ollama = new Ollama();
    this.currentModel = "";
    this.initialized = this.initializeDefaultModel();
  }

  private async initializeDefaultModel(): Promise<void> {
    try {
      const availableModels = await this.getAvailableModels();
      if (availableModels.length > 0 && availableModels[0]) {
        this.currentModel = availableModels[0];
      } else {
        console.log(errorColor("No Ollama models available"));
      }
    } catch (error) {
      console.log(errorColor(`Failed to fetch available models: ${error}`));
    }
  }

  async waitForInitialization(): Promise<void> {
    await this.initialized;
  }

  setModel(model: string): void {
    this.currentModel = model;
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  getContextSize(): number {
    return ollamaConfig.contextSize;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.ollama.list();
      return response.models.map((model: any) => model.name);
    } catch (error) {
      console.error("Failed to fetch available models:", error);
      return [];
    }
  }

  async chat(messages: Message[], tools: Tool[]): Promise<any> {
    return await this.ollama.chat({
      model: this.currentModel,
      messages,
      tools,
      options: {
        num_predict: ollamaConfig.maxTokens || 4096,
      },
    });
  }

  async *chatStream(messages: Message[], tools: Tool[]): AsyncIterable<any> {
    const stream = await this.ollama.chat({
      model: this.currentModel,
      messages,
      tools,
      stream: true,
      options: {
        num_predict: ollamaConfig.maxTokens || 4096,
      },
    });

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  async clearContext(): Promise<void> {
    try {
      await this.ollama.chat({
        model: this.currentModel,
        messages: [],
        options: {
          num_predict: 1,
        },
      });
    } catch (error) {
      console.error("Failed to clear model context:", error);
    }
  }
}

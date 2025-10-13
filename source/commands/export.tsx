import {Command, Message} from '@/types/index.js';
import React from 'react';
import SuccessMessage from '@/components/success-message.js';
import fs from 'fs/promises';
import path from 'path';

const formatMessageContent = (message: Message) => {
	let content = '';
	switch (message.role) {
		case 'user':
			content += `## User\n${message.content}`;
			break;
		case 'assistant':
			content += `## Assistant\n${message.content || ''}`;
			if (message.tool_calls) {
				content += `\n\n[tool_use: ${message.tool_calls
					.map(tc => tc.function.name)
					.join(', ')}]`;
			}
			break;
		case 'tool':
			content +=
				`## Tool Output: ${message.name}\n` +
				'```\n' +
				`${message.content}\n` +
				'```\n';
			break;
		case 'system':
			// For now, we don't include system messages in the export
			return '';
		default:
			return '';
	}
	return content + '\n\n';
};

function Export({filename}: {filename: string}) {
	return (
		<SuccessMessage
			hideBox={true}
			message={`✔️ Chat exported to ${filename}`}
		></SuccessMessage>
	);
}

export const exportCommand: Command = {
	name: 'export',
	description: 'Export chat history to markdown (usage: /export [path/to/file.md])',
	handler: async (
		args: string[],
		messages: Message[],
		{provider, model, tokens},
	) => {
		// Generate default filename with timestamp
		const defaultFilename = `codemonkey-chat-${new Date().toISOString().replace(/:/g, '-').slice(0, 19)}.md`;
		
		// Use provided path or default to current directory
		const userPath = args[0];
		let filepath: string;
		
		if (userPath) {
			// User provided a path
			filepath = path.isAbsolute(userPath) 
				? userPath 
				: path.resolve(process.cwd(), userPath);
			
			// If path is a directory, append default filename
			try {
				const stats = await fs.stat(filepath);
				if (stats.isDirectory()) {
					filepath = path.join(filepath, defaultFilename);
				}
			} catch {
				// Path doesn't exist yet, use as-is
			}
		} else {
			// No path provided, use current directory
			filepath = path.resolve(process.cwd(), defaultFilename);
		}

		const frontmatter = `---
session_date: ${new Date().toISOString()}
provider: ${provider}
model: ${model}
total_tokens: ${tokens}
---

# CodeMonkey 🐒 Chat Export

`;

		const markdownContent = messages.map(formatMessageContent).join('');

		await fs.writeFile(filepath, frontmatter + markdownContent);

		return React.createElement(Export, {
			key: `export-${Date.now()}`,
			filename: filepath,
		});
	},
};

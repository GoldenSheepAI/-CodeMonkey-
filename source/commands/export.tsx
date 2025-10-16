import fs from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import {type Command, type Message} from '@/types/index.js';
import SuccessMessage from '@/components/success-message.js';

const formatMessageContent = (message: Message) => {
	let content = '';
	switch (message.role) {
		case 'user': {
			content += `## User\n${message.content}`;
			break;
		}

		case 'assistant': {
			content += `## Assistant\n${message.content || ''}`;
			if (message.tool_calls) {
				content += `\n\n[tool_use: ${message.tool_calls
					.map(tc => tc.function.name)
					.join(', ')}]`;
			}

			break;
		}

		case 'tool': {
			content +=
				`## Tool Output: ${message.name}\n` +
				'```\n' +
				`${message.content}\n` +
				'```\n';
			break;
		}

		case 'system': {
			// For now, we don't include system messages in the export
			return '';
		}

		default: {
			return '';
		}
	}

	return content + '\n\n';
};

function Export({filename}: {readonly filename: string}) {
	return <SuccessMessage hideBox message={`✔️ Chat exported to ${filename}`} />;
}

export const exportCommand: Command = {
	name: 'export',
	description: 'Export the chat history to a markdown file',
	async handler(
		args: string[],
		messages: Message[],
		{provider, model, tokens},
	) {
		const filename =
			args[0] ||
			`codemonkey-chat-${new Date().toISOString().replace(/:/g, '-')}.md`;
		const filepath = path.resolve(process.cwd(), filename);

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
			filename,
		});
	},
};

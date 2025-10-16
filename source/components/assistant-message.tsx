import {Text, Box} from 'ink';
import {memo, useMemo} from 'react';
import chalk from 'chalk';
import {highlight} from 'cli-highlight';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import type {AssistantMessageProps} from '@/types/index.js';

// Basic markdown parser for terminal
export function parseMarkdown(text: string, themeColors: any): string {
	let result = text;

	// Code blocks (```language\ncode\n```)
	result = result.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
		try {
			// Apply syntax highlighting with detected language
			const highlighted = highlight(code.trim(), {
				language: lang || 'plaintext',
				theme: 'default',
			});
			return highlighted;
		} catch {
			// Fallback to plain colored text if highlighting fails
			return chalk.hex(themeColors.tool)(code.trim());
		}
	});

	// Inline code (`code`)
	result = result.replace(/`([^`]+)`/g, (_match, code) => {
		return chalk.hex(themeColors.tool)(code);
	});

	// Bold (**text** or __text__)
	result = result.replace(/\*\*([^*]+)\*\*/g, (_match, text) => {
		return chalk.hex(themeColors.white).bold(text);
	});
	result = result.replace(/__([^_]+)__/g, (_match, text) => {
		return chalk.hex(themeColors.white).bold(text);
	});

	// Italic (*text* or _text_)
	result = result.replace(/\*([^*]+)\*/g, (_match, text) => {
		return chalk.hex(themeColors.white).italic(text);
	});
	result = result.replace(/_([^_]+)_/g, (_match, text) => {
		return chalk.hex(themeColors.white).italic(text);
	});

	// Headings (# Heading)
	result = result.replace(/^(#{1,6})\s+(.+)$/gm, (_match, _hashes, text) => {
		return chalk.hex(themeColors.primary).bold(text);
	});

	// Links [text](url)
	result = result.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, text, url) => {
		return (
			chalk.hex(themeColors.info).underline(text) +
			' ' +
			chalk.hex(themeColors.secondary)(`(${url})`)
		);
	});

	// Blockquotes (> text)
	result = result.replace(/^>\s+(.+)$/gm, (_match, text) => {
		return chalk.hex(themeColors.secondary).italic(`> ${text}`);
	});

	// List items (- item or * item or 1. item)
	result = result.replace(/^\s*[-*]\s+(.+)$/gm, (_match, text) => {
		return chalk.hex(themeColors.white)(`• ${text}`);
	});
	result = result.replace(/^\s*\d+\.\s+(.+)$/gm, (_match, text) => {
		return chalk.hex(themeColors.white)(text);
	});

	return result;
}

// Helper function to wrap text to terminal width
function wrapText(text: string, maxWidth: number): string[] {
	const lines: string[] = [];
	const paragraphs = text.split('\n');

	for (const paragraph of paragraphs) {
		if (paragraph.trim() === '') {
			lines.push('');
			continue;
		}

		const words = paragraph.split(' ');
		let currentLine = '';

		for (const word of words) {
			// Strip ANSI codes for length calculation
			const testLine = currentLine ? `${currentLine} ${word}` : word;
			const testLineLength = testLine.replace(/\u001B\[[\d;]*m/g, '').length;

			if (testLineLength <= maxWidth) {
				currentLine = testLine;
			} else if (currentLine) {
				lines.push(currentLine);
				currentLine = word;
			} else {
				// Word is longer than max width, break it
				lines.push(word);
			}
		}

		if (currentLine) {
			lines.push(currentLine);
		}
	}

	return lines;
}

export default memo(function AssistantMessage({
	message,
	model,
}: AssistantMessageProps) {
	const {colors} = useTheme();
	const terminalWidth = useTerminalWidth();

	// Calculate content width (accounting for padding and borders)
	// Ensure content fits within terminal boundaries
	const maxWidth = Math.min(terminalWidth - 4, 120); // Cap at 120 chars for readability
	const contentWidth = Math.max(40, maxWidth);

	// Render markdown to terminal-formatted text with theme colors
	const renderedMessage = useMemo(() => {
		try {
			return parseMarkdown(message, colors);
		} catch {
			// Fallback to plain text if markdown parsing fails
			return message;
		}
	}, [message, colors]);

	// Wrap text for better display
	const wrappedLines = useMemo(() => {
		return wrapText(renderedMessage, contentWidth);
	}, [renderedMessage, contentWidth]);

	// Calculate box width to fit within terminal
	const boxWidth = Math.min(terminalWidth, 120);

	return (
		<TitledBox
			key={`assistant-${model}`}
			borderStyle="round"
			titles={[`🤖 ${model}`]}
			titleStyles={titleStyles.pill}
			width={boxWidth}
			borderColor={colors.primary}
			paddingX={3}
			paddingY={2}
			flexDirection="column"
			marginBottom={1}
		>
			{wrappedLines.map((line, index) => (
				<Text key={index} wrap="wrap">
					{line}
				</Text>
			))}
		</TitledBox>
	);
});

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Box, Text} from 'ink';
import {memo} from 'react';

import {useTheme} from '@/hooks/useTheme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json once at module load time to avoid repeated file reads
const packageJson = JSON.parse(
	fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
);

export default memo(function WelcomeMessage() {
	const {colors} = useTheme();

	return (
		<Box flexDirection="column" marginBottom={1}>
			{/* Modern minimalist header */}
			<Box marginBottom={1}>
				<Text bold color={colors.primary}>
					CodeMonkey 🐒
				</Text>
				<Text color={colors.secondary}> v{packageJson.version}</Text>
			</Box>

			{/* Clean, professional introduction */}
			<Box flexDirection="column">
				<Text color={colors.white}>
					AI coding assistant for local development. Type your request below or
					use /help for commands.
				</Text>
			</Box>
		</Box>
	);
});

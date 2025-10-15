import {Box, Text} from 'ink';
import {memo} from 'react';
import {existsSync} from 'fs';

import {themes, getThemeColors} from '@/config/themes.js';
import type {ThemePreset} from '@/types/ui.js';

// Get CWD once at module load time
const cwd = process.cwd();

interface UpdateInfo {
	hasUpdate: boolean;
	currentVersion: string;
	latestVersion?: string;
	updateCommand?: string;
}

export default memo(function Status({
	provider,
	model,
	theme,
	updateInfo,
	agentsMdLoaded,
}: {
	provider: string;
	model: string;
	theme: ThemePreset;
	updateInfo?: UpdateInfo | null;
	agentsMdLoaded?: boolean;
}) {
	const colors = getThemeColors(theme);

	// Check for AGENTS.md synchronously if not provided
	const hasAgentsMd = agentsMdLoaded ?? existsSync(`${cwd}/AGENTS.md`);

	// Determine sandbox status
	const sandboxStatus = hasAgentsMd ? '' : 'no sandbox';

	// Determine update status
	const updatePercent = updateInfo?.hasUpdate ? '(update available)' : '(100%)';

	// Extract directory name from full path
	const dirName = cwd.split('/').pop() || cwd;

	return (
		<Box
			borderStyle="round"
			borderColor={colors.secondary}
			paddingX={1}
			width="100%"
		>
			<Text color={colors.secondary}>
				~/{dirName} ({provider}*) {sandboxStatus} {model} {updatePercent}
			</Text>
		</Box>
	);
});

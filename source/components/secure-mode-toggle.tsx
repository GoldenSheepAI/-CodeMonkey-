import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import SelectInput from 'ink-select-input';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {loadPreferences, savePreferences} from '@/config/preferences.js';

interface SecureModeToggleProps {
	onComplete?: () => void;
}

export default function SecureModeToggle({onComplete}: SecureModeToggleProps) {
	const boxWidth = useTerminalWidth();
	const {colors} = useTheme();
	const [status, setStatus] = useState<'selecting' | 'success'>('selecting');
	const [currentMode, setCurrentMode] = useState<boolean>(false);

	useEffect(() => {
		const prefs = loadPreferences();
		setCurrentMode(prefs.secureMode?.enabled ?? false);
	}, []);

	const items = [
		{
			label: `${currentMode ? '✓' : ' '} Enable Secure Mode - Scan for sensitive data`,
			value: 'enable',
		},
		{
			label: `${!currentMode ? '✓' : ' '} Disable Secure Mode - No scanning`,
			value: 'disable',
		},
		{
			label: '⚙️  Auto-Redact Mode (automatically remove secrets)',
			value: 'auto-redact',
		},
		{
			label: '⚠️  Warn-Only Mode (alert but don\'t block)',
			value: 'warn-only',
		},
	];

	const handleSelect = (item: {value: string}) => {
		const prefs = loadPreferences();

		if (item.value === 'enable') {
			prefs.secureMode = {
				enabled: true,
				autoRedact: false,
				warnOnly: true,
				scanPatterns: ['api-keys', 'credentials', 'pii'],
				detectedLeaks: 0,
			};
			savePreferences(prefs);
			setStatus('success');
			setTimeout(() => {
				if (onComplete) onComplete();
			}, 2000);
		} else if (item.value === 'disable') {
			prefs.secureMode = {
				enabled: false,
			};
			savePreferences(prefs);
			setStatus('success');
			setTimeout(() => {
				if (onComplete) onComplete();
			}, 2000);
		} else if (item.value === 'auto-redact') {
			prefs.secureMode = {
				...(prefs.secureMode || {}),
				enabled: true,
				autoRedact: true,
				warnOnly: false,
			};
			savePreferences(prefs);
			setStatus('success');
			setTimeout(() => {
				if (onComplete) onComplete();
			}, 2000);
		} else if (item.value === 'warn-only') {
			prefs.secureMode = {
				...(prefs.secureMode || {}),
				enabled: true,
				autoRedact: false,
				warnOnly: true,
			};
			savePreferences(prefs);
			setStatus('success');
			setTimeout(() => {
				if (onComplete) onComplete();
			}, 2000);
		}
	};

	if (status === 'success') {
		const prefs = loadPreferences();
		const enabled = prefs.secureMode?.enabled ?? false;
		const autoRedact = prefs.secureMode?.autoRedact ?? false;
		const warnOnly = prefs.secureMode?.warnOnly ?? true;

		return (
			<Box>
				<TitledBox
					borderStyle="round"
					titles={['✓ Secure Mode Updated']}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={colors.success}
					paddingX={2}
					paddingY={1}
					flexDirection="column"
				>
					<Text color={colors.success}>
						{enabled
							? `✓ Secure Mode enabled! ${autoRedact ? 'Auto-redacting' : 'Warning about'} sensitive data.`
							: '✓ Secure Mode disabled. No security scanning.'}
					</Text>
					{enabled && (
						<Box marginTop={1}>
							<Text color={colors.white} dimColor>
								Mode: {autoRedact ? 'Auto-Redact' : warnOnly ? 'Warn-Only' : 'Block'}
							</Text>
						</Box>
					)}
					{enabled && (
						<Box marginTop={1}>
							<Text color={colors.white} dimColor>
								💡 NoLeakAI will scan all prompts for: API keys, credentials, PII, secrets
							</Text>
						</Box>
					)}
				</TitledBox>
			</Box>
		);
	}

	return (
		<Box>
			<TitledBox
				borderStyle="round"
				titles={['🔒 Secure Mode - NoLeakAI Protection']}
				titleStyles={titleStyles.pill}
				width={boxWidth}
				borderColor={colors.primary}
				paddingX={2}
				paddingY={1}
				flexDirection="column"
			>
				<Box marginBottom={1}>
					<Text color={colors.white}>
						Current mode:{' '}
						<Text bold color={currentMode ? colors.success : colors.error}>
							{currentMode ? 'ENABLED' : 'DISABLED'}
						</Text>
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color={colors.white} dimColor>
						Secure Mode scans all prompts for sensitive data (API keys, credentials, PII)
						before sending to AI providers. Protects against accidental data leaks.
					</Text>
				</Box>

				<SelectInput items={items} onSelect={handleSelect} />

				<Box marginTop={1}>
					<Text color={colors.white} dimColor>
						🔒 Powered by NoLeakAI - Canary token leak detection
					</Text>
				</Box>
			</TitledBox>
		</Box>
	);
}

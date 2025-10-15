import React, {useState, useCallback} from 'react';
import {Box, Text} from 'ink';
import SelectInput from 'ink-select-input';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

interface Provider {
	name: string;
	enabled: boolean;
	description?: string;
	apiKey?: string;
}

interface ProviderSwitcherProps {
	onComplete?: () => void;
}

export default function ProviderSwitcher({onComplete}: ProviderSwitcherProps) {
	const boxWidth = useTerminalWidth();
	const {colors} = useTheme();
	const [status, setStatus] = useState<'selecting' | 'success' | 'error'>(
		'selecting',
	);
	const [message, setMessage] = useState('');

	const configPath = join(process.cwd(), 'agents.config.json');

	// Read current providers
	let providers: Provider[] = [];
	let currentProvider = 'None';

	try {
		const configData = JSON.parse(readFileSync(configPath, 'utf-8'));
		providers = configData.codemonkey?.providers || [];
		const active = providers.find(p => p.enabled);
		if (active) {
			currentProvider = active.name;
		}
	} catch (error) {
		setStatus('error');
		setMessage('Could not read agents.config.json');
	}

	// Create selection items
	const items = providers.map(provider => ({
		label: `${provider.enabled ? '✓' : ' '} ${provider.name}${
			provider.description ? ` - ${provider.description}` : ''
		}`,
		value: provider.name,
		key: provider.name.charAt(0).toUpperCase(),
	}));

	const handleSelect = useCallback(
		(item: {value: string}) => {
			try {
				// Read config
				const configData = JSON.parse(readFileSync(configPath, 'utf-8'));
				const providers = configData.codemonkey?.providers || [];

				// Disable all providers
				providers.forEach((p: Provider) => {
					p.enabled = false;
				});

				// Enable selected provider
				const selectedProvider = providers.find(
					(p: Provider) => p.name === item.value,
				);

				if (selectedProvider) {
					selectedProvider.enabled = true;

					// Check if API key is needed and present
					if (
						selectedProvider.apiKey &&
						(selectedProvider.apiKey.includes('YOUR_') ||
							selectedProvider.apiKey.includes('your-'))
					) {
						setStatus('error');
						setMessage(
							`⚠️  ${selectedProvider.name} requires an API key. Please edit agents.config.json and add your API key.`,
						);
						setTimeout(() => {
							if (onComplete) onComplete();
						}, 3000);
						return;
					}

					// Write config back
					configData.codemonkey.providers = providers;
					writeFileSync(configPath, JSON.stringify(configData, null, '\t'));

					setStatus('success');
					setMessage(
						`✓ Switched to ${selectedProvider.name}. Restart CodeMonkey for changes to take effect.`,
					);

					setTimeout(() => {
						if (onComplete) onComplete();
					}, 2000);
				}
			} catch (error) {
				setStatus('error');
				setMessage(`Failed to switch provider: ${(error as Error).message}`);
				setTimeout(() => {
					if (onComplete) onComplete();
				}, 3000);
			}
		},
		[configPath, onComplete],
	);

	if (status === 'success') {
		return (
			<Box>
				<TitledBox
					borderStyle="round"
					titles={['✓ Provider Switched']}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={colors.success}
					paddingX={2}
					paddingY={1}
				>
					<Text color={colors.success}>{message}</Text>
				</TitledBox>
			</Box>
		);
	}

	if (status === 'error') {
		return (
			<Box>
				<TitledBox
					borderStyle="round"
					titles={['✗ Error']}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={colors.error}
					paddingX={2}
					paddingY={1}
				>
					<Text color={colors.error}>{message}</Text>
				</TitledBox>
			</Box>
		);
	}

	return (
		<Box>
			<TitledBox
				borderStyle="round"
				titles={['🔄 Switch AI Provider']}
				titleStyles={titleStyles.pill}
				width={boxWidth}
				borderColor={colors.primary}
				paddingX={2}
				paddingY={1}
				flexDirection="column"
			>
				<Box marginBottom={1}>
					<Text color={colors.white}>
						Current provider: <Text bold>{currentProvider}</Text>
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color={colors.white} dimColor>
						Select a provider (only one can be active at a time):
					</Text>
				</Box>

				<SelectInput items={items} onSelect={handleSelect} />

				<Box marginTop={1}>
					<Text color={colors.white} dimColor>
						Tip: Edit agents.config.json to add API keys
					</Text>
				</Box>
			</TitledBox>
		</Box>
	);
}

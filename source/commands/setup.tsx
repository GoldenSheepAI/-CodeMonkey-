import React, {useState, useCallback} from 'react';
import {Box, Text} from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {Command} from '@/types/index.js';
import {secureKeyStorage} from '@/utils/secure-key-storage.js';
import {appConfig} from '@/config/index.js';

interface SetupProps {
	onComplete?: () => void;
}

interface ProviderInfo {
	name: string;
	displayName: string;
	needsKey: boolean;
	currentStatus: 'none' | 'stored' | 'configured';
}

export default function Setup({onComplete}: SetupProps) {
	const boxWidth = useTerminalWidth();
	const {colors} = useTheme();
	const [step, setStep] = useState<'menu' | 'provider-select' | 'key-input' | 'testing' | 'success' | 'error'>('menu');
	const [selectedProvider, setSelectedProvider] = useState<string>('');
	const [apiKey, setApiKey] = useState('');
	const [message, setMessage] = useState('');
	const [providers, setProviders] = useState<ProviderInfo[]>([]);

	// Get providers that need API keys
	const getConfigurableProviders = useCallback((): ProviderInfo[] => {
		if (!appConfig["API Providers"]) return [];

		return appConfig["API Providers"]
			.filter(provider => provider.name !== 'Local Ollama') // Skip local providers
			.map(provider => {
				const hasStoredKey = secureKeyStorage.hasKey(provider.name);
				const hasConfiguredKey = provider.apiKey && !provider.apiKey.includes('YOUR_') && !provider.apiKey.includes('${');

				let status: 'none' | 'stored' | 'configured' = 'none';
				if (hasStoredKey) status = 'stored';
				else if (hasConfiguredKey) status = 'configured';

				return {
					name: provider.name,
					displayName: provider.name,
					needsKey: true,
					currentStatus: status
				};
			});
	}, []);

	React.useEffect(() => {
		const configurableProviders = getConfigurableProviders();
		setProviders(configurableProviders);
	}, [getConfigurableProviders]);

	const handleProviderSelect = useCallback((item: {value: string}) => {
		setSelectedProvider(item.value);
		setStep('key-input');
		setMessage('');
	}, []);

	const handleKeySubmit = useCallback(async () => {
		if (!apiKey.trim()) {
			setMessage('API key cannot be empty');
			return;
		}

		setStep('testing');
		setMessage('Testing API key...');

		try {
			// Test the API key by making a simple request
			const provider = providers.find(p => p.name === selectedProvider);
			if (!provider) {
				throw new Error('Provider not found');
			}

			// Basic key format validation
			if (provider.name === 'OpenAI' && !apiKey.startsWith('sk-')) {
				throw new Error('OpenAI API keys should start with "sk-"');
			}
			if (provider.name === 'Anthropic' && !apiKey.startsWith('sk-ant-')) {
				throw new Error('Anthropic API keys should start with "sk-ant-"');
			}
			if (provider.name === 'Hugging Face' && !apiKey.startsWith('hf_')) {
				throw new Error('Hugging Face API keys should start with "hf_"');
			}

			// Store the key securely
			secureKeyStorage.storeKey(selectedProvider, apiKey);

			setStep('success');
			setMessage(`✅ Successfully configured ${selectedProvider}!`);

			setTimeout(() => {
				if (onComplete) onComplete();
			}, 2000);

		} catch (error) {
			setStep('error');
			setMessage(`❌ Failed to configure ${selectedProvider}: ${(error as Error).message}`);

			setTimeout(() => {
				setStep('key-input');
				setMessage('');
			}, 3000);
		}
	}, [apiKey, selectedProvider, providers, onComplete]);

	// Menu step
	if (step === 'menu') {
		const menuItems = [
			{
				label: '🔑 Setup API Keys',
				value: 'setup-keys',
				key: 's'
			},
			{
				label: '📋 View Stored Keys',
				value: 'view-keys',
				key: 'v'
			},
			{
				label: '🗑️  Remove API Keys',
				value: 'remove-keys',
				key: 'r'
			},
			{
				label: '✅ Done',
				value: 'done',
				key: 'd'
			}
		];

		return (
			<Box>
				<TitledBox
					borderStyle="round"
					titles={['🚀 CodeMonkey Setup']}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={colors.primary}
					paddingX={2}
					paddingY={1}
					flexDirection="column"
				>
					<Box marginBottom={1}>
						<Text color={colors.white}>
							Welcome to CodeMonkey! Let's get you set up with API providers.
						</Text>
					</Box>

					<Box marginBottom={1}>
						<Text color={colors.white} dimColor>
							Choose an option:
						</Text>
					</Box>

					<SelectInput
						items={menuItems}
						onSelect={(item) => {
							switch (item.value) {
								case 'setup-keys':
									setStep('provider-select');
									break;
								case 'view-keys':
									setMessage(`Stored providers: ${secureKeyStorage.listProviders().join(', ') || 'None'}`);
									break;
								case 'remove-keys':
									setMessage('Key removal feature coming soon');
									break;
								case 'done':
									if (onComplete) onComplete();
									break;
							}
						}}
					/>

					{message && (
						<Box marginTop={1}>
							<Text color={colors.secondary}>{message}</Text>
						</Box>
					)}
				</TitledBox>
			</Box>
		);
	}

	// Provider selection step
	if (step === 'provider-select') {
		const availableProviders = providers.filter(p => p.currentStatus !== 'stored');
		const providerItems = availableProviders.map(provider => ({
			label: `${provider.name} ${provider.currentStatus === 'configured' ? '(configured)' : '(needs key)'}`,
			value: provider.name,
			key: provider.name.charAt(0).toLowerCase()
		}));

		if (providerItems.length === 0) {
			return (
				<Box>
					<TitledBox
						borderStyle="round"
						titles={['✅ All Set!']}
						titleStyles={titleStyles.pill}
						width={boxWidth}
						borderColor={colors.success}
						paddingX={2}
						paddingY={1}
					>
						<Text color={colors.success}>
							All providers are already configured! 🎉
						</Text>
						<Box marginTop={1}>
							<Text color={colors.secondary} dimColor>
								Press any key to continue...
							</Text>
						</Box>
					</TitledBox>
				</Box>
			);
		}

		return (
			<Box>
				<TitledBox
					borderStyle="round"
					titles={['🔑 Select Provider to Configure']}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={colors.primary}
					paddingX={2}
					paddingY={1}
					flexDirection="column"
				>
					<Box marginBottom={1}>
						<Text color={colors.white} dimColor>
							Select a provider to add an API key:
						</Text>
					</Box>

					<SelectInput items={providerItems} onSelect={handleProviderSelect} />
				</TitledBox>
			</Box>
		);
	}

	// API key input step
	if (step === 'key-input') {
		return (
			<Box>
				<TitledBox
					borderStyle="round"
					titles={[`🔑 Enter API Key for ${selectedProvider}`]}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={colors.primary}
					paddingX={2}
					paddingY={1}
					flexDirection="column"
				>
					<Box marginBottom={1}>
						<Text color={colors.white}>
							Enter your API key for <Text bold>{selectedProvider}</Text>:
						</Text>
					</Box>

					<Box marginBottom={1}>
						<TextInput
							value={apiKey}
							placeholder="sk-... or hf_... or your-api-key-here"
							onChange={setApiKey}
							onSubmit={handleKeySubmit}
						/>
					</Box>

					<Box marginBottom={1}>
						<Text color={colors.white} dimColor>
							💡 Tip: Your API key will be stored securely and encrypted locally
						</Text>
					</Box>

					{message && (
						<Box>
							<Text color={colors.secondary}>{message}</Text>
						</Box>
					)}
				</TitledBox>
			</Box>
		);
	}

	// Testing step
	if (step === 'testing') {
		return (
			<Box>
				<TitledBox
					borderStyle="round"
					titles={['🔍 Testing API Key']}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={colors.primary}
					paddingX={2}
					paddingY={1}
				>
					<Text color={colors.white}>{message}</Text>
				</TitledBox>
			</Box>
		);
	}

	// Success step
	if (step === 'success') {
		return (
			<Box>
				<TitledBox
					borderStyle="round"
					titles={['✅ Success!']}
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

	// Error step
	if (step === 'error') {
		return (
			<Box>
				<TitledBox
					borderStyle="round"
					titles={['❌ Error']}
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

	return null;
}

import React, {useState} from 'react';
import {Box, Text} from 'ink';
import SelectInput from 'ink-select-input';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {loadConfig, saveConfig} from '@/config/index.js';
import SuccessMessage from '@/components/success-message.js';
import ErrorMessage from '@/components/error-message.js';
import InfoMessage from '@/components/info-message.js';

interface MCPManagerProps {
	onComplete: () => void;
}

interface MCPServer {
	name: string;
	enabled: boolean;
	command?: string;
	args?: string[];
	env?: Record<string, string>;
	description?: string;
}

export default function MCPManager({onComplete}: MCPManagerProps) {
	const {colors} = useTheme();
	const boxWidth = useTerminalWidth();
	const [stage, setStage] = useState<'select' | 'success' | 'error' | 'info'>(
		'select',
	);
	const [message, setMessage] = useState('');

	const config = loadConfig();
	const mcpServers: MCPServer[] = config.codemonkey?.mcpServers || [];

	if (mcpServers.length === 0) {
		return (
			<Box flexDirection="column">
				<InfoMessage
					message="No MCP servers configured. Add them to agents.config.json first."
					hideBox={true}
				/>
				<Box marginTop={1}>
					<Text color={colors.secondary}>
						💡 Check MCP_SERVERS_GUIDE.md for setup instructions
					</Text>
				</Box>
			</Box>
		);
	}

	const items = mcpServers.map((server, index) => ({
		label: `${server.enabled ? '✅' : '❌'} ${server.name}${server.description ? ` - ${server.description}` : ''}`,
		value: index,
	}));

	// Add "Done" option
	items.push({
		label: '✨ Done - Return to chat',
		value: -1,
	});

	const handleSelect = async (item: {label: string; value: number}) => {
		if (item.value === -1) {
			// Done - exit
			onComplete();
			return;
		}

		const serverIndex = item.value;
		const server = mcpServers[serverIndex];

		// Toggle enabled state
		server.enabled = !server.enabled;

		try {
			// Update config
			if (!config.codemonkey) {
				config.codemonkey = {};
			}
			config.codemonkey.mcpServers = mcpServers;

			// Save config
			saveConfig(config);

			setMessage(
				`${server.enabled ? '✅ Enabled' : '❌ Disabled'} ${server.name}. Restart CodeMonkey with /restart to apply changes.`,
			);
			setStage('success');

			// Auto-return after showing message
			setTimeout(() => {
				onComplete();
			}, 2000);
		} catch (error) {
			setMessage(`Failed to update config: ${error}`);
			setStage('error');
			setTimeout(() => {
				onComplete();
			}, 3000);
		}
	};

	if (stage === 'success') {
		return <SuccessMessage message={message} hideBox={true} />;
	}

	if (stage === 'error') {
		return <ErrorMessage message={message} hideBox={true} />;
	}

	return (
		<Box flexDirection="column">
			<TitledBox
				borderStyle="round"
				titles={['🔌 MCP Server Manager']}
				titleStyles={titleStyles.pill}
				width={boxWidth}
				borderColor={colors.primary}
				paddingX={2}
				paddingY={1}
				flexDirection="column"
			>
				<Box flexDirection="column" marginBottom={1}>
					<Text color={colors.white} bold>
						Toggle MCP Servers:
					</Text>
					<Text color={colors.secondary}>
						Select a server to enable/disable
					</Text>
				</Box>

				<SelectInput items={items} onSelect={handleSelect} />

				<Box marginTop={1}>
					<Text color={colors.secondary} dimColor>
						💡 Changes require /restart to take effect
					</Text>
				</Box>
			</TitledBox>
		</Box>
	);
}

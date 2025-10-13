import React, {useState, useEffect} from 'react';
import {Box, Text} from 'ink';
import SelectInput from 'ink-select-input';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {loadPreferences, savePreferences} from '@/config/preferences.js';

interface BudgetModeToggleProps {
	onComplete?: () => void;
}

export default function BudgetModeToggle({onComplete}: BudgetModeToggleProps) {
	const boxWidth = useTerminalWidth();
	const {colors} = useTheme();
	const [status, setStatus] = useState<'selecting' | 'success'>('selecting');
	const [currentMode, setCurrentMode] = useState<boolean>(false);

	useEffect(() => {
		const prefs = loadPreferences();
		setCurrentMode(prefs.budgetMode?.enabled ?? false);
	}, []);

	const items = [
		{
			label: `${currentMode ? '✓' : ' '} Enable Budget Mode - Track costs with ToknXR`,
			value: 'enable',
		},
		{
			label: `${!currentMode ? '✓' : ' '} Disable Budget Mode - Direct AI connections`,
			value: 'disable',
		},
		{
			label: '⚙️  Configure ToknXR Settings',
			value: 'configure',
		},
		{
			label: '📊 View ToknXR Dashboard',
			value: 'dashboard',
		},
	];

	const handleSelect = (item: {value: string}) => {
		const prefs = loadPreferences();

		if (item.value === 'enable') {
			prefs.budgetMode = {
				enabled: true,
				toknxrProxyUrl: 'http://localhost:8788',
				showCosts: true,
				budgetLimit: 10.0, // $10 default
				currentSpend: 0,
			};
			savePreferences(prefs);
			setStatus('success');
			setTimeout(() => {
				if (onComplete) onComplete();
			}, 2000);
		} else if (item.value === 'disable') {
			prefs.budgetMode = {
				enabled: false,
			};
			savePreferences(prefs);
			setStatus('success');
			setTimeout(() => {
				if (onComplete) onComplete();
			}, 2000);
		} else if (item.value === 'configure') {
			// TODO: Add configuration UI
			console.log('Configuration UI coming soon');
			if (onComplete) onComplete();
		} else if (item.value === 'dashboard') {
			// Open ToknXR dashboard
			console.log('Opening ToknXR dashboard at http://localhost:8788/dashboard');
			if (onComplete) onComplete();
		}
	};

	if (status === 'success') {
		const prefs = loadPreferences();
		const enabled = prefs.budgetMode?.enabled ?? false;

		return (
			<Box>
				<TitledBox
					borderStyle="round"
					titles={['✓ Budget Mode Updated']}
					titleStyles={titleStyles.pill}
					width={boxWidth}
					borderColor={colors.success}
					paddingX={2}
					paddingY={1}
					flexDirection="column"
				>
					<Text color={colors.success}>
						{enabled
							? '✓ Budget Mode enabled! All AI requests will route through ToknXR proxy.'
							: '✓ Budget Mode disabled. Using direct AI connections.'}
					</Text>
					{enabled && (
						<Box marginTop={1}>
							<Text color={colors.white} dimColor>
								💡 Start ToknXR proxy: cd node_modules/@goldensheepai/toknxr-cli
								&& npx toknxr start
							</Text>
						</Box>
					)}
					{enabled && (
						<Box marginTop={1}>
							<Text color={colors.white} dimColor>
								📊 Dashboard: http://localhost:8788/dashboard
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
				titles={['🎯 Budget Mode - ToknXR Integration']}
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
						Budget Mode routes all AI requests through ToknXR proxy for real-time
						cost tracking, token monitoring, and analytics.
					</Text>
				</Box>

				<SelectInput items={items} onSelect={handleSelect} />

				<Box marginTop={1}>
					<Text color={colors.white} dimColor>
						💡 Tip: ToknXR must be running on localhost:8788 for Budget Mode to
						work
					</Text>
				</Box>
			</TitledBox>
		</Box>
	);
}

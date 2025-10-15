import {memo, useState, useEffect, useRef} from 'react';
import {Box, Text} from 'ink';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import {getTerminalSafeConfig} from '@/utils/terminal-detector.js';
import Spinner from 'ink-spinner';

const THINKING_WORDS = [
	'Thinking',
	'Processing',
	'Analyzing',
	'Contemplating',
	'Pondering',
	'Computing',
	'Reasoning',
	'Considering',
	'Evaluating',
	'Deliberating',
	'Reflecting',
	'Cogitating',
	'Calculating',
	'Strategizing',
	'Synthesizing',
	'Brainstorming',
	'Hypothesizing',
	'Deducing',
	'Inferring',
	'Conceptualizing',
	'Formulating',
	'Investigating',
	'Examining',
	'Interpreting',
	'Deciphering',
	'Solving',
	'Exploring',
	'Assessing',
	'Ruminating',
	'Meditating',
];

const PROGRESS_CHARS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

// Calculate ETA based on elapsed time and typical response patterns
function calculateETA(elapsedSeconds: number): string {
	if (elapsedSeconds < 3) return 'Initializing...';
	if (elapsedSeconds < 10) return 'Almost ready...';
	if (elapsedSeconds < 30)
		return `~${Math.max(0, 30 - elapsedSeconds)}s remaining`;
	return 'Processing complex request...';
}

export default memo(function ThinkingIndicator() {
	const {colors} = useTheme();
	const terminalWidth = useTerminalWidth();
	const terminalConfig = getTerminalSafeConfig();
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [wordIndex, setWordIndex] = useState(0);
	const [progressIndex, setProgressIndex] = useState(0);
	const startTimeRef = useRef<number>(Date.now());

	useEffect(() => {
		startTimeRef.current = Date.now();
		setElapsedSeconds(0);
	}, []);

	// Timer for elapsed time tracking
	useEffect(() => {
		const timer = setInterval(() => {
			const currentTime = Date.now();
			const elapsed = Math.floor((currentTime - startTimeRef.current) / 1000);
			setElapsedSeconds(elapsed);
		}, 1000);

		return () => {
			clearInterval(timer);
		};
	}, []);

	// Timer for thinking word rotation
	useEffect(() => {
		const wordTimer = setInterval(() => {
			setWordIndex(Math.floor(Math.random() * THINKING_WORDS.length));
		}, 3000);

		return () => {
			clearInterval(wordTimer);
		};
	}, []);

	// Timer for progress spinner animation
	useEffect(() => {
		const progressTimer = setInterval(() => {
			setProgressIndex(prev => (prev + 1) % PROGRESS_CHARS.length);
		}, 100);

		return () => {
			clearInterval(progressTimer);
		};
	}, []);

	// Calculate progress percentage (estimated based on time)
	const progressPercentage = Math.min(
		95,
		Math.floor((elapsedSeconds / 30) * 100),
	);

	// Use terminal-safe progress indicators
	const spinnerChar = terminalConfig.features.spinners
		? PROGRESS_CHARS[progressIndex]
		: terminalConfig.features.progressBars
		? '●'
		: '*';

	const progressBarWidth = Math.max(20, Math.floor(terminalWidth * 0.4));
	const filledWidth = Math.floor((progressPercentage / 100) * progressBarWidth);

	// Use terminal-safe progress bar characters
	const progressBar = terminalConfig.features.progressBars
		? '█'.repeat(filledWidth) + '░'.repeat(progressBarWidth - filledWidth)
		: `[${'='.repeat(Math.floor(progressPercentage / 5))}${'.'.repeat(
				20 - Math.floor(progressPercentage / 5),
		  )}]`;

	const eta = calculateETA(elapsedSeconds);

	// Calculate box width to fit within terminal
	const boxWidth = Math.min(terminalWidth, 120);

	return (
		<TitledBox
			borderStyle="round"
			titles={['🧠 AI Processing']}
			titleStyles={titleStyles.pill}
			width={boxWidth}
			borderColor={colors.primary}
			paddingX={2}
			paddingY={1}
			flexDirection="column"
			marginBottom={1}
		>
			{/* Main status line */}
			<Box justifyContent="space-between" marginBottom={1}>
				<Box>
					<Text color={colors.primary} bold>
						{spinnerChar} {THINKING_WORDS[wordIndex]}...
					</Text>
				</Box>
				<Box>
					<Text color={colors.secondary}>{elapsedSeconds}s elapsed</Text>
				</Box>
			</Box>

			{/* Progress bar - only show if terminal supports it */}
			{terminalConfig.features.progressBars && (
				<Box flexDirection="column" marginBottom={1}>
					<Box justifyContent="space-between" marginBottom={0}>
						<Text color={colors.secondary}>Progress</Text>
						<Text color={colors.secondary}>{progressPercentage}%</Text>
					</Box>
					<Box>
						<Text color={colors.primary}>{progressBar}</Text>
					</Box>
				</Box>
			)}

			{/* ETA and controls */}
			<Box justifyContent="space-between">
				<Text color={colors.info}>{eta}</Text>
				<Text color={colors.secondary}>Press Escape to cancel</Text>
			</Box>
		</TitledBox>
	);
});

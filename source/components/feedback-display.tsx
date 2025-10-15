import React, {useState, useCallback, memo} from 'react';
import {Box, Text, useInput} from 'ink';
import {useTheme} from '@/hooks/useTheme.js';
import {useTerminalWidth} from '@/hooks/useTerminalWidth.js';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import {Command} from '@/types/index.js';
import {saveFeedback, getFeedbackStats} from '@/utils/feedback-logger.js';

interface FeedbackDisplayProps {
	onSubmit: (feedback: {
		category: string;
		rating: number;
		message: string;
		email?: string;
	}) => void;
	onCancel: () => void;
}

const FEEDBACK_CATEGORIES = [
	{label: '🚀 Performance & Speed', value: 'performance'},
	{label: '🎨 User Interface & Experience', value: 'ui_ux'},
	{label: '🤖 AI Response Quality', value: 'ai_quality'},
	{label: '🔧 Features & Functionality', value: 'features'},
	{label: '🐛 Bug Reports', value: 'bugs'},
	{label: '💡 Feature Requests', value: 'feature_requests'},
	{label: '📚 Documentation & Help', value: 'documentation'},
	{label: '🔒 Security & Privacy', value: 'security'},
	{label: '⚙️ Installation & Setup', value: 'installation'},
	{label: '💬 General Feedback', value: 'general'},
];

const RATING_OPTIONS = [
	{label: '⭐ 1 - Poor', value: 1},
	{label: '⭐⭐ 2 - Below Average', value: 2},
	{label: '⭐⭐⭐ 3 - Average', value: 3},
	{label: '⭐⭐⭐⭐ 4 - Good', value: 4},
	{label: '⭐⭐⭐⭐⭐ 5 - Excellent', value: 5},
];

const COMMON_QUESTIONS = {
	performance: [
		'How fast do you find CodeMonkey\'s responses?',
		'Are there any performance bottlenecks you\'ve noticed?',
		'How does startup time feel?',
	],
	ui_ux: [
		'How intuitive is the interface?',
		'What do you think about the visual design?',
		'Are the commands easy to discover and use?',
	],
	ai_quality: [
		'How helpful are the AI responses?',
		'Do responses feel accurate and relevant?',
		'Any issues with code suggestions?',
	],
	features: [
		'Which features do you use most?',
		'What features are you missing?',
		'How well do the tools integrate?',
	],
	bugs: [
		'Please describe the bug in detail',
		'What were you trying to do when it happened?',
		'Can you reproduce the issue consistently?',
	],
	feature_requests: [
		'What feature would make CodeMonkey more valuable?',
		'How would this feature fit into your workflow?',
		'Any specific implementation ideas?',
	],
	documentation: [
		'What documentation is missing or unclear?',
		'How can we improve the help system?',
		'What tutorials would be helpful?',
	],
	security: [
		'Any concerns about data privacy?',
		'Thoughts on local vs cloud processing?',
		'Security features you\'d like to see?',
	],
	installation: [
		'How was the installation experience?',
		'Any setup issues you encountered?',
		'What could make setup easier?',
	],
	general: [
		'Overall thoughts on CodeMonkey?',
		'How does it compare to other tools?',
		'What\'s your favorite aspect?',
	],
};

type FeedbackStep = 'category' | 'rating' | 'message' | 'email' | 'confirm' | 'success';

export default memo(function FeedbackDisplay({onSubmit, onCancel}: FeedbackDisplayProps) {
	const {colors} = useTheme();
	const terminalWidth = useTerminalWidth();
	const [step, setStep] = useState<FeedbackStep>('category');
	const [selectedCategory, setSelectedCategory] = useState<string>('');
	const [selectedRating, setSelectedRating] = useState<number>(0);
	const [message, setMessage] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [isTyping, setIsTyping] = useState(false);

	useInput((input, key) => {
		if (key.escape && !isTyping) {
			onCancel();
		}
	});

	const handleCategorySelect = useCallback((item: {value: string}) => {
		setSelectedCategory(item.value);
		setStep('rating');
	}, []);

	const handleRatingSelect = useCallback((item: {value: number}) => {
		setSelectedRating(item.value);
		setStep('message');
		setIsTyping(true);
	}, []);

	const handleMessageSubmit = useCallback((value: string) => {
		setMessage(value);
		setIsTyping(false);
		setStep('email');
		setIsTyping(true);
	}, []);

	const handleEmailSubmit = useCallback((value: string) => {
		setEmail(value);
		setIsTyping(false);
		setStep('confirm');
	}, []);

	const handleFinalSubmit = useCallback(() => {
		const feedback = {
			category: selectedCategory,
			rating: selectedRating,
			message,
			email: email || undefined,
		};
		
		saveFeedback(feedback);
		onSubmit(feedback);
		setStep('success');
	}, [selectedCategory, selectedRating, message, email, onSubmit]);

	const getCategoryLabel = (value: string) => {
		return FEEDBACK_CATEGORIES.find(cat => cat.value === value)?.label || value;
	};

	const getRatingLabel = (value: number) => {
		return RATING_OPTIONS.find(rating => rating.value === value)?.label || `${value} stars`;
	};

	const getQuestions = () => {
		return COMMON_QUESTIONS[selectedCategory as keyof typeof COMMON_QUESTIONS] || [];
	};

	const stats = getFeedbackStats();

	return (
		<TitledBox
			borderStyle="round"
			titles={['💭 Beta Feedback']}
			titleStyles={titleStyles.pill}
			width={terminalWidth}
			borderColor={colors.primary}
			paddingX={2}
			paddingY={1}
			flexDirection="column"
			marginBottom={1}
		>
			{step === 'category' && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color={colors.primary} bold>
							Help us improve CodeMonkey! What area would you like to provide feedback on?
						</Text>
					</Box>
					<Box marginBottom={2}>
						<Text color={colors.secondary}>
							Total feedback received: {stats.totalFeedback} | Average rating: {stats.averageRating.toFixed(1)}⭐
						</Text>
					</Box>
					<SelectInput
						items={FEEDBACK_CATEGORIES}
						onSelect={handleCategorySelect}
						indicatorComponent={({isSelected}) => (
							<Text color={isSelected ? colors.primary : colors.secondary}>
								{isSelected ? '❯' : ' '}
							</Text>
						)}
						itemComponent={({isSelected, label}) => (
							<Text color={isSelected ? colors.primary : colors.white}>
								{label}
							</Text>
						)}
					/>
					<Box marginTop={2}>
						<Text color={colors.secondary}>Press Escape to cancel</Text>
					</Box>
				</Box>
			)}

			{step === 'rating' && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color={colors.primary} bold>
							Rate your experience with: {getCategoryLabel(selectedCategory)}
						</Text>
					</Box>
					<SelectInput
						items={RATING_OPTIONS}
						onSelect={handleRatingSelect}
						indicatorComponent={({isSelected}) => (
							<Text color={isSelected ? colors.primary : colors.secondary}>
								{isSelected ? '❯' : ' '}
							</Text>
						)}
						itemComponent={({isSelected, label}) => (
							<Text color={isSelected ? colors.primary : colors.white}>
								{label}
							</Text>
						)}
					/>
					<Box marginTop={2}>
						<Text color={colors.secondary}>Press Escape to cancel</Text>
					</Box>
				</Box>
			)}

			{step === 'message' && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color={colors.primary} bold>
							Tell us more about your experience:
						</Text>
					</Box>
					
					{/* Show helpful questions */}
					<Box flexDirection="column" marginBottom={1}>
						<Text color={colors.secondary} italic>
							Some questions to consider:
						</Text>
						{getQuestions().map((question, index) => (
							<Text key={index} color={colors.info}>
								• {question}
							</Text>
						))}
					</Box>

					<Box flexDirection="column" marginBottom={2}>
						<Text color={colors.white}>Your feedback:</Text>
						<TextInput
							value={message}
							placeholder="Share your thoughts, suggestions, or issues..."
							onSubmit={handleMessageSubmit}
							onChange={(value) => setMessage(value)}
						/>
					</Box>

					<Box>
						<Text color={colors.secondary}>
							Press Enter to continue, Escape to cancel
						</Text>
					</Box>
				</Box>
			)}

			{step === 'email' && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color={colors.primary} bold>
							Email (optional) - for follow-up questions:
						</Text>
					</Box>
					<Box marginBottom={1}>
						<Text color={colors.secondary}>
							We'll only use this to ask clarifying questions about your feedback.
						</Text>
					</Box>
					<Box flexDirection="column" marginBottom={2}>
						<TextInput
							value={email}
							placeholder="your-email@example.com (optional)"
							onSubmit={handleEmailSubmit}
							onChange={(value) => setEmail(value)}
						/>
					</Box>
					<Box>
						<Text color={colors.secondary}>
							Press Enter to continue, Escape to cancel
						</Text>
					</Box>
				</Box>
			)}

			{step === 'confirm' && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color={colors.primary} bold>
							Review your feedback:
						</Text>
					</Box>
					
					<Box flexDirection="column" marginBottom={2} paddingX={1} borderStyle="single" borderColor={colors.secondary}>
						<Text color={colors.white}>
							<Text color={colors.primary} bold>Category:</Text> {getCategoryLabel(selectedCategory)}
						</Text>
						<Text color={colors.white}>
							<Text color={colors.primary} bold>Rating:</Text> {getRatingLabel(selectedRating)}
						</Text>
						<Text color={colors.white}>
							<Text color={colors.primary} bold>Message:</Text> {message || 'No additional message'}
						</Text>
						{email && (
							<Text color={colors.white}>
								<Text color={colors.primary} bold>Email:</Text> {email}
							</Text>
						)}
					</Box>

					<Box justifyContent="space-between">
						<Text color={colors.success} bold>
							Press Enter to submit feedback
						</Text>
						<Text color={colors.secondary}>
							Press Escape to cancel
						</Text>
					</Box>
				</Box>
			)}

			{step === 'success' && (
				<Box flexDirection="column" alignItems="center">
					<Box marginBottom={1}>
						<Text color={colors.success} bold>
							🎉 Thank you for your feedback!
						</Text>
					</Box>
					<Box marginBottom={1}>
						<Text color={colors.white}>
							Your input helps us make CodeMonkey better for everyone.
						</Text>
					</Box>
					<Box>
						<Text color={colors.secondary}>
							This dialog will close automatically...
						</Text>
					</Box>
				</Box>
			)}
		</TitledBox>
	);
});

// Handle inputs for confirm step
export function useFeedbackConfirmInput(step: FeedbackStep, onSubmit: () => void, onCancel: () => void) {
	useInput((input, key) => {
		if (step === 'confirm') {
			if (key.return) {
				onSubmit();
			}
		}
		if (key.escape) {
			onCancel();
		}
	});
}
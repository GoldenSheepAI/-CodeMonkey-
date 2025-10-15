import React, {useState, useCallback} from 'react';
import {Command} from '@/types/index.js';
import FeedbackDisplay from '@/components/feedback-display.js';
import SuccessMessage from '@/components/success-message.js';

interface FeedbackComponentProps {
	onComplete: () => void;
}

function FeedbackComponent({onComplete}: FeedbackComponentProps) {
	const [isCompleted, setIsCompleted] = useState(false);
	const [submittedFeedback, setSubmittedFeedback] = useState<any>(null);

	const handleSubmit = useCallback((feedback: {
		category: string;
		rating: number;
		message: string;
		email?: string;
	}) => {
		setSubmittedFeedback(feedback);
		setIsCompleted(true);
		
		// Auto-close after 3 seconds
		setTimeout(() => {
			onComplete();
		}, 3000);
	}, [onComplete]);

	const handleCancel = useCallback(() => {
		onComplete();
	}, [onComplete]);

	if (isCompleted && submittedFeedback) {
		return (
			<SuccessMessage
				key={`feedback-success-${Date.now()}`}
				message={`Thank you for your ${submittedFeedback.rating}⭐ feedback on ${submittedFeedback.category}! Your input helps us improve CodeMonkey.`}
			/>
		);
	}

	return (
		<FeedbackDisplay
			key={`feedback-${Date.now()}`}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
		/>
	);
}

export const feedbackCommand: Command = {
	name: 'feedback',
	description: 'Submit beta feedback to help improve CodeMonkey',
	handler: async (_args: string[], _messages, _metadata) => {
		const handleComplete = () => {
			// Component will auto-unmount when this resolves
		};

		return React.createElement(FeedbackComponent, {
			key: `feedback-command-${Date.now()}`,
			onComplete: handleComplete,
		});
	},
};
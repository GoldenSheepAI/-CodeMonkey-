import fs from 'node:fs';
import path from 'node:path';
import {homedir} from 'node:os';

type FeedbackEntry = {
	id: string;
	timestamp: string;
	category: string;
	rating: number;
	message: string;
	email?: string;
	version: string;
	platform: string;
};

type FeedbackStats = {
	totalFeedback: number;
	averageRating: number;
	categoryBreakdown: Record<string, number>;
	ratingDistribution: Record<number, number>;
};

const FEEDBACK_DIR = path.join(homedir(), '.codemonkey-feedback');
const FEEDBACK_FILE = path.join(FEEDBACK_DIR, 'feedback.jsonl');

// Ensure feedback directory exists
function ensureFeedbackDir(): void {
	if (!fs.existsSync(FEEDBACK_DIR)) {
		fs.mkdirSync(FEEDBACK_DIR, {recursive: true});
	}
}

// Generate unique ID for feedback entry
function generateId(): string {
	return `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

// Get package version
function getVersion(): string {
	try {
		const packageJson = JSON.parse(
			fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
		);
		return packageJson.version || 'unknown';
	} catch {
		return 'unknown';
	}
}

// Save feedback to log file
export function saveFeedback(feedback: {
	category: string;
	rating: number;
	message: string;
	email?: string;
}): void {
	ensureFeedbackDir();

	const entry: FeedbackEntry = {
		id: generateId(),
		timestamp: new Date().toISOString(),
		category: feedback.category,
		rating: feedback.rating,
		message: feedback.message,
		email: feedback.email,
		version: getVersion(),
		platform: `${process.platform}-${process.arch}`,
	};

	// Append to JSONL file (one JSON object per line)
	const logLine = JSON.stringify(entry) + '\n';

	try {
		fs.appendFileSync(FEEDBACK_FILE, logLine, 'utf8');
		console.log(`Feedback saved: ${entry.id}`);
	} catch (error) {
		console.error('Failed to save feedback:', error);
	}
}

// Read all feedback entries
export function readAllFeedback(): FeedbackEntry[] {
	ensureFeedbackDir();

	if (!fs.existsSync(FEEDBACK_FILE)) {
		return [];
	}

	try {
		const content = fs.readFileSync(FEEDBACK_FILE, 'utf8');
		const lines = content
			.trim()
			.split('\n')
			.filter(line => line.trim());

		return lines
			.map(line => {
				try {
					return JSON.parse(line) as FeedbackEntry;
				} catch {
					return null;
				}
			})
			.filter((entry): entry is FeedbackEntry => entry !== null);
	} catch {
		return [];
	}
}

// Get feedback statistics
export function getFeedbackStats(): FeedbackStats {
	const allFeedback = readAllFeedback();

	if (allFeedback.length === 0) {
		return {
			totalFeedback: 0,
			averageRating: 0,
			categoryBreakdown: {},
			ratingDistribution: {},
		};
	}

	const totalRating = allFeedback.reduce((sum, entry) => sum + entry.rating, 0);
	const averageRating = totalRating / allFeedback.length;

	const categoryBreakdown: Record<string, number> = {};
	const ratingDistribution: Record<number, number> = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
	};

	for (const entry of allFeedback) {
		// Category breakdown
		categoryBreakdown[entry.category] =
			(categoryBreakdown[entry.category] || 0) + 1;

		// Rating distribution
		ratingDistribution[entry.rating] =
			(ratingDistribution[entry.rating] || 0) + 1;
	}

	return {
		totalFeedback: allFeedback.length,
		averageRating,
		categoryBreakdown,
		ratingDistribution,
	};
}

// Get recent feedback (last N entries)
export function getRecentFeedback(limit = 10): FeedbackEntry[] {
	const allFeedback = readAllFeedback();
	return allFeedback
		.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		)
		.slice(0, limit);
}

// Export feedback to a readable format for analysis
export function exportFeedbackSummary(): string {
	const stats = getFeedbackStats();
	const recentFeedback = getRecentFeedback(5);

	let summary = `# CodeMonkey Beta Feedback Summary\n\n`;
	summary += `Generated: ${new Date().toISOString()}\n\n`;

	summary += `## Overview\n`;
	summary += `- Total Feedback: ${stats.totalFeedback}\n`;
	summary += `- Average Rating: ${stats.averageRating.toFixed(2)}/5 ⭐\n\n`;

	summary += `## Rating Distribution\n`;
	for (let i = 5; i >= 1; i--) {
		const count = stats.ratingDistribution[i] || 0;
		const percentage =
			stats.totalFeedback > 0
				? ((count / stats.totalFeedback) * 100).toFixed(1)
				: '0.0';
		summary += `- ${i}⭐: ${count} (${percentage}%)\n`;
	}

	summary += `\n## Category Breakdown\n`;
	for (const [category, count] of Object.entries(stats.categoryBreakdown).sort(
		([, a], [, b]) => b - a,
	)) {
		const percentage = ((count / stats.totalFeedback) * 100).toFixed(1);
		summary += `- ${category}: ${count} (${percentage}%)\n`;
	}

	summary += `\n## Recent Feedback\n`;
	for (const [index, entry] of recentFeedback.entries()) {
		summary += `\n### ${index + 1}. ${entry.category} - ${entry.rating}⭐\n`;
		summary += `**Date:** ${new Date(entry.timestamp).toLocaleDateString()}\n`;
		summary += `**Message:** ${entry.message}\n`;
		if (entry.email) {
			summary += `**Contact:** ${entry.email}\n`;
		}

		summary += `**Version:** ${entry.version} (${entry.platform})\n`;
	}

	return summary;
}

// Clear all feedback (admin function)
export function clearAllFeedback(): void {
	if (fs.existsSync(FEEDBACK_FILE)) {
		fs.unlinkSync(FEEDBACK_FILE);
	}
}

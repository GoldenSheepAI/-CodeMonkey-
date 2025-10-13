import {beforeAll, afterAll} from 'vitest';

// Global test setup
beforeAll(() => {
	// Set up test environment variables
	process.env.NODE_ENV = 'test';
	process.env.TZ = 'UTC';
});

afterAll(() => {
	// Cleanup after all tests
});

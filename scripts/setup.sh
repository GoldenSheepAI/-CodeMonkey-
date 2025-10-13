#!/bin/bash

# CodeMonkey Setup Script
# Execute this script to migrate from Nanocoder to CodeMonkey structure

set -e  # Exit on error

echo "🐒 CodeMonkey Setup Script"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check for pnpm
echo "📦 Step 1: Checking for pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm not found. Installing globally...${NC}"
    npm install -g pnpm
    echo -e "${GREEN}✓ pnpm installed${NC}"
else
    echo -e "${GREEN}✓ pnpm already installed ($(pnpm --version))${NC}"
fi
echo ""

# Step 2: Clean old dependencies
echo "🧹 Step 2: Cleaning old dependencies..."
if [ -d "node_modules" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "Removing package-lock.json..."
    rm package-lock.json
fi
if [ -f "yarn.lock" ]; then
    echo "Removing yarn.lock..."
    rm yarn.lock
fi
echo -e "${GREEN}✓ Cleaned old dependencies${NC}"
echo ""

# Step 3: Backup existing configuration files
echo "💾 Step 3: Backing up existing configs..."
mkdir -p .backup
if [ -f "package.json" ]; then
    cp package.json .backup/package.json.backup
    echo "Backed up package.json"
fi
if [ -f "tsconfig.json" ]; then
    cp tsconfig.json .backup/tsconfig.json.backup
    echo "Backed up tsconfig.json"
fi
echo -e "${GREEN}✓ Backups created in .backup/ directory${NC}"
echo ""

# Step 4: Create new directory structure
echo "📁 Step 4: Creating new directory structure..."
mkdir -p tests/{unit,integration,e2e,fixtures,helpers}
mkdir -p tests/unit/integrations/{toknxr,noleakai,corect}
mkdir -p tests/unit/{commands,utils,system}
mkdir -p docs/{architecture,api,guides,development,integrations}
mkdir -p scripts
mkdir -p examples/configs
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p source/integrations/{toknxr,noleakai,corect}
echo -e "${GREEN}✓ Directory structure created${NC}"
echo ""

# Step 5: Create configuration files
echo "⚙️  Step 5: Creating configuration files..."

# Note: The actual config files should be created separately
# This script will just notify the user

echo -e "${YELLOW}Configuration files to create:${NC}"
echo "  - package.json (replace existing)"
echo "  - tsconfig.json (replace existing)"
echo "  - tsup.config.ts (new)"
echo "  - vitest.config.ts (new)"
echo "  - .eslintrc.js (new)"
echo "  - .prettierrc.js (new)"
echo "  - .editorconfig (new)"
echo ""
echo -e "${YELLOW}Please create these files using the artifacts provided${NC}"
echo ""

# Step 6: Initialize git hooks
echo "🪝 Step 6: Setting up git hooks..."
if [ -d ".git" ]; then
    if [ ! -d ".husky" ]; then
        echo "Initializing husky..."
        # Will be done after pnpm install
        echo "Husky will be initialized after dependencies are installed"
    fi
    echo -e "${GREEN}✓ Git hooks ready${NC}"
else
    echo -e "${YELLOW}⚠ Not a git repository. Skipping git hooks setup${NC}"
fi
echo ""

# Step 7: Create initial integration files
echo "🔌 Step 7: Creating integration stubs..."

# ToknXR integration stub
cat > source/integrations/toknxr/index.ts << 'EOF'
/**
 * ToknXR Integration - Cost Tracking & Analytics
 * Phase 1: MVP Implementation
 */

export { TokenCounter } from './token-counter';
export { CostCalculator } from './cost-calculator';
export { UsageDatabase } from './usage-db';
export { Analytics } from './analytics';

export type {
  TokenUsage,
  CostEstimate,
  UsageRecord,
  AnalyticsSummary,
} from './types';
EOF

cat > source/integrations/toknxr/types.ts << 'EOF'
/**
 * ToknXR Type Definitions
 */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface CostEstimate {
  estimatedTokens: number;
  estimatedCost: number;
  provider: string;
  model: string;
}

export interface UsageRecord {
  id: string;
  timestamp: number;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  command: string;
  success: boolean;
}

export interface AnalyticsSummary {
  totalCost: number;
  totalTokens: number;
  requestCount: number;
  averageCostPerRequest: number;
  byProvider: Record<string, {
    cost: number;
    tokens: number;
    requests: number;
  }>;
}
EOF

# NoLeakAI integration stub
cat > source/integrations/noleakai/index.ts << 'EOF'
/**
 * NoLeakAI Integration - Security Scanning
 * Phase 1: MVP Implementation
 */

export { SecretScanner } from './scanner';
export { SecretPatterns } from './patterns';
export { OutputRedactor } from './redactor';

export type {
  SecretDetection,
  ScanResult,
  SecurityPolicy,
} from './types';
EOF

cat > source/integrations/noleakai/types.ts << 'EOF'
/**
 * NoLeakAI Type Definitions
 */

export interface SecretDetection {
  type: string;
  value: string;
  line: number;
  column: number;
  file: string;
  confidence: 'high' | 'medium' | 'low';
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ScanResult {
  filesScanned: number;
  detectionsFound: SecretDetection[];
  scanDuration: number;
  timestamp: number;
}

export interface SecurityPolicy {
  enabledPatterns: string[];
  minimumConfidence: 'high' | 'medium' | 'low';
  blockOnDetection: boolean;
  allowSuppressions: boolean;
}
EOF

# Corect AI integration stub (Phase 3)
cat > source/integrations/corect/index.ts << 'EOF'
/**
 * Corect AI Integration - Automated Debugging
 * Phase 3: Future Implementation
 */

export { ErrorDetector } from './error-detector';
export { FixGenerator } from './fix-generator';

export type {
  ErrorAnalysis,
  FixSuggestion,
} from './types';
EOF

cat > source/integrations/corect/types.ts << 'EOF'
/**
 * Corect AI Type Definitions
 */

export interface ErrorAnalysis {
  errorType: string;
  errorMessage: string;
  stackTrace: string[];
  rootCause: string;
  confidence: number;
}

export interface FixSuggestion {
  description: string;
  code: string;
  confidence: number;
  reasoning: string;
}
EOF

echo -e "${GREEN}✓ Integration stubs created${NC}"
echo ""

# Step 8: Create test setup file
echo "🧪 Step 8: Creating test setup..."

cat > tests/setup.ts << 'EOF'
/**
 * Vitest Global Setup
 */

import { beforeEach, afterEach, vi } from 'vitest';

// Mock environment variables
beforeEach(() => {
  process.env.NODE_ENV = 'test';
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  // Add global test utilities here
};
EOF

echo -e "${GREEN}✓ Test setup created${NC}"
echo ""

# Step 9: Create sample test
echo "📝 Step 9: Creating sample test..."

mkdir -p tests/unit/integrations/toknxr

cat > tests/unit/integrations/toknxr/token-counter.test.ts << 'EOF'
/**
 * TokenCounter Unit Tests
 */

import { describe, it, expect } from 'vitest';

describe('TokenCounter', () => {
  it('should be implemented', () => {
    // TODO: Implement TokenCounter tests
    expect(true).toBe(true);
  });
});
EOF

echo -e "${GREEN}✓ Sample test created${NC}"
echo ""

# Step 10: Create GitHub workflow
echo "🔄 Step 10: Creating GitHub Actions workflow..."

cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
EOF

echo -e "${GREEN}✓ CI workflow created${NC}"
echo ""

# Step 11: Update .gitignore
echo "🚫 Step 11: Updating .gitignore..."

cat >> .gitignore << 'EOF'

# CodeMonkey specific
.backup/
*.log
.env.local
coverage/
dist/

# Test artifacts
tests/**/__snapshots__/

# OS files
.DS_Store
Thumbs.db

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*~
EOF

echo -e "${GREEN}✓ .gitignore updated${NC}"
echo ""

# Step 12: Final instructions
echo ""
echo "============================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Replace package.json with the provided configuration"
echo "2. Create all configuration files from artifacts:"
echo "   - tsconfig.json"
echo "   - tsup.config.ts"
echo "   - vitest.config.ts"
echo "   - .eslintrc.js"
echo "   - .prettierrc.js"
echo "   - .editorconfig"
echo ""
echo "3. Install dependencies:"
echo "   ${YELLOW}pnpm install${NC}"
echo ""
echo "4. Initialize git hooks:"
echo "   ${YELLOW}pnpm prepare${NC}"
echo ""
echo "5. Run development server:"
echo "   ${YELLOW}pnpm dev${NC}"
echo ""
echo "6. Run tests:"
echo "   ${YELLOW}pnpm test${NC}"
echo ""
echo "7. Build for production:"
echo "   ${YELLOW}pnpm build${NC}"
echo ""
echo "🐒 Happy coding with CodeMonkey!"
echo ""

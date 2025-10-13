# CodeMonkey Migration Guide

Complete step-by-step instructions to migrate from the Nanocoder fork to the CodeMonkey production structure.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Git repository initialized
- ✅ Terminal access

## Phase 1: Initial Setup (30 minutes)

### Step 1: Run the Setup Script

```bash
# Make the setup script executable
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

This script will:

- ✅ Install pnpm globally
- ✅ Clean old dependencies
- ✅ Backup existing configs
- ✅ Create directory structure
- ✅ Generate integration stubs
- ✅ Set up CI/CD workflows

### Step 2: Replace Configuration Files

Replace your existing files with the provided configurations:

#### 2.1 Replace package.json

```bash
# Backup current package.json (already done by setup script)
# The new package.json includes:
# - Updated dependencies
# - New build scripts
# - Testing configuration
```

#### 2.2 Update tsconfig.json

```bash
# Verify tsconfig.json includes:
# - ES2020 target
# - Node16 module resolution
# - Path aliases (@/* mappings)
```

#### 2.3 Create tsup.config.ts

```bash
# Build configuration for production bundles
# Already exists if you've pulled latest
```

#### 2.4 Create vitest.config.ts

```bash
# Test configuration with coverage
# Already exists if you've pulled latest
```

#### 2.5 Verify .eslintrc.js

```bash
# ESLint configuration for code quality
# Already exists if you've pulled latest
```

#### 2.6 Verify .prettierrc.js

```bash
# Prettier configuration for code formatting
# Already exists if you've pulled latest
```

#### 2.7 Verify .editorconfig

```bash
# Editor configuration for consistency
# Already exists if you've pulled latest
```

### Step 3: Install Dependencies

```bash
# Install all dependencies with pnpm
pnpm install

# This will create/update pnpm-lock.yaml
# Estimated time: 2-3 minutes
```

### Step 4: Initialize Git Hooks (Optional)

```bash
# Initialize Husky (if configured)
pnpm prepare

# This sets up pre-commit and pre-push hooks
```

### Step 5: Verify Setup

```bash
# Run type checking
pnpm run build

# Try starting the application
pnpm start

# Check for errors
pnpm test
```

## Phase 2: Integration Setup (Day 1-2)

### ToknXR Integration (Token Tracking)

The ToknXR integration is now production-ready with tiktoken support.

**Files:**
- ✅ `source/integrations/toknxr/index.ts` - Main exports
- ✅ `source/integrations/toknxr/types.ts` - Type definitions
- ✅ `source/integrations/toknxr/token-counter.ts` - Token counting with tiktoken
- ✅ `source/integrations/toknxr/cost-calculator.ts` - Cost calculation
- ✅ `source/integrations/toknxr/usage-db.ts` - Usage tracking database
- ✅ `source/integrations/toknxr/analytics.ts` - Analytics engine

**Integration:**

```typescript
import { TokenCounter } from '@/integrations/toknxr';

const counter = new TokenCounter();

// Count tokens for a message
const tokens = await counter.countTokens(text, 'gpt-4');

// Count tokens for chat messages
const messageTokens = await counter.countMessageTokens(messages, 'gpt-4');

// Parse usage from API response
const usage = counter.parseUsageFromResponse(apiResponse);

// Clean up when done
counter.dispose();
```

### NoLeakAI Integration (Security Scanning)

Security scanning with pattern detection and redaction.

**Files:**
- ✅ `source/integrations/noleakai/index.ts` - Main exports
- ✅ `source/integrations/noleakai/scanner.ts` - File/directory scanning
- ✅ `source/integrations/noleakai/patterns.ts` - Security patterns (API keys, credentials)
- ✅ `source/integrations/noleakai/redactor.ts` - Sensitive data redaction

**Integration:**

```typescript
import { SecurityScanner, Redactor, SECURITY_PATTERNS } from '@/integrations/noleakai';

const scanner = new SecurityScanner();
const redactor = new Redactor();

// Scan a file
const results = await scanner.scanFile(filePath, content);

// Redact sensitive data
const { redacted, redactedCount } = redactor.redact(text);
```

### CoRect Integration (Automated Debugging - Phase 3)

Automated error detection and fix generation (future implementation).

**Files:**
- ✅ `source/integrations/corect/index.ts` - Main exports
- ✅ `source/integrations/corect/error-detector.ts` - Error categorization
- ✅ `source/integrations/corect/fix-generator.ts` - Fix suggestions

**Structure ready for Phase 3 implementation.**

## Phase 3: Update Import Paths

### Before (Relative Imports)

```typescript
import { something } from '../../../system/file-system';
import { Config } from '../../config/index';
```

### After (Absolute Imports with Path Aliases)

```typescript
import { something } from '@/system/file-system';
import { Config } from '@/config';
```

**Note:** If path aliases are configured in tsconfig.json, update imports accordingly. Otherwise, continue using relative imports with `.js` extensions.

## Phase 4: Testing

### Run All Tests

```bash
# Run test suite
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test path/to/test.test.ts
```

### Create Integration Tests

Create tests for new integrations:

```typescript
// tests/unit/integrations/toknxr/token-counter.test.ts
import { describe, it, expect } from 'vitest';
import { TokenCounter } from '@/integrations/toknxr';

describe('TokenCounter', () => {
  it('should count tokens accurately', async () => {
    const counter = new TokenCounter();
    const tokens = await counter.countTokens('Hello world', 'gpt-4');
    expect(tokens).toBeGreaterThan(0);
    counter.dispose();
  });
});
```

## Phase 5: Documentation

### Update README.md

Add sections for:

- New integrations (ToknXR, NoLeakAI, CoRect)
- Installation instructions with pnpm
- Configuration examples
- API documentation links

### Create Integration Docs

Document each integration:

- `docs/integrations/toknxr.md` - Token tracking setup
- `docs/integrations/noleakai.md` - Security scanning setup
- `docs/integrations/corect.md` - Debugging setup (Phase 3)

## Phase 6: Deployment

### Build for Production

```bash
# Clean build
rm -rf dist/

# Build project
pnpm build

# Test the build
node dist/cli.js --version
```

### Release Checklist

- [ ] All tests passing
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tags created

### Create Release

```bash
# Use the release script
./scripts/release.ts patch

# Or manually
git add .
git commit -m "chore: release vX.X.X"
git tag -a vX.X.X -m "Release vX.X.X"
git push origin main --tags
```

## Troubleshooting

### "Cannot find module 'tiktoken'"

**Solution:**
```bash
pnpm install
```

### "pnpm: command not found"

**Solution:**
```bash
npm install -g pnpm
```

### Import path errors

**Solution:** Ensure all imports use `.js` extensions for ES modules:
```typescript
import { something } from './file.js'; // ✅ Correct
import { something } from './file';    // ❌ Wrong
```

### TypeScript errors after migration

**Solution:**
```bash
# Clean and rebuild
rm -rf dist/ node_modules/
pnpm install
pnpm build
```

### Tests failing

**Solution:**
```bash
# Update test setup
# Ensure vitest.config.ts is properly configured
# Check test file paths and imports
```

## Rollback Plan

If migration fails, restore from backups:

```bash
# Restore package.json
cp .backup/package.json.backup package.json

# Restore tsconfig.json
cp .backup/tsconfig.json.backup tsconfig.json

# Reinstall old dependencies
rm -rf node_modules pnpm-lock.yaml
npm install
```

## Post-Migration Checklist

- [ ] All dependencies installed
- [ ] Build succeeds without errors
- [ ] Tests pass
- [ ] Linting passes
- [ ] Application runs correctly
- [ ] All integrations functional
- [ ] Documentation updated
- [ ] Git history clean
- [ ] Team notified of changes

## Support

For issues or questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review [documentation](./docs/)
3. Check [GitHub Issues](https://github.com/Radix-Obsidian/-CodeMonkey-/issues)
4. Contact the development team

## Timeline Estimate

- **Phase 1 (Setup)**: 30 minutes
- **Phase 2 (Integrations)**: 1-2 days
- **Phase 3 (Import Updates)**: 2-4 hours
- **Phase 4 (Testing)**: 1 day
- **Phase 5 (Documentation)**: 4-8 hours
- **Phase 6 (Deployment)**: 2-4 hours

**Total Estimated Time**: 3-5 days for complete migration

## Success Criteria

Migration is complete when:

✅ All scripts run without errors  
✅ All tests pass  
✅ Application builds successfully  
✅ All integrations are functional  
✅ Documentation is up to date  
✅ Team is trained on new structure  

## Next Steps After Migration

1. **Monitor Performance**: Track token usage with ToknXR
2. **Enable Security Scanning**: Configure NoLeakAI patterns
3. **Plan Phase 3**: Prepare for CoRect integration
4. **Team Training**: Schedule sessions on new features
5. **Iterate**: Gather feedback and improve

---

**Version**: 1.0.0  
**Last Updated**: October 13, 2025  
**Maintained By**: CodeMonkey Development Team

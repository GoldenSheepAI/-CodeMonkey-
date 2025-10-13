# CodeMonkey Scripts

Automation scripts for managing the CodeMonkey project.

## Available Scripts

### 🚀 setup.sh

**Comprehensive setup and migration script for CodeMonkey**

This script automates the entire setup process from Nanocoder to CodeMonkey structure.

**Features:**
- ✅ Checks and installs pnpm if needed
- ✅ Cleans old dependencies (npm/yarn)
- ✅ Backs up existing configuration files
- ✅ Creates complete directory structure
- ✅ Generates TypeScript type definitions for all integrations
- ✅ Sets up test files and structure
- ✅ Creates GitHub Actions CI/CD workflows
- ✅ Updates .gitignore with CodeMonkey-specific entries
- ✅ Provides step-by-step progress with colored output

**Usage:**
```bash
cd /path/to/CodeMonkey
./scripts/setup.sh
```

**What it creates:**
- `source/integrations/*/types.ts` - Type definitions for each integration
- `tests/setup.ts` - Vitest global setup
- `tests/unit/integrations/toknxr/token-counter.test.ts` - Sample test
- `.github/workflows/ci.yml` - Comprehensive CI pipeline
- `.backup/` - Backup directory with old configs

**Note:** This script will overwrite some integration index files to ensure they match the latest type definitions. Always review changes before committing.

---

### 📦 release.ts

**Automated release management**

Handles version bumping, changelog generation, and release preparation.

**Features:**
- Version bumping (major/minor/patch)
- Changelog updates
- Git tagging
- Pre-release validation (tests, build)

**Usage:**
```bash
./scripts/release.ts [patch|minor|major]
```

**Example:**
```bash
# Bump patch version (1.0.0 -> 1.0.1)
./scripts/release.ts patch

# Bump minor version (1.0.0 -> 1.1.0)
./scripts/release.ts minor

# Bump major version (1.0.0 -> 2.0.0)
./scripts/release.ts major
```

---

### 🔄 migrate.ts

**Data migration management**

Handles data migrations and updates between CodeMonkey versions.

**Features:**
- Track migration state
- Run pending migrations
- Rollback support
- Migration status reporting

**Usage:**
```bash
# Run all pending migrations
./scripts/migrate.ts up

# Check migration status
./scripts/migrate.ts status

# Run migrations up to specific version
./scripts/migrate.ts up 2.0.0
```

---

## Development Workflow

### Initial Setup
```bash
# 1. Run setup script
./scripts/setup.sh

# 2. Install dependencies
pnpm install

# 3. Initialize git hooks
pnpm prepare

# 4. Run development server
pnpm dev
```

### Before Releasing
```bash
# 1. Run tests
pnpm test

# 2. Build project
pnpm build

# 3. Run release script
./scripts/release.ts patch

# 4. Push changes
git push origin main --tags
```

### After Upgrading
```bash
# Check for pending migrations
./scripts/migrate.ts status

# Run migrations if needed
./scripts/migrate.ts up
```

## Script Permissions

All scripts should be executable. If you encounter permission errors, run:

```bash
chmod +x scripts/*.sh scripts/*.ts
```

## Troubleshooting

### "command not found: pnpm"
Run the setup script - it will install pnpm automatically:
```bash
./scripts/setup.sh
```

### "permission denied"
Make scripts executable:
```bash
chmod +x scripts/setup.sh
```

### "node_modules conflicts"
The setup script cleans old dependencies automatically. If issues persist:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Contributing

When adding new scripts:
1. Make them executable: `chmod +x scripts/your-script.sh`
2. Add usage documentation to this README
3. Include error handling and user feedback
4. Use colored output for better UX
5. Test on clean installations

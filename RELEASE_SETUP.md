# 🚀 Release Setup Guide

This guide explains how to set up automated releases for CodeMonkey.

## GitHub Secrets Required

The release workflow requires one secret to be configured:

### `NPM_TOKEN`

This token is used to publish CodeMonkey to npm automatically.

#### How to Get Your NPM Token

1. **Login to npm:**
   ```bash
   npm login
   ```

2. **Generate an access token:**
   - Go to: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token"
   - Select "Automation" (for CI/CD)
   - Copy the token (starts with `npm_...`)

3. **Add to GitHub:**
   - Go to your repository: https://github.com/YOUR_USERNAME/CodeMonkey
   - Navigate to: **Settings** → **Secrets and variables** → **Actions**
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

## How to Create a Release

Once `NPM_TOKEN` is configured, releases are automatic:

### 1. Update Version

```bash
# Update version in package.json
npm version patch  # or minor, or major
# This creates a git tag like v1.13.5
```

### 2. Push Tag

```bash
git push origin main --tags
```

### 3. Automatic Release

The GitHub Action will automatically:
1. ✅ Run tests
2. ✅ Build the project
3. ✅ Create a GitHub release
4. ✅ Publish to npm
5. ✅ Generate changelog
6. ✅ Upload release assets

## Release Workflow Details

The workflow (`.github/workflows/release.yml`) triggers on:
- Any tag starting with `v*` (e.g., `v1.13.5`)

### What Gets Published

- **npm package:** `@radix-obsidian/codemonkey`
- **GitHub release:** With changelog and assets
- **Release assets:** Built CLI binary

## Versioning

CodeMonkey follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.x.x) - Breaking changes
- **MINOR** (x.1.x) - New features (backward compatible)
- **PATCH** (x.x.1) - Bug fixes

### Quick Commands

```bash
# Patch release (bug fixes)
npm version patch && git push origin main --tags

# Minor release (new features)
npm version minor && git push origin main --tags

# Major release (breaking changes)
npm version major && git push origin main --tags
```

## Troubleshooting

### "Context access might be invalid: NPM_TOKEN"

**This is a warning, not an error.** It just means the IDE can't verify the secret exists in GitHub. As long as you've added `NPM_TOKEN` to GitHub secrets, the workflow will work.

### Release Failed

Check the Actions tab: https://github.com/YOUR_USERNAME/CodeMonkey/actions

Common issues:
- `NPM_TOKEN` not set or expired
- Version already published to npm
- Tests failing
- Build errors

### Re-running a Failed Release

1. Fix the issue
2. Delete the tag locally and remotely:
   ```bash
   git tag -d v1.13.5
   git push origin :refs/tags/v1.13.5
   ```
3. Create the tag again:
   ```bash
   npm version 1.13.5
   git push origin main --tags
   ```

## Manual Release (Fallback)

If automated release fails, you can publish manually:

```bash
# Build
pnpm run build

# Publish
pnpm publish --access public
```

## Security Notes

⚠️ **Important:**
- Never commit `NPM_TOKEN` to the repository
- Use "Automation" tokens for CI/CD (not "Publish" tokens)
- Rotate tokens periodically
- Revoke tokens if compromised

## Next Steps

1. ✅ Add `NPM_TOKEN` to GitHub secrets
2. ✅ Test with a patch release
3. ✅ Monitor the Actions tab
4. ✅ Verify package on npm

---

**Need help?** Check the [GitHub Actions documentation](https://docs.github.com/en/actions) or [npm token docs](https://docs.npmjs.com/creating-and-viewing-access-tokens).

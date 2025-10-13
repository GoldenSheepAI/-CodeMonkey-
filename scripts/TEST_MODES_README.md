# CodeMonkey Modes Testing Script

Automated testing suite for Budget Mode and Secure Mode with local Ollama models.

## Quick Start

```bash
# Run the test suite
pnpm run test:modes
```

## What It Tests

### 1. **Ollama Models** 🦙
- Detects all installed Ollama models
- Tests connectivity to Ollama server
- Verifies models can respond to prompts
- Shows model sizes and details

### 2. **Budget Mode** 🎯
- Enables Budget Mode in preferences
- Configures ToknXR proxy URL
- Verifies provider configuration
- Tests proxy routing setup

### 3. **Secure Mode** 🔒
- Tests security pattern detection:
  - API keys (OpenAI, OpenRouter, Anthropic, etc.)
  - Passwords
  - AWS credentials
  - Email addresses
- Enables Secure Mode with auto-redact
- Verifies clean text passes through

### 4. **Combined Modes** 🔄
- Enables both modes simultaneously
- Verifies no conflicts
- Tests integration

## Sample Output

```
🐒 CodeMonkey Automated Testing Suite

════════════════════════════════════════════════════════════
📦 Backing up configurations...
✓ Configs backed up

🦙 Testing Ollama Models
────────────────────────────────────────────────────────────
Found 2 Ollama models:
  • llama3.2:3b (2.00 GB)
  • qwen2.5-coder:7b (4.70 GB)

  Testing llama3.2:3b...
  ✓ llama3.2:3b responded: Hello from CodeMonkey! Great to help.

  Testing qwen2.5-coder:7b...
  ✓ qwen2.5-coder:7b responded: Hello from CodeMonkey! Ready to code.

🎯 Testing Budget Mode
────────────────────────────────────────────────────────────
✓ Budget Mode enabled in preferences
✓ ToknXR proxy URL configured
✓ Providers configured for proxy routing

🔒 Testing Secure Mode
────────────────────────────────────────────────────────────
  ✓ API Key: Detected
  ✓ Password: Detected
  ✓ Clean Text: Clean
  ✓ AWS Key: Detected

✓ Pattern detection: 4/4 passed
✓ Secure Mode enabled in preferences

🔄 Testing Both Modes Together
────────────────────────────────────────────────────────────
✓ Budget Mode: ENABLED
✓ Secure Mode: ENABLED
✓ Both modes configured to work together

════════════════════════════════════════════════════════════
📊 Test Results Summary
════════════════════════════════════════════════════════════
✅ Ollama Models (2.34s)
   Found and tested 2 models
✅ Budget Mode (0.12s)
   Budget Mode configuration successful
✅ Secure Mode (0.08s)
   4/4 security patterns detected correctly
✅ Combined Modes (0.05s)
   Both modes enabled without conflicts

════════════════════════════════════════════════════════════
Final Score: 4/4 passed (100.0%)
🎉 All tests passed!
════════════════════════════════════════════════════════════
```

## Prerequisites

1. **Ollama installed and running**
   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags
   ```

2. **At least one Ollama model installed**
   ```bash
   # List your models
   ollama list
   
   # Install a model if needed
   ollama pull llama3.2
   ```

3. **CodeMonkey built**
   ```bash
   pnpm run build
   ```

## What Gets Tested

### Configuration Files
- `agents.config.json` - Provider configuration
- `~/.nanocoder-preferences.json` - User preferences

### Features
- ✅ Ollama connectivity
- ✅ Model availability
- ✅ Budget Mode configuration
- ✅ Secure Mode pattern detection
- ✅ Combined mode compatibility

### Safety
- **Backs up** all configs before testing
- **Restores** original configs after testing
- **Non-destructive** - doesn't modify your actual setup permanently

## Troubleshooting

### "Ollama not running"
```bash
# Start Ollama
ollama serve
```

### "No Ollama models found"
```bash
# Install a model
ollama pull llama3.2
```

### "Config file not found"
```bash
# Create config from example
cp agents.config.example.json agents.config.json
```

## Advanced Usage

### Test Specific Features

Edit `scripts/test-modes.ts` to customize:
- Which models to test
- Security patterns to check
- Budget limits
- Test scenarios

### Add Custom Tests

```typescript
private async testCustomFeature() {
  console.log('🧪 Testing Custom Feature');
  const startTime = Date.now();
  
  try {
    // Your test logic here
    
    this.addResult(
      'Custom Feature',
      true,
      'Test passed',
      Date.now() - startTime
    );
  } catch (error) {
    this.addResult(
      'Custom Feature',
      false,
      `Failed: ${error.message}`,
      Date.now() - startTime
    );
  }
}
```

## Integration with CI/CD

```yaml
# .github/workflows/test.yml
- name: Test CodeMonkey Modes
  run: pnpm run test:modes
```

## Next Steps

After tests pass:
1. Start CodeMonkey: `pnpm start`
2. Try `/budget` command
3. Try `/secure` command
4. Send test messages with your Ollama models

---

**Happy Testing!** 🐒✨

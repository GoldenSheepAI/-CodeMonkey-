# 🎯 Budget Mode - ToknXR Integration

## Overview

Budget Mode integrates CodeMonkey with ToknXR for real-time cost tracking, token monitoring, and AI usage analytics.

## Features

- ✅ **Real-time Cost Tracking** - See costs as you use AI
- ✅ **Token Monitoring** - Track input/output tokens
- ✅ **Budget Limits** - Set spending limits and get alerts
- ✅ **Analytics Dashboard** - View detailed usage analytics
- ✅ **Multi-Provider Support** - Works with all AI providers

## Quick Start

### 1. Enable Budget Mode

```bash
# Inside CodeMonkey CLI
/budget
# Select "Enable Budget Mode"
```

### 2. Start ToknXR Proxy

```bash
# In a separate terminal
cd node_modules/@goldensheepai/toknxr-cli
npx toknxr start
```

### 3. Use CodeMonkey Normally

All AI requests will automatically route through ToknXR for tracking!

## How It Works

### Without Budget Mode (Direct)
```
CodeMonkey → AI Provider (OpenAI/Anthropic/Ollama)
```

### With Budget Mode (via ToknXR)
```
CodeMonkey → ToknXR Proxy → AI Provider
                ↓
         Analytics & Tracking
```

## Configuration

Budget Mode settings are stored in `~/.nanocoder-preferences.json`:

```json
{
  "budgetMode": {
    "enabled": true,
    "toknxrProxyUrl": "http://localhost:8788",
    "showCosts": true,
    "budgetLimit": 10.0,
    "currentSpend": 0
  }
}
```

## Commands

- `/budget` - Toggle Budget Mode and configure settings
- View dashboard: http://localhost:8788/dashboard

## Testing Checklist

### Test Case 1: Enable Budget Mode
- [ ] Run `/budget` command
- [ ] Select "Enable Budget Mode"
- [ ] Verify success message shows
- [ ] Check preferences file updated

### Test Case 2: Disable Budget Mode
- [ ] Run `/budget` command
- [ ] Select "Disable Budget Mode"
- [ ] Verify success message shows
- [ ] Check preferences file updated

### Test Case 3: ToknXR Integration (Coming in Phase 2)
- [ ] Start ToknXR proxy
- [ ] Enable Budget Mode
- [ ] Send AI request
- [ ] Verify request routes through proxy
- [ ] Check ToknXR dashboard shows usage

### Test Case 4: Cost Display (Coming in Phase 2)
- [ ] Enable Budget Mode
- [ ] Send multiple AI requests
- [ ] Verify costs displayed in status bar
- [ ] Check running total updates

### Test Case 5: Budget Alerts (Coming in Phase 2)
- [ ] Set budget limit to $1
- [ ] Use AI until limit approached
- [ ] Verify warning appears
- [ ] Verify requests blocked at limit

## Phase 2 Implementation Plan

### 1. Proxy Routing Logic
- Modify AI client factory to use ToknXR URL when Budget Mode enabled
- Add request/response interceptors for cost tracking
- Handle ToknXR API responses

### 2. Cost Display
- Add cost/token stats to status bar component
- Show running totals in real-time
- Display per-request costs

### 3. Budget Alerts
- Monitor spending against budget limit
- Show warnings at 75%, 90%, 100%
- Option to auto-switch to local Ollama when limit reached

### 4. Analytics Integration
- Fetch stats from ToknXR API
- Display in CodeMonkey UI
- Export usage reports

## Known Limitations

- ToknXR must be running separately (not auto-started)
- Requires Node.js 18+ for ToknXR
- Dashboard is external (not embedded in CodeMonkey)

## Troubleshooting

### "Cannot connect to ToknXR proxy"
**Solution:** Start ToknXR proxy first:
```bash
cd node_modules/@goldensheepai/toknxr-cli
npx toknxr start
```

### "Budget Mode not working"
**Solution:** Check preferences file:
```bash
cat ~/.nanocoder-preferences.json
```

### "Costs not showing"
**Solution:** Phase 2 feature - coming soon!

## Next Steps

1. ✅ Phase 1: Budget Mode toggle (COMPLETE)
2. ⏳ Phase 2: Proxy routing & cost display
3. ⏳ Phase 3: Budget alerts & analytics
4. ⏳ Phase 4: Secure Mode (NoLeakAI integration)

---

**Status:** Phase 1 Complete ✅  
**Last Updated:** October 13, 2025  
**Version:** 1.13.4

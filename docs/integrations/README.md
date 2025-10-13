# Integration Documentation

This directory contains documentation for SheepStack integrations.

## Available Integrations

### Toknxr - Cost Tracking & Analytics
**Status**: ✅ Active

Track token usage, calculate costs, and analyze API consumption patterns.

- [Setup Guide](./toknxr.md)
- [API Reference](../api/toknxr.md)
- Source: `source/integrations/toknxr/`

**Features**:
- Real-time token counting
- Cost calculation per request
- Usage analytics and reports
- Budget alerts
- Historical data storage

### NoLeakAI - Security Scanning
**Status**: ✅ Active

Detect and redact sensitive information in code and logs.

- [Setup Guide](./noleakai.md)
- [API Reference](../api/noleakai.md)
- Source: `source/integrations/noleakai/`

**Features**:
- Automatic secret detection
- API key and credential scanning
- Log redaction
- Security pattern matching
- Severity-based alerts

### CoRect - Automated Debugging
**Status**: 🚧 Phase 3

Automated error detection and fix generation.

- [Setup Guide](./corect.md)
- [API Reference](../api/corect.md)
- Source: `source/integrations/corect/`

**Features** (Planned):
- Error categorization
- Automated fix suggestions
- Context-aware debugging
- Confidence scoring
- Interactive fix application

## Integration Architecture

All integrations follow a consistent pattern:

```typescript
interface Integration {
  name: string;
  enabled: boolean;
  configure(options: Record<string, any>): void;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}
```

## Adding New Integrations

See [Contributing Guide](../../CONTRIBUTING.md#adding-integrations) for details on adding new integrations.

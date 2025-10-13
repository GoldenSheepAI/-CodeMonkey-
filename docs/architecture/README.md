# Architecture Documentation

This directory contains architectural documentation for CodeMonkey.

## Overview

CodeMonkey is built on top of Nanocoder with enhanced SheepStack integrations:

- **Toknxr**: Cost tracking and token usage analytics
- **NoLeakAI**: Security scanning and sensitive data detection
- **CoRect**: Automated debugging and error correction (Phase 3)

## Architecture Diagrams

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│           CodeMonkey CLI                │
├─────────────────────────────────────────┤
│  Ink UI Components                      │
├─────────────────────────────────────────┤
│  Command Parser │ Message Handler       │
├─────────────────────────────────────────┤
│  AI Agents (Anthropic, OpenAI, etc)     │
├─────────────────────────────────────────┤
│  SheepStack Integrations                │
│  ├── Toknxr (Usage Tracking)            │
│  ├── NoLeakAI (Security)                │
│  └── CoRect (Debugging)                 │
└─────────────────────────────────────────┘
```

## Key Components

- **CLI Layer**: User interface and command handling
- **Agent Layer**: LLM integration and orchestration
- **Tool Layer**: File operations, code execution, etc.
- **Integration Layer**: SheepStack services

## Design Principles

1. **Modularity**: Each integration is self-contained
2. **Extensibility**: Easy to add new integrations
3. **Performance**: Minimal overhead, fast response times
4. **Security**: Built-in security scanning and redaction

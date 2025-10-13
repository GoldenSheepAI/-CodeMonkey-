# Workflow Modes Technical Specification

**Version:** 1.0.0  
**Status:** Draft  
**Author:** CodeMonkey Team  
**Date:** 2025-10-13

## Overview

CodeMonkey introduces three distinct workflow modes to provide users with granular control over their interaction model: **Command Mode**, **Codegen Mode**, and **Cosmo Mode**.

## Goals

1. **Separation of Concerns**: Clearly separate utility commands from AI code generation
2. **Cost Control**: Allow users to use utilities without incurring AI costs
3. **Progressive Disclosure**: Enable beginners to learn one mode at a time
4. **Power User Experience**: Provide "Cosmo Mode" for advanced users who want full capabilities
5. **Type Safety**: Implement with full TypeScript type safety
6. **Persistence**: Remember user's mode preference across sessions
7. **Error Handling**: Graceful degradation and clear error messages

## Modes Definition

### 1. Command Mode
- **Purpose**: Utility-only mode with zero AI costs
- **Enabled**: All `/` commands
- **Disabled**: AI code generation via natural language
- **Use Case**: Cost-conscious users, command exploration, utility tasks

### 2. Codegen Mode
- **Purpose**: Pure AI assistant mode
- **Enabled**: AI code generation via natural language
- **Disabled**: Most `/` commands (except `/mode`, `/exit`, `/help`)
- **Use Case**: Focused coding sessions, AI-only interactions

### 3. Cosmo Mode 🌟
- **Purpose**: Full power mode combining commands and codegen
- **Enabled**: All `/` commands + AI code generation
- **Disabled**: Nothing
- **Use Case**: Power users who understand both interaction models
- **Default**: Yes (maintains backward compatibility)

## Technical Design

### Type Definitions

```typescript
/**
 * Workflow mode enumeration
 */
export enum WorkflowMode {
  COMMAND = 'command',
  CODEGEN = 'codegen',
  COSMO = 'cosmo'
}

/**
 * Mode configuration interface
 */
export interface ModeConfig {
  mode: WorkflowMode;
  allowCommands: boolean;
  allowCodegen: boolean;
  description: string;
  icon: string;
}

/**
 * Mode state interface
 */
export interface ModeState {
  currentMode: WorkflowMode;
  previousMode?: WorkflowMode;
  changedAt: Date;
}
```

### Mode Configuration Matrix

| Mode | Commands | Codegen | Icon | Description |
|------|----------|---------|------|-------------|
| `command` | ✅ | ❌ | 🔧 | Utility commands only, no AI costs |
| `codegen` | ⚠️ (limited) | ✅ | 🤖 | AI code generation only |
| `cosmo` | ✅ | ✅ | 🌟 | Full power mode (default) |

### Architecture

```
┌─────────────────────────────────────────┐
│         User Input Handler              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Mode Manager                     │
│  - getCurrentMode()                      │
│  - setMode(mode)                         │
│  - canExecuteCommand(cmd)                │
│  - canExecuteCodegen()                   │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  Command    │  │  Codegen    │
│  Handler    │  │  Handler    │
└─────────────┘  └─────────────┘
```

### File Structure

```
source/
├── modes/
│   ├── mode-manager.ts          # Core mode management logic
│   ├── mode-config.ts           # Mode configurations
│   └── mode-validator.ts        # Input validation per mode
├── commands/
│   └── mode-command.ts          # /mode command handler
├── types/
│   └── modes.d.ts               # Type definitions
└── app/
    └── message-handler.ts       # Updated to respect modes
```

## Implementation Details

### 1. Mode Manager (`source/modes/mode-manager.ts`)

**Responsibilities:**
- Maintain current mode state
- Validate mode transitions
- Check if operations are allowed in current mode
- Persist mode to user preferences

**Key Methods:**
```typescript
class ModeManager {
  private currentMode: WorkflowMode = WorkflowMode.COSMO;
  
  getCurrentMode(): WorkflowMode
  setMode(mode: WorkflowMode): void
  canExecuteCommand(command: string): boolean
  canExecuteCodegen(): boolean
  getModeConfig(): ModeConfig
  getModeDescription(): string
}
```

### 2. Mode Command (`source/commands/mode-command.ts`)

**Command Syntax:**
```bash
/mode                    # Show current mode
/mode command            # Switch to Command mode
/mode codegen            # Switch to Codegen mode
/mode cosmo              # Switch to Cosmo mode
```

**Validation:**
- Mode must be one of: `command`, `codegen`, `cosmo`
- Case-insensitive matching
- Clear error messages for invalid modes

### 3. Message Handler Updates

**Before Processing:**
```typescript
// Check if input is a command
if (input.startsWith('/')) {
  if (!modeManager.canExecuteCommand(command)) {
    showModeError('command', command);
    return;
  }
  // Execute command
}

// Check if codegen is allowed
if (!modeManager.canExecuteCodegen()) {
  showModeError('codegen');
  return;
}
// Execute codegen
```

### 4. Status Display Updates

Add mode indicator to `/status` output:
```
╭Status──────────────────────────────────────╮
│  CWD: /path/to/project                     │
│  Provider: Groq, Model: llama-3.3-70b      │
│  Mode: Cosmo 🌟 (Commands + Codegen)       │
│  Theme: Tokyo Night                        │
╰────────────────────────────────────────────╯
```

## User Experience

### Mode Switching Flow

```
User: /mode
System: Current mode: Cosmo 🌟 (Commands + Codegen)
        Available modes:
        • command - Utility commands only (no AI costs)
        • codegen - AI code generation only
        • cosmo   - Full power mode (default)
        
        Use: /mode <mode-name> to switch

User: /mode command
System: ✓ Switched to Command Mode 🔧
        AI code generation disabled. Commands available.
        Use /mode cosmo to re-enable full features.

User: write a hello world function
System: ⚠ Code generation is disabled in Command Mode.
        Switch to Codegen or Cosmo mode: /mode cosmo

User: /mode cosmo
System: ✓ Switched to Cosmo Mode 🌟
        Full power unlocked! Commands + Codegen enabled.
```

### Error Messages

**Command in Codegen Mode:**
```
⚠ Commands are limited in Codegen Mode.
  Available: /mode, /exit, /help
  Switch to Cosmo mode for full commands: /mode cosmo
```

**Codegen in Command Mode:**
```
⚠ Code generation is disabled in Command Mode.
  Switch to Codegen or Cosmo mode: /mode codegen
```

## Persistence

Mode preference saved to `~/.nanocoder-preferences.json`:

```json
{
  "workflowMode": "cosmo",
  "lastProvider": "Groq",
  "lastModel": "llama-3.3-70b-versatile"
}
```

## Testing Strategy

### Unit Tests
- Mode manager state transitions
- Mode validation logic
- Permission checks per mode
- Preference persistence

### Integration Tests
- Command execution in each mode
- Codegen execution in each mode
- Mode switching flow
- Error message display

### Test Cases

```typescript
describe('ModeManager', () => {
  it('should default to Cosmo mode', () => {
    expect(modeManager.getCurrentMode()).toBe(WorkflowMode.COSMO);
  });

  it('should allow commands in Command mode', () => {
    modeManager.setMode(WorkflowMode.COMMAND);
    expect(modeManager.canExecuteCommand('/help')).toBe(true);
  });

  it('should block codegen in Command mode', () => {
    modeManager.setMode(WorkflowMode.COMMAND);
    expect(modeManager.canExecuteCodegen()).toBe(false);
  });

  it('should allow both in Cosmo mode', () => {
    modeManager.setMode(WorkflowMode.COSMO);
    expect(modeManager.canExecuteCommand('/help')).toBe(true);
    expect(modeManager.canExecuteCodegen()).toBe(true);
  });
});
```

## Migration Strategy

### Backward Compatibility
- Default mode is `cosmo` (current behavior)
- Existing users see no change unless they switch modes
- No breaking changes to existing commands

### Rollout Plan
1. **Phase 1**: Implement mode system (v1.14.0)
2. **Phase 2**: Add mode indicator to UI
3. **Phase 3**: Update documentation
4. **Phase 4**: Announce feature in release notes

## Performance Considerations

- Mode checks are O(1) operations
- No performance impact on command/codegen execution
- Minimal memory footprint (single enum value)

## Security Considerations

- Mode state is local-only (not sent to AI providers)
- No new attack surface introduced
- Preference file follows existing security model

## Documentation Updates

### README.md
- Add "Workflow Modes" section
- Update "Getting Started" with mode examples
- Add mode switching examples

### Help Command
- Update `/help` to show current mode
- Add mode-specific command availability

## Success Metrics

1. **Adoption**: % of users who switch modes
2. **Cost Savings**: Reduced AI costs in Command mode
3. **User Satisfaction**: Feedback on mode clarity
4. **Error Rate**: Reduced confusion errors

## Future Enhancements

1. **Custom Modes**: Allow users to define custom mode configurations
2. **Mode Presets**: Save mode + provider + model combinations
3. **Auto-Switch**: Automatically suggest mode based on input pattern
4. **Mode History**: Track mode usage analytics

## Appendix

### Command Availability Matrix

| Command | Command Mode | Codegen Mode | Cosmo Mode |
|---------|--------------|--------------|------------|
| `/help` | ✅ | ✅ | ✅ |
| `/exit` | ✅ | ✅ | ✅ |
| `/mode` | ✅ | ✅ | ✅ |
| `/status` | ✅ | ❌ | ✅ |
| `/provider` | ✅ | ❌ | ✅ |
| `/model` | ✅ | ❌ | ✅ |
| `/mcp` | ✅ | ❌ | ✅ |
| `/budget` | ✅ | ❌ | ✅ |
| `/secure` | ✅ | ❌ | ✅ |
| `/restart` | ✅ | ✅ | ✅ |
| `/export` | ✅ | ❌ | ✅ |
| `/theme` | ✅ | ❌ | ✅ |
| Custom commands | ✅ | ❌ | ✅ |
| Natural language | ❌ | ✅ | ✅ |

---

**Approved By:** _Pending_  
**Implementation Start:** 2025-10-13  
**Target Release:** v1.14.0

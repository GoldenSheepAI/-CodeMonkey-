# 📹 Recording CodeMonkey Demos with VHS

Complete guide to recording terminal demos of CodeMonkey using VHS (Video Hotkey Script).

## Quick Start

```bash
# 1. Navigate to CodeMonkey directory
cd /Users/saintaugustine/Desktop/CodeMonkey/-CodeMonkey-

# 2. Record the demo
vhs demo-codemonkey.tape

# 3. Output will be: demo-codemonkey.gif
```

## What is VHS?

VHS is a tool for recording terminal sessions and generating GIFs/videos. Perfect for demos!

- **GitHub**: https://github.com/charmbracelet/vhs
- **Already installed**: `/opt/homebrew/bin/vhs`

## Recording from iTerm2

### Method 1: Direct VHS Recording (Recommended)

```bash
# Just run the tape file
vhs demo-codemonkey.tape
```

VHS will:
1. Open a new terminal window
2. Execute all commands automatically
3. Generate the GIF
4. Close when done

### Method 2: Manual Recording in iTerm2

If you want to record manually:

```bash
# 1. Start CodeMonkey in iTerm2
cd /Users/saintaugustine/Desktop/CodeMonkey/-CodeMonkey-
pnpm start

# 2. Use iTerm2's built-in recording
# Session → Start Instant Replay
# Or: Cmd + Opt + B

# 3. Perform your demo actions
/status
/budget
/secure

# 4. Stop recording
# Session → Stop Instant Replay
```

## VHS Tape File Explained

The `demo-codemonkey.tape` file contains:

```tape
# Output settings
Output demo-codemonkey.gif          # Output filename
Set FontSize 16                     # Font size
Set Width 1400                      # Terminal width
Set Height 900                      # Terminal height
Set Theme "Tokyo Night"             # Color theme
Set TypingSpeed 50ms                # How fast to type
Set PlaybackSpeed 0.5               # Playback speed

# Commands
Type "pnpm start" Enter             # Type and press Enter
Sleep 2s                            # Wait 2 seconds
Down                                # Press down arrow
Enter                               # Press Enter
```

## Customizing Your Demo

### Edit the Tape File

```bash
# Open in your editor
code demo-codemonkey.tape

# Or use vim
vim demo-codemonkey.tape
```

### Common Customizations

**Change output format:**
```tape
Output demo.gif          # GIF (default)
Output demo.mp4          # MP4 video
Output demo.webm         # WebM video
```

**Adjust timing:**
```tape
Set TypingSpeed 100ms    # Slower typing
Set PlaybackSpeed 1.0    # Normal speed
Sleep 5s                 # Wait longer
```

**Change theme:**
```tape
Set Theme "Dracula"
Set Theme "Nord"
Set Theme "Monokai"
Set Theme "Tokyo Night"
```

**Change size:**
```tape
Set Width 1200
Set Height 800
Set FontSize 14
```

## Creating Custom Demos

### Demo 1: Budget Mode Only

```tape
Output budget-mode-demo.gif
Set Theme "Tokyo Night"
Set Width 1400
Set Height 900

Type "pnpm start" Enter
Sleep 3s
Type "/budget" Enter
Sleep 2s
Down
Enter
Sleep 3s
Type "/status" Enter
Sleep 3s
Type "Write a hello world function" Enter
Sleep 5s
Type "/exit" Enter
```

### Demo 2: Secure Mode Only

```tape
Output secure-mode-demo.gif
Set Theme "Tokyo Night"
Set Width 1400
Set Height 900

Type "pnpm start" Enter
Sleep 3s
Type "/secure" Enter
Sleep 2s
Down
Enter
Sleep 3s
Type "My API key is sk-1234567890abcdef" Enter
Sleep 5s
Type "/exit" Enter
```

### Demo 3: Testing Suite

```tape
Output testing-demo.gif
Set Theme "Tokyo Night"
Set Width 1400
Set Height 900

Type "pnpm run test:modes" Enter
Sleep 5s
```

## Tips for Great Demos

### 1. **Keep it Short**
- 30-60 seconds is ideal
- Focus on one feature at a time
- Cut unnecessary waiting

### 2. **Add Comments**
```tape
Type "# This demonstrates Budget Mode" Enter
Sleep 2s
```

### 3. **Use Realistic Prompts**
```tape
Type "Create a REST API endpoint for user authentication" Enter
```

### 4. **Show the Results**
```tape
Sleep 5s  # Give time to see the output
```

### 5. **Clean Start**
```tape
Type "clear" Enter  # Clear terminal first
Sleep 1s
```

## Recording Multiple Demos

Create separate tape files:

```bash
# Budget Mode demo
vhs demo-budget.tape

# Secure Mode demo
vhs demo-secure.tape

# Testing demo
vhs demo-testing.tape

# Full feature demo
vhs demo-full.tape
```

## Troubleshooting

### VHS doesn't start CodeMonkey

**Problem**: VHS can't find `pnpm`

**Solution**: Use full path
```tape
Type "/opt/homebrew/bin/pnpm start" Enter
```

### Terminal size is wrong

**Problem**: Output is cut off

**Solution**: Increase dimensions
```tape
Set Width 1600
Set Height 1000
```

### Recording is too fast/slow

**Problem**: Hard to follow

**Solution**: Adjust speeds
```tape
Set TypingSpeed 100ms    # Slower typing
Set PlaybackSpeed 0.75   # Slower playback
Sleep 3s                 # More pauses
```

### Colors look wrong

**Problem**: Theme doesn't match iTerm2

**Solution**: Try different themes
```tape
Set Theme "Tokyo Night"
Set Theme "Dracula"
Set Theme "Nord"
```

## Advanced: Interactive Recording

For more control, use VHS in interactive mode:

```bash
# Start VHS server
vhs serve demo-codemonkey.tape

# Opens browser at http://localhost:1976
# Edit tape file in real-time
# See changes immediately
```

## Exporting for Different Platforms

### For GitHub README
```tape
Output demo.gif
Set Width 1200
Set Height 700
```

### For Twitter/Social Media
```tape
Output demo.mp4
Set Width 1280
Set Height 720
```

### For Documentation
```tape
Output demo.webm
Set Width 1400
Set Height 900
```

## Example: Complete Demo Script

```tape
# CodeMonkey Feature Demo
Output codemonkey-demo.gif
Set FontSize 16
Set Width 1400
Set Height 900
Set Theme "Tokyo Night"
Set TypingSpeed 50ms
Set PlaybackSpeed 0.5

# Clear and start
Type "clear" Enter
Sleep 1s

# Show banner
Type "# 🐒 CodeMonkey - AI Coding Assistant" Enter
Sleep 2s

# Start app
Type "pnpm start" Enter
Sleep 4s

# Show status
Type "/status" Enter
Sleep 3s

# Enable Budget Mode
Type "# Enable Budget Mode for cost tracking" Enter
Sleep 1s
Type "/budget" Enter
Sleep 2s
Down
Enter
Sleep 3s

# Enable Secure Mode
Type "# Enable Secure Mode for security" Enter
Sleep 1s
Type "/secure" Enter
Sleep 2s
Down
Enter
Sleep 3s

# Show both modes active
Type "/status" Enter
Sleep 3s

# Test with prompt
Type "Create a Python function to calculate fibonacci numbers" Enter
Sleep 5s

# Exit
Type "/exit" Enter
Sleep 2s
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `Type "text"` | Type text |
| `Enter` | Press Enter |
| `Sleep 2s` | Wait 2 seconds |
| `Down` | Press down arrow |
| `Up` | Press up arrow |
| `Tab` | Press Tab |
| `Ctrl+C` | Send Ctrl+C |
| `Backspace` | Press backspace |

## Resources

- **VHS Documentation**: https://github.com/charmbracelet/vhs
- **VHS Examples**: https://github.com/charmbracelet/vhs/tree/main/examples
- **Themes**: https://github.com/charmbracelet/vhs#themes

---

**Ready to record?** Just run:

```bash
vhs demo-codemonkey.tape
```

🎬 Happy recording! 🐒

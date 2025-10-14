# CodeMonkey Budget Mode Demo
# Shows cost tracking and budget management features

Output demo-budget-mode.gif
Set FontSize 16
Set Width 1400
Set Height 900
Set Theme "tokyonight"
Set TypingSpeed 60ms
Set PlaybackSpeed 0.6

# Start in the right directory
Type "cd /Users/saintaugustine/Desktop/CodeMonkey/-CodeMonkey-" Enter
Sleep 1s

Type "# 🐒 CodeMonkey Budget Mode Demo" Enter
Sleep 1s
Type "# Track your AI coding costs in real-time!" Enter
Sleep 2s

# Start CodeMonkey
Type "pnpm start" Enter
Sleep 4s

# Check initial status
Type "/status" Enter
Sleep 3s

# Enable Budget Mode
Type "# Enable Budget Mode for cost tracking" Enter
Sleep 1s
Type "/budget" Enter
Sleep 2s
Down
Enter
Sleep 4s

# Show budget status
Type "/status" Enter
Sleep 3s

# Test with a coding task
Type "Write a React component for a user profile card" Enter
Sleep 6s

# Check budget after usage
Type "/status" Enter
Sleep 3s

# Show budget mode benefits
Type "# 💰 Budget Mode helps you:" Enter
Sleep 1s
Type "# • Track costs per session" Enter
Sleep 1s
Type "# • Monitor token usage" Enter
Sleep 1s
Type "# • Control AI spending" Enter
Sleep 2s

# Exit
Type "/exit" Enter
Sleep 2s
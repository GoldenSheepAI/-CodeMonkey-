# CodeMonkey Secure Mode Demo
# Shows security scanning and sensitive data protection

Output demo-secure-mode.gif
Set FontSize 24
Set Width 1600
Set Height 1000
Set Theme "tokyonight"
Set TypingSpeed 80ms
Set PlaybackSpeed 0.7

# Start in the right directory
Type "cd /Users/saintaugustine/Desktop/CodeMonkey/-CodeMonkey-" Enter
Sleep 1s

Type "# 🐒 CodeMonkey Secure Mode Demo" Enter
Sleep 1s
Type "# Protect your sensitive data and API keys!" Enter
Sleep 2s

# Start CodeMonkey
Type "pnpm start" Enter
Sleep 4s

# Check initial status
Type "/status" Enter
Sleep 3s

# Enable Secure Mode
Type "# Enable Secure Mode for data protection" Enter
Sleep 1s
Type "/secure" Enter
Sleep 2s
Down
Enter
Sleep 4s

# Show secure status
Type "/status" Enter
Sleep 3s

# Test with sensitive content
Type "Here's my API key: sk-1234567890abcdef and my database password: supersecret123" Enter
Sleep 4s

# Test with normal coding task
Type "Create a function to validate email addresses in JavaScript" Enter
Sleep 6s

# Show security benefits
Type "# 🔒 Secure Mode protects:" Enter
Sleep 1s
Type "# • API keys and tokens" Enter
Sleep 1s
Type "# • Database credentials" Enter
Sleep 1s
Type "# • Personal information" Enter
Sleep 1s
Type "# • Sensitive code patterns" Enter
Sleep 2s

# Exit
Type "/exit" Enter
Sleep 2s
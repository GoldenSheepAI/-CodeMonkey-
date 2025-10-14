# CodeMonkey Secure Mode Demo - FAANG Quality with Proper Navigation
# Shows NoLeakAI security scanning with correct interactive navigation

Output demo-secure-mode-v3.gif
Set FontSize 18
Set Width 1600
Set Height 1000
Set Theme "Material Ocean"
Set TypingSpeed 90ms
Set PlaybackSpeed 0.7

# Navigate to project directory
Type "cd /Users/saintaugustine/Desktop/CodeMonkey/-CodeMonkey-" Enter
Sleep 1s

Type "# 🐒 CodeMonkey Secure Mode Demo - NoLeakAI Protection" Enter
Sleep 1s
Type "# Watch how /secure command enables advanced security scanning!" Enter
Sleep 2s

# Start CodeMonkey
Type "pnpm start" Enter
Sleep 5s

# Use /secure command with interactive navigation
Type "# Enable Secure Mode with NoLeakAI scanning..." Enter
Sleep 1s
Type "/secure" Enter
Sleep 3s

# Navigate the interactive menu (Down to select "Enable Secure Mode")
Down
Sleep 1s
Enter
Sleep 6s

# Check status to show secure mode is active
Type "# Secure Mode enabled! Let's check our status..." Enter
Sleep 1s
Type "/status" Enter
Sleep 4s

# Test with sensitive data that should be blocked
Type "# Let's test with sensitive data that should be caught..." Enter
Sleep 1s
Type "Here's my API key: sk-1234567890abcdef and my secret password: mySecurePass123" Enter
Sleep 6s

# Show it was detected and blocked
Type "# See how NoLeakAI automatically detected the sensitive data!" Enter
Sleep 2s

# Try a safe coding task
Type "# Now let's try a safe coding task..." Enter
Sleep 1s
Type "Create a JavaScript utility function to validate email addresses with regex" Enter
Sleep 8s

# Show security benefits
Type "# 🔒 Secure Mode Benefits:" Enter
Sleep 1s
Type "# • Automatic API key and credential detection" Enter
Sleep 1s
Type "# • PII (Personal Information) protection" Enter
Sleep 1s
Type "# • Prevents accidental data leaks" Enter
Sleep 1s
Type "# • Advanced pattern matching" Enter
Sleep 2s

# Test another dangerous pattern
Type "# Let's test another common security risk..." Enter
Sleep 1s
Type "My database connection: mongodb://admin:supersecret@localhost:27017/myapp" Enter
Sleep 5s

# Show comprehensive protection
Type "# NoLeakAI catches:" Enter
Sleep 1s
Type "# • OpenAI API keys (sk-* patterns)" Enter
Sleep 1s
Type "# • Database URLs with embedded credentials" Enter
Sleep 1s
Type "# • Email addresses and phone numbers" Enter
Sleep 1s
Type "# • Common password patterns" Enter
Sleep 2s

# Final status check
Type "/status" Enter
Sleep 4s

# Exit
Type "/exit" Enter
Sleep 2s
# CodeMonkey Secure Mode Demo - FAANG Quality
# Shows NoLeakAI security scanning with proper /commands

Output demo-secure-mode-v2.gif
Set FontSize 18
Set Width 1600
Set Height 1000
Set Theme "Material Ocean"
Set TypingSpeed 80ms
Set PlaybackSpeed 0.7

# Start in the right directory
Type "cd /Users/saintaugustine/Desktop/CodeMonkey/-CodeMonkey-" Enter
Sleep 1s

Type "# 🐒 CodeMonkey Secure Mode Demo - NoLeakAI Protection" Enter
Sleep 1s
Type "# Watch how NoLeakAI catches sensitive data BEFORE it leaks!" Enter
Sleep 2s

# Start CodeMonkey
Type "pnpm start" Enter
Sleep 5s

# Enable Secure Mode using /secure command
Type "# First, let's enable Secure Mode with NoLeakAI scanning..." Enter
Sleep 1s
Type "/secure" Enter
Sleep 2s
Down
Enter
Sleep 6s

# Check status to show secure mode active
Type "# Excellent! Secure Mode is now active. Let's check our status..." Enter
Sleep 1s
Type "/status" Enter
Sleep 4s

# Test with sensitive data - this should be caught
Type "# Now let's test with sensitive data that should be blocked..." Enter
Sleep 1s
Type "Here's my API key: sk-1234567890abcdef and my secret password: mySecurePass123" Enter
Sleep 6s

# Show it was blocked
Type "# See how NoLeakAI automatically detected and blocked the sensitive data!" Enter
Sleep 2s

# Try a safe coding task
Type "# Now let's try a safe coding task..." Enter
Sleep 1s
Type "Create a JavaScript utility function to format dates nicely" Enter
Sleep 7s

# Show secure mode benefits
Type "# 🔒 Secure Mode Benefits:" Enter
Sleep 1s
Type "# • Automatic API key detection" Enter
Sleep 1s
Type "# • Password and credential blocking" Enter
Sleep 1s
Type "# • PII (Personal Information) protection" Enter
Sleep 1s
Type "# • Prevents accidental data leaks" Enter
Sleep 2s

# Test another sensitive pattern
Type "# Let's test another common leak scenario..." Enter
Sleep 1s
Type "My database connection string is: mongodb://user:secret123@localhost:27017/mydb" Enter
Sleep 5s

# Show comprehensive protection
Type "# NoLeakAI uses advanced pattern matching to catch:" Enter
Sleep 1s
Type "# • OpenAI API keys (sk-*)" Enter
Sleep 1s
Type "# • Database URLs with credentials" Enter
Sleep 1s
Type "# • Email addresses and phone numbers" Enter
Sleep 1s
Type "# • Common password patterns" Enter
Sleep 2s

# Exit
Type "/exit" Enter
Sleep 2s
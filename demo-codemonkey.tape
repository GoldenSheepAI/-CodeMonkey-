# CodeMonkey Demo - Budget Mode & Secure Mode
# Record with: vhs demo-codemonkey.tape

# Output settings
Output demo-codemonkey.gif
Set FontSize 16
Set Width 1400
Set Height 900
Set Theme "Tokyo Night"
Set TypingSpeed 50ms
Set PlaybackSpeed 0.5

# Start recording
Type "cd /Users/saintaugustine/Desktop/CodeMonkey/-CodeMonkey-" Enter
Sleep 1s

Type "# Welcome to CodeMonkey! 🐒" Enter
Sleep 1s

Type "# Let's see the new Budget Mode and Secure Mode features" Enter
Sleep 2s

Type "pnpm start" Enter
Sleep 5s

# Show status
Type "/status" Enter
Sleep 3s

# Enable Budget Mode
Type "/budget" Enter
Sleep 2s
Down
Enter
Sleep 4s

# Show status again with Budget Mode
Type "/status" Enter
Sleep 3s

# Enable Secure Mode
Type "/secure" Enter
Sleep 2s
Down
Enter
Sleep 3s

# Show status with both modes
Type "/status" Enter
Sleep 3s

# Test with a prompt
Type "Create a simple hello world function in Python" Enter
Sleep 5s

# Show the modes working
Sleep 3s

# Exit
Type "/exit" Enter
Sleep 2s

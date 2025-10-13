# CodeMonkey Multi-Provider Demo
# Shows provider switching and model selection

Output demo-multi-provider.gif
Set FontSize 16
Set Width 1400
Set Height 900
Set Theme "tokyonight"
Set TypingSpeed 60ms
Set PlaybackSpeed 0.6

# Start in the right directory
Type "cd /Users/saintaugustine/Desktop/CodeMonkey/-CodeMonkey-" Enter
Sleep 1s

Type "# 🐒 CodeMonkey Multi-Provider Demo" Enter
Sleep 1s
Type "# Switch between AI providers seamlessly!" Enter
Sleep 2s

# Start CodeMonkey
Type "pnpm start" Enter
Sleep 4s

# Check current status
Type "/status" Enter
Sleep 3s

# Show available providers
Type "# Let's see what providers are available" Enter
Sleep 1s
Type "/provider" Enter
Sleep 2s
Down
Down
Enter
Sleep 4s

# Show available models
Type "# Now let's check the models for this provider" Enter
Sleep 1s
Type "/model" Enter
Sleep 2s
Down
Enter
Sleep 4s

# Test with current provider
Type "Explain the difference between REST and GraphQL APIs" Enter
Sleep 6s

# Switch to another provider
Type "# Switch to a different provider" Enter
Sleep 1s
Type "/provider" Enter
Sleep 2s
Down
Enter
Sleep 4s

# Test with new provider
Type "Create a simple TypeScript interface for a user object" Enter
Sleep 6s

# Show provider benefits
Type "# 🌐 Multi-Provider support means:" Enter
Sleep 1s
Type "# • Choose the best model for your task" Enter
Sleep 1s
Type "# • Compare different AI responses" Enter
Sleep 1s
Type "# • Fallback to working providers" Enter
Sleep 1s
Type "# • Optimize for cost vs quality" Enter
Sleep 2s

# Exit
Type "/exit" Enter
Sleep 2s
# CodeMonkey Multi-Provider Demo - FAANG Quality with Proper Navigation
# Shows provider switching and model selection using /provider and /model commands

Output demo-multi-provider-v3.gif
Set FontSize 18
Set Width 1600
Set Height 1000
Set Theme "Volcanic Ash"
Set TypingSpeed 90ms
Set PlaybackSpeed 0.7

# Navigate to project directory
Type "cd /Users/saintaugustine/Desktop/CodeMonkey/-CodeMonkey-" Enter
Sleep 1s

Type "# 🐒 CodeMonkey Multi-Provider Demo - Ultimate Flexibility" Enter
Sleep 1s
Type "# Switch between AI providers seamlessly using /provider and /model commands!" Enter
Sleep 2s

# Start CodeMonkey
Type "pnpm start" Enter
Sleep 5s

# Show current status
Type "# Let's see our current setup..." Enter
Sleep 1s
Type "/status" Enter
Sleep 4s

# Switch providers using /provider command with interactive navigation
Type "# Now let's switch to a different AI provider..." Enter
Sleep 1s
Type "/provider" Enter
Sleep 3s

# Navigate the provider menu (Down to select different provider)
Down
Sleep 1s
Enter
Sleep 5s

# Switch models using /model command with interactive navigation
Type "# Let's try a different model from this provider..." Enter
Sleep 1s
Type "/model" Enter
Sleep 3s

# Navigate the model menu (Down to select different model)
Down
Sleep 1s
Enter
Sleep 5s

# Test with the new provider/model combination
Type "# Perfect! Now let's see how this provider/model handles a coding task..." Enter
Sleep 1s
Type "Create a Rust function that parses command line arguments and returns a configuration struct with clap" Enter
Sleep 12s

# Compare with original provider - switch back
Type "# Great! Now let's switch back and compare the responses..." Enter
Sleep 1s
Type "/provider" Enter
Sleep 3s

# Navigate back to original provider
Down
Down
Sleep 1s
Enter
Sleep 5s

# Test same task with different provider
Type "# Same task, different provider - watch the difference!" Enter
Sleep 1s
Type "Create a Rust function that parses command line arguments and returns a configuration struct with clap" Enter
Sleep 12s

# Show benefits
Type "# 🌐 Multi-Provider Benefits:" Enter
Sleep 1s
Type "# • Choose the best model for each task" Enter
Sleep 1s
Type "# • Compare responses from different providers" Enter
Sleep 1s
Type "# • Fallback to working providers automatically" Enter
Sleep 1s
Type "# • Optimize for cost vs. quality trade-offs" Enter
Sleep 1s
Type "# • Access cutting-edge models instantly" Enter
Sleep 2s

# Show another provider switch
Type "# Let's try one more provider switch..." Enter
Sleep 1s
Type "/provider" Enter
Sleep 3s
Down
Sleep 1s
Enter
Sleep 5s

Type "# And one final coding task to showcase the flexibility..." Enter
Sleep 1s
Type "Write a SQL query that finds users who haven't logged in for 30 days and includes their last activity timestamp" Enter
Sleep 10s

# Final status check
Type "/status" Enter
Sleep 4s

# Exit
Type "/exit" Enter
Sleep 2s
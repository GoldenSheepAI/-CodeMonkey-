#!/bin/bash
# CodeMonkey (CoMo) - Auto-Restart Launcher
# Run this script to start CodeMonkey with auto-restart support

cd "$(dirname "$0")"

# Build if needed
if [ ! -d "dist" ]; then
    echo "Building CodeMonkey..."
    pnpm run build
fi

while true; do
    echo "Starting CodeMonkey..."
    node --no-warnings dist/cli.js
    
    EXIT_CODE=$?
    
    # If exit code is 42 (from /restart), restart automatically
    if [ $EXIT_CODE -eq 42 ]; then
        echo ""
        echo "🔄 Restarting CodeMonkey..."
        sleep 1
    else
        # Any other exit code (Ctrl+C, error, /exit), stop the loop
        echo "CodeMonkey stopped."
        break
    fi
done

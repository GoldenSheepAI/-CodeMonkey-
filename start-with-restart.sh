#!/bin/bash
# CodeMonkey Auto-Restart Wrapper
# This script automatically restarts CodeMonkey when you use /restart

cd "$(dirname "$0")"

while true; do
    echo "Starting CodeMonkey..."
    pnpm start
    
    EXIT_CODE=$?
    
    # If exit code is 0 (from /restart), restart automatically
    if [ $EXIT_CODE -eq 0 ]; then
        echo ""
        echo "🔄 Restarting CodeMonkey..."
        sleep 1
    else
        # Any other exit code (Ctrl+C, error, /exit), stop the loop
        echo "CodeMonkey stopped."
        break
    fi
done

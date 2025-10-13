#!/usr/bin/env bash
set -e

echo "🐒 CodeMonkey Setup Script"
echo "=========================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm $(pnpm --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Setup environment
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo ""
        echo "🔧 Creating .env file from .env.example..."
        cp .env.example .env
        echo "✅ .env file created. Please update it with your configuration."
    fi
fi

# Setup agents config
if [ ! -f agents.config.json ]; then
    if [ -f agents.config.example.json ]; then
        echo ""
        echo "🔧 Creating agents.config.json from example..."
        cp agents.config.example.json agents.config.json
        echo "✅ agents.config.json created. Please update it with your configuration."
    fi
fi

# Build the project
echo ""
echo "🔨 Building project..."
pnpm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env with your API keys"
echo "  2. Update agents.config.json with your preferences"
echo "  3. Run 'pnpm start' to start CodeMonkey"
echo ""

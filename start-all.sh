#!/bin/bash

# RAG Proposal Generator - Start All Services
# This script starts all three services in separate terminal tabs (macOS)

echo "🚀 Starting RAG Proposal Generator..."
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  This script is designed for macOS Terminal"
    echo "Please start services manually in 3 separate terminals:"
    echo ""
    echo "Terminal 1: cd mcp-server && npm run dev"
    echo "Terminal 2: cd backend && npm run dev"
    echo "Terminal 3: cd frontend && npm start"
    exit 1
fi

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found!"
    echo "Please run: cp backend/.env.example backend/.env"
    echo "And add your Claude API key"
    exit 1
fi

# Check if API key is set
if ! grep -q "ANTHROPIC_API_KEY=sk-" backend/.env; then
    echo "⚠️  Claude API key not configured in backend/.env"
    echo "Please add your API key before starting"
    exit 1
fi

echo "✅ Configuration check passed"
echo ""
echo "Opening 3 terminal windows..."
echo ""

# Get the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start MCP Server in new tab
osascript <<EOF
tell application "Terminal"
    activate
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.5
    do script "cd '$DIR/mcp-server' && echo '🔷 MCP Server' && npm run dev" in front window
end tell
EOF

# Wait a bit
sleep 1

# Start Backend in new tab
osascript <<EOF
tell application "Terminal"
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.5
    do script "cd '$DIR/backend' && echo '🔶 Backend API' && npm run dev" in front window
end tell
EOF

# Wait a bit
sleep 1

# Start Frontend in new tab
osascript <<EOF
tell application "Terminal"
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.5
    do script "cd '$DIR/frontend' && echo '🔵 Frontend' && npm start" in front window
end tell
EOF

echo "✅ All services starting in separate tabs!"
echo ""
echo "📍 Services will be available at:"
echo "   - MCP Server:  http://localhost:3001"
echo "   - Backend API: http://localhost:3000"
echo "   - Frontend:    http://localhost:4200"
echo ""
echo "⏳ Wait for all services to start, then open:"
echo "   👉 http://localhost:4200"
echo ""

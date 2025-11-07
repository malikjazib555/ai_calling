#!/bin/bash

# ngrok Auto-Setup Script
# This script will help you set up ngrok quickly

echo "🚀 ngrok Auto-Setup"
echo "==================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Installing..."
    if command -v brew &> /dev/null; then
        brew install ngrok/ngrok/ngrok
    else
        echo "Please install ngrok manually: https://ngrok.com/download"
        exit 1
    fi
fi

echo "✅ ngrok is installed"
echo ""

# Check if authtoken is already set
if ngrok config check &>/dev/null; then
    echo "✅ ngrok authtoken is configured"
    AUTH_SET=true
else
    echo "⚠️  ngrok authtoken is not configured"
    AUTH_SET=false
fi

if [ "$AUTH_SET" = false ]; then
    echo ""
    echo "📝 ngrok requires a free account and authtoken."
    echo ""
    echo "Quick Steps:"
    echo "1. Sign up (free): https://dashboard.ngrok.com/signup"
    echo "2. Get your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "3. Copy your authtoken"
    echo ""
    read -p "Enter your ngrok authtoken (or press Enter to skip): " AUTHTOKEN
    
    if [ ! -z "$AUTHTOKEN" ]; then
        ngrok config add-authtoken "$AUTHTOKEN" 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Authtoken configured successfully!"
        else
            echo "❌ Failed to configure authtoken"
            exit 1
        fi
    else
        echo "⚠️  Skipping authtoken setup. ngrok will not work without it."
        exit 1
    fi
fi

echo ""
echo "🔄 Starting ngrok tunnel on port 3000..."
echo ""

# Kill any existing ngrok processes
pkill -f "ngrok http" 2>/dev/null
sleep 1

# Start ngrok in background
nohup ngrok http 3000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "⏳ Waiting for ngrok to start..."
sleep 5

# Get the public URL
MAX_RETRIES=10
RETRY=0
PUBLIC_URL=""

while [ $RETRY -lt $MAX_RETRIES ]; do
    PUBLIC_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | \
        python3 -c "import sys, json; data = json.load(sys.stdin); tunnels = data.get('tunnels', []); https_tunnel = next((t for t in tunnels if t['proto'] == 'https'), None); print(https_tunnel['public_url'] if https_tunnel else '')" 2>/dev/null)
    
    if [ ! -z "$PUBLIC_URL" ]; then
        break
    fi
    
    RETRY=$((RETRY + 1))
    sleep 1
done

if [ -z "$PUBLIC_URL" ]; then
    echo "❌ Failed to get ngrok URL. Check /tmp/ngrok.log for errors."
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "✅ ngrok is running!"
echo ""
echo "🌐 Your public URL: $PUBLIC_URL"
echo ""
echo "📝 Setting environment variable..."

# Update .env.local
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
fi

# Remove old NEXT_PUBLIC_APP_URL if exists
sed -i.bak '/^NEXT_PUBLIC_APP_URL=/d' "$ENV_FILE" 2>/dev/null || \
sed -i '' '/^NEXT_PUBLIC_APP_URL=/d' "$ENV_FILE" 2>/dev/null

# Add new URL
echo "NEXT_PUBLIC_APP_URL=$PUBLIC_URL" >> "$ENV_FILE"

echo "✅ Environment variable set in $ENV_FILE"
echo ""
echo "⚠️  IMPORTANT: Restart your Next.js server for changes to take effect!"
echo ""
echo "📋 Summary:"
echo "   - ngrok URL: $PUBLIC_URL"
echo "   - Process ID: $NGROK_PID"
echo "   - Log file: /tmp/ngrok.log"
echo ""
echo "🛑 To stop ngrok, run: kill $NGROK_PID"
echo ""


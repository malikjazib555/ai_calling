#!/bin/bash

# Setup ngrok for local Twilio development
# This script helps you set up ngrok to expose your local server to Twilio

echo "🚀 Setting up ngrok for Twilio webhooks..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed."
    echo ""
    echo "Install ngrok:"
    echo "  macOS: brew install ngrok/ngrok/ngrok"
    echo "  Or download from: https://ngrok.com/download"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Check if port 3000 is in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Port 3000 is in use (Next.js is running)"
else
    echo "⚠️  Port 3000 is not in use. Make sure Next.js is running on port 3000."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Starting ngrok tunnel on port 3000..."
echo ""

# Start ngrok
ngrok http 3000


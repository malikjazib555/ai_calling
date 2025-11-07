#!/bin/bash

# Production Deployment Script
# Run this script to prepare for production deployment

echo "🚀 BizzAI Production Setup"
echo "=========================="
echo ""

# Check Node version
echo "Checking Node.js version..."
node_version=$(node -v)
echo "✓ Node.js: $node_version"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found"
    echo "Creating from .env.example..."
    cp .env.example .env.production
    echo "✓ Created .env.production"
    echo "⚠️  Please fill in your production credentials!"
    echo ""
else
    echo "✓ .env.production exists"
    echo ""
fi

# Check required environment variables
echo "Checking required environment variables..."
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "OPENAI_API_KEY"
    "TWILIO_ACCOUNT_SID"
    "TWILIO_AUTH_TOKEN"
    "TWILIO_PHONE_NUMBER"
    "NEXT_PUBLIC_APP_URL"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env.production 2>/dev/null; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo "✓ All required variables present"
else
    echo "⚠️  Missing variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
fi
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Build check
echo "Running production build check..."
npm run build
if [ $? -eq 0 ]; then
    echo "✓ Build successful"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi
echo ""

# Database check
echo "⚠️  Don't forget to:"
echo "   1. Run supabase/schema.sql in your Supabase project"
echo "   2. Run supabase/advanced_features.sql"
echo "   3. Configure Twilio webhooks"
echo "   4. Deploy WebSocket server"
echo ""

echo "✅ Production setup complete!"
echo ""
echo "Next steps:"
echo "  1. Fill in .env.production"
echo "  2. Deploy to Vercel: vercel --prod"
echo "  3. Configure Twilio webhooks"
echo "  4. Test with a real call"
echo ""


#!/bin/bash

# Quick Deploy Script - Push to GitHub and Deploy to Vercel

echo "🚀 Bizzai Deployment Script"
echo "==========================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Check current git status
echo "📋 Current git status:"
git status --short
echo ""

# Ask for GitHub repository URL
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/bizzai.git) or press Enter to skip: " REPO_URL

if [ ! -z "$REPO_URL" ]; then
    # Check if remote already exists
    if git remote get-url origin &>/dev/null; then
        echo "⚠️  Remote 'origin' already exists. Updating..."
        git remote set-url origin "$REPO_URL"
    else
        echo "➕ Adding remote 'origin'..."
        git remote add origin "$REPO_URL"
    fi
    
    # Push to GitHub
    echo ""
    echo "📤 Pushing to GitHub..."
    git branch -M main
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🌐 Next steps:"
        echo "1. Go to https://vercel.com"
        echo "2. Sign up/Login with GitHub"
        echo "3. Click 'Add New Project'"
        echo "4. Import your repository"
        echo "5. Add environment variables"
        echo "6. Deploy!"
        echo ""
        echo "📖 See QUICK_DEPLOY.md for detailed instructions"
    else
        echo "❌ Failed to push. Please check your GitHub credentials and repository URL."
        echo ""
        echo "💡 Tip: If you haven't created the repository yet:"
        echo "   1. Go to https://github.com/new"
        echo "   2. Create a new repository named 'bizzai'"
        echo "   3. Don't initialize with README"
        echo "   4. Run this script again with the repository URL"
    fi
else
    echo "⏭️  Skipping GitHub push."
    echo ""
    echo "📖 To push manually:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/bizzai.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
fi


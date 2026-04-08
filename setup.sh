#!/bin/bash

# Development Environment Setup Script
# For Chat-Bot Admin Panel

set -e

echo "🚀 Chat-Bot Admin Panel - Setup Script"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.17 or higher."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build project
echo "🔨 Building project..."
npm run build
echo "✅ Build complete"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Login with: admin@example.com / password"
echo ""
echo "Documentation:"
echo "- README.md        - User guide and features"
echo "- FEATURES.md      - Complete feature checklist"
echo "- DEPLOYMENT.md    - Deployment and integration guide"
echo ""

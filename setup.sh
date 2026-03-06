#!/bin/bash

# UltraPilot Dashboard Setup Script
# Run this on any VPS to quickly deploy the dashboard

set -e

echo "🚀 UltraPilot Dashboard Setup"
echo "================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Please install Node.js v20+"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required. Please install npm"; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js v20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your GitHub App credentials:"
    echo "   - GITHUB_APP_ID"
    echo "   - GITHUB_APP_INSTALLATION_ID"
    echo "   - GITHUB_APP_PRIVATE_KEY_PATH"
    echo "   - GITHUB_OWNER"
    echo "   - GITHUB_REPO"
    echo ""
    read -p "Press Enter to continue after editing .env.local..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent
echo "✅ Dependencies installed"
echo ""

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data
chmod 700 data
echo "✅ Data directory created"
echo ""

# Build the application
echo "🔨 Building application..."
npm run build --silent
echo "✅ Build complete"
echo ""

# Create logs directory
echo "📝 Creating logs directory..."
mkdir -p logs
echo "✅ Logs directory created"
echo ""

# Instructions for running
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
echo ""
echo "To start the dashboard:"
echo ""
echo "Development mode:"
echo "  npm run dev"
echo ""
echo "Production mode:"
echo "  npm start"
echo ""
echo "With PM2 (recommended):"
echo "  pm2 start npm --name ultrapilot-dashboard -- start"
echo "  pm2 save"
echo "  pm2 startup"
echo ""
echo "Access the dashboard at:"
echo "  http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

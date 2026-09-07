#!/bin/bash
# RenoFitness - Repository Reorganization Script
# This script reorganizes the repository to match the Node.js/Express structure
# 
# BEFORE running this script:
# 1. Make sure you're on the redesign branch
# 2. Commit all your changes: git add . && git commit -m "backup"
# 3. Run this script from the repository root
#
# After running:
# 1. Run: npm install
# 2. Run: npm run dev
# 3. Visit: http://localhost:3000

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     RenoFitness Repository Reorganization Script              ║"
echo "║     Moving static files to public/ directory                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
  echo "❌ Error: server.js not found!"
  echo "   Make sure you run this script from the repository root directory."
  exit 1
fi

# Create public directory if it doesn't exist
echo "📁 Creating public/ directory..."
mkdir -p public

# Move static HTML files
echo "📄 Moving HTML files..."
if [ -f "index.html" ]; then
  mv index.html public/
  echo "   ✅ Moved index.html"
fi

if [ -f "blog.html" ]; then
  mv blog.html public/
  echo "   ✅ Moved blog.html"
fi

if [ -f "generator.html" ]; then
  mv generator.html public/
  echo "   ✅ Moved generator.html"
fi

# Move directories
echo ""
echo "📁 Moving directories..."

if [ -d "carousel1" ]; then
  mv carousel1 public/
  echo "   ✅ Moved carousel1/"
fi

if [ -d "carousel2" ]; then
  mv carousel2 public/
  echo "   ✅ Moved carousel2/"
fi

if [ -d "img" ]; then
  mv img public/
  echo "   ✅ Moved img/"
fi

if [ -d "resources" ]; then
  mv resources public/
  echo "   ✅ Moved resources/"
fi

if [ -d "vendors" ]; then
  mv vendors public/
  echo "   ✅ Moved vendors/"
fi

if [ -d "widgets" ]; then
  mv widgets public/
  echo "   ✅ Moved widgets/"
fi

# Create data directory for JSON storage
echo ""
echo "📁 Creating data/ directory for local storage..."
mkdir -p data
echo "   ✅ Created data/"

# Create .gitkeep files to keep empty directories in git
echo ""
echo "🔒 Protecting data directory from git..."
touch data/.gitkeep
echo "   ✅ Created data/.gitkeep (prevents accidental commits)"

# List final structure
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║               ✅ Reorganization Complete!                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Final Structure:"
echo "   redesign/"
echo "   ├── 📁 public/              (all static files)"
echo "   │   ├── index.html"
echo "   │   ├── blog.html"
echo "   │   ├── carousel1/"
echo "   │   ├── carousel2/"
echo "   │   ├── img/"
echo "   │   ├── resources/"
echo "   │   ├── vendors/"
echo "   │   └── widgets/"
echo "   ├── 📁 src/                 (application code)"
echo "   ├── 📁 data/                (local JSON storage)"
echo "   ├── server.js"
echo "   ├── package.json"
echo "   └── .env.example"
echo ""
echo "🚀 Next Steps:"
echo "   1. npm install"
echo "   2. cp .env.example .env"
echo "   3. Edit .env with your settings"
echo "   4. npm run dev"
echo "   5. Open http://localhost:3000"
echo ""

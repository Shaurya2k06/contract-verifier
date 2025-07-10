#!/bin/bash

# Contract Verifier Local Development Setup

echo "🔧 Setting up contract-verifier for local development..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Link package globally for testing
echo "🔗 Linking package globally..."
npm link

echo "✅ Setup complete!"
echo ""
echo "You can now use contract-verifier globally:"
echo "  contract-verifier --help"
echo "  contract-verifier networks"
echo "  contract-verifier setup"
echo ""
echo "To unlink later, run:"
echo "  npm unlink -g contract-verifier"
echo ""
echo "Happy verifying! 🚀"

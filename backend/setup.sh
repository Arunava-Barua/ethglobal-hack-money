#!/bin/bash

# StarCPay Backend Setup Script

echo "🚀 StarCPay Backend Setup"
echo "========================="
echo ""

# Check Python version
echo "📋 Checking Python version..."
python3 --version || python --version

# Create virtual environment
echo ""
echo "🔧 Creating virtual environment..."
python3 -m venv venv || python -m venv venv

# Activate virtual environment
echo ""
echo "✅ Activating virtual environment..."
source venv/bin/activate || source venv/Scripts/activate

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check for .env file
echo ""
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your actual values."
else
    echo "✅ .env file already exists."
fi

# Check for private key
echo ""
if [ ! -f starcpay.2026-02-06.private-key.pem ]; then
    echo "⚠️  GitHub App private key not found!"
    echo "Please add starcpay.2026-02-06.private-key.pem to this directory."
else
    echo "✅ Private key file found."
fi

echo ""
echo "========================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your actual values"
echo "2. Add your GitHub App private key file"
echo "3. Run: uvicorn app.main:app --reload"
echo ""
echo "Documentation: http://localhost:8000/docs"

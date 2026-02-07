#!/bin/bash

# Quick run script for development

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate

# Run the server
echo "🚀 Starting StarCPay Backend..."
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

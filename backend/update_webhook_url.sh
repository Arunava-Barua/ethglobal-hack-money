#!/bin/bash

# Script to update webhook URL programmatically
# Use this when you start ngrok or deploy to production

# Configuration
BACKEND_URL="http://localhost:8000"
PROJECT_ID="$1"  # Pass as first argument
NEW_WEBHOOK_URL="$2"  # Pass as second argument

if [ -z "$PROJECT_ID" ] || [ -z "$NEW_WEBHOOK_URL" ]; then
    echo "Usage: ./update_webhook_url.sh <project_id> <new_webhook_url>"
    echo ""
    echo "Example:"
    echo "  ./update_webhook_url.sh proj_abc123 https://abc123.ngrok.io/api/webhooks/github"
    echo ""
    exit 1
fi

echo "🔄 Updating webhook URL..."
echo "Project ID: $PROJECT_ID"
echo "New URL: $NEW_WEBHOOK_URL"
echo ""

RESPONSE=$(curl -s -X POST $BACKEND_URL/api/webhook-manager/update \
  -H "Content-Type: application/json" \
  -d "{
    \"project_id\": \"$PROJECT_ID\",
    \"new_webhook_url\": \"$NEW_WEBHOOK_URL\"
  }")

echo "Response:"
echo $RESPONSE | jq

if echo $RESPONSE | jq -e '.success' > /dev/null; then
    echo ""
    echo "✅ Webhook URL updated successfully!"
    echo ""
    echo "Old URL: $(echo $RESPONSE | jq -r '.old_url')"
    echo "New URL: $(echo $RESPONSE | jq -r '.new_url')"
else
    echo ""
    echo "❌ Failed to update webhook URL"
    echo "Error: $(echo $RESPONSE | jq -r '.detail')"
fi

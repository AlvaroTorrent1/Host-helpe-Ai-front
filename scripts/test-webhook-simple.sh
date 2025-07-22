#!/bin/bash
# scripts/test-webhook-simple.sh
# Script para probar conectividad con webhook n8n

echo "🧪 Testing n8n Webhook Connectivity"
echo "========================================"

# URLs
N8N_WEBHOOK_URL="https://hosthelperai.app.n8n.cloud/webhook/images"
PROXY_URL="https://qwhcuptrmdtyqzlowmxd.supabase.co/functions/v1/proxy-n8n-webhook"

# Test 1: Direct n8n webhook
echo -e "\n📡 Test 1: Direct n8n webhook"
echo "URL: $N8N_WEBHOOK_URL"
echo -e "\nSending test request..."
curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test":"ping"}' \
  -w "\nStatus Code: %{http_code}\n" \
  -v 2>&1 | grep -E "(< HTTP|Status Code:|{|error)"

# Test 2: Through Supabase proxy
echo -e "\n\n🔄 Test 2: Through Supabase proxy"
echo "URL: $PROXY_URL"
echo -e "\nSending test request..."
curl -X POST "$PROXY_URL" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aGN1cHRybWR0eXF6bG93bXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MTQ1MDUsImV4cCI6MjA1MDE5MDUwNX0.w4yvpyqmhP_vJC4_Lj8qJ-nB8bOUfRZwvP8Sp5tEbag" \
  -F "property_id=test-123" \
  -F "user_id=test-user" \
  -F "total_images=1" \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq . 2>/dev/null || cat

echo -e "\n\n📊 Analysis complete!" 
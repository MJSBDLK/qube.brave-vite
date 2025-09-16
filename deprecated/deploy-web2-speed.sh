#!/bin/bash

# Web2-Speed IPFS Deployment
# Uses multiple pinning services for instant global availability

set -e

echo "🚀 Building website..."
npm run build

echo "📦 Adding to local IPFS..."
CID=$(ipfs add -r -Q out/)
echo "✅ New CID: $CID"

# Save CID
echo "$CID" > latest-cid.txt

# Pin to multiple services simultaneously for Web2 speed
echo "⚡ Deploying to multiple pinning services..."

# Pinata (if configured)
if [ ! -z "$PINATA_JWT" ]; then
    echo "📌 Pinning to Pinata..."
    curl -X POST "https://api.pinata.cloud/pinning/pinByHash" \
         -H "Authorization: Bearer $PINATA_JWT" \
         -H "Content-Type: application/json" \
         -d "{\"hashToPin\":\"$CID\",\"pinataMetadata\":{\"name\":\"qube-brave-$(date +%Y%m%d-%H%M%S)\"}}" \
         > /dev/null 2>&1 && echo "✅ Pinata pinned" || echo "❌ Pinata failed"
fi

# Web3.Storage (if configured)
if [ ! -z "$WEB3_STORAGE_TOKEN" ]; then
    echo "📌 Pinning to Web3.Storage..."
    # Add Web3.Storage pinning logic here
fi

# Force announce locally
echo "📡 Announcing to IPFS network..."
ipfs routing provide $CID

# Update IPNS
echo "🔗 Updating IPNS..."
IPNS=$(ipfs name publish $CID 2>&1 | grep -o 'k51[a-zA-Z0-9]*')
echo "✅ IPNS updated: $IPNS"

# Test multiple gateways
echo ""
echo "🧪 Testing propagation across gateways..."
TIMESTAMP=$(date +%s)

GATEWAYS=(
    "https://dweb.link/ipfs"
    "https://cloudflare-ipfs.com/ipfs"
    "https://gateway.pinata.cloud/ipfs"
)

for gateway in "${GATEWAYS[@]}"; do
    echo -n "   Testing $(echo $gateway | cut -d'/' -f3)... "
    if curl -s -I "$gateway/$CID/?cb=$TIMESTAMP" | grep -q "200 OK"; then
        echo "✅ Available"
    else
        echo "⏳ Propagating..."
    fi
done

echo ""
echo "🌐 Your website is available at:"
echo "   🏠 Local:     http://localhost:8080/ipfs/$CID/"
echo "   🌍 Global:    https://dweb.link/ipfs/$CID/"
echo "   🔗 IPNS:      https://dweb.link/ipns/$IPNS/"
echo "   📌 Pinata:    https://gateway.pinata.cloud/ipfs/$CID/"
echo ""
echo "⚠️  Update Unstoppable Domains with: $CID"

# Copy to clipboard
if command -v xclip &> /dev/null; then
    echo "$CID" | xclip -selection clipboard
    echo "📋 CID copied to clipboard!"
fi

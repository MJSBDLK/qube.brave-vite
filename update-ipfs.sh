#!/bin/bash

# IPFS Website Update Script
# This script builds and publishes your website to IPFS

set -e

echo "🚀 Building website..."
npm run build

echo "📦 Adding to IPFS..."
CID=$(ipfs add -r -Q out/)
echo "✅ New CID: $CID"

# Save CID to file for easy access
echo "$CID" > latest-cid.txt
echo "💾 CID saved to: latest-cid.txt"

# Try to copy to clipboard if available
if command -v xclip &> /dev/null; then
    echo "$CID" | xclip -selection clipboard
    echo "� CID copied to clipboard!"
elif command -v pbcopy &> /dev/null; then
    echo "$CID" | pbcopy
    echo "📋 CID copied to clipboard!"
else
    echo "📋 Clipboard utility not found, but CID is saved to latest-cid.txt"
fi

echo "�🔗 Updating IPNS..."
IPNS=$(ipfs name publish $CID 2>&1 | grep -o 'k51[a-zA-Z0-9]*')
echo "✅ IPNS updated: $IPNS"

echo ""
echo "🌐 Your website is now available at:"
echo "   CID:  https://dweb.link/ipfs/$CID/"
echo "   IPNS: https://dweb.link/ipns/$IPNS/"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "🔧 Update Unstoppable Domains with this CID:"
echo "   $CID"
echo ""
echo "💡 The CID is saved in 'latest-cid.txt' for easy copy/paste"
echo "   (Unfortunately UD doesn't support IPNS, so you need to"
echo "    update this manually each time you publish changes)"

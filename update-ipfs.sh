#!/usr/bin/env bash

# IPFS Website Update Script (hardened)
# Builds the site, publishes `out/` to the local IPFS node, writes the CID
# to latest-cid.txt atomically and attempts to update IPNS.

set -euo pipefail

# Run from repository root (script location)
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Building website..."
npm run build

# Ensure build produced the out/ directory
if [ ! -d "out" ]; then
  echo "❌ Build did not produce an 'out/' directory. Aborting." >&2
  exit 2
fi

if ! command -v ipfs >/dev/null 2>&1; then
  echo "❌ 'ipfs' CLI not found in PATH. Install go-ipfs (kubo) and retry." >&2
  exit 2
fi

echo "📦 Adding 'out/' to IPFS..."
CID=$(ipfs add -r -Q out/)
echo "✅ New CID: $CID"

# Atomic write of latest-cid.txt
TMPFILE=$(mktemp latest-cid.txt.XXXX)
echo "$CID" > "$TMPFILE"
mv -f "$TMPFILE" latest-cid.txt
echo "💾 CID saved to: latest-cid.txt"

# Try to copy to clipboard if available
if command -v xclip &> /dev/null; then
    echo -n "$CID" | xclip -selection clipboard
    echo "📋 CID copied to clipboard!"
elif command -v pbcopy &> /dev/null; then
    echo -n "$CID" | pbcopy
    echo "📋 CID copied to clipboard!"
else
    echo "📋 Clipboard utility not found; CID saved to latest-cid.txt"
fi

echo "🔗 Attempting to update IPNS..."
# Capture full output and try to extract a peer-style key (k51...)
IPNS_RAW=$(ipfs name publish "$CID" 2>&1 || true)
IPNS=$(printf '%s' "$IPNS_RAW" | grep -o 'k51[a-zA-Z0-9]*' || true)
if [ -n "$IPNS" ]; then
  echo "✅ IPNS updated: $IPNS"
else
  echo "⚠️  IPNS publish output did not contain a k51... id."
  echo "   Raw output:"
  printf '%s
'"$IPNS_RAW"
fi

echo
echo "🌐 Your website is now available at:"
echo "   CID:  https://dweb.link/ipfs/$CID/"
if [ -n "$IPNS" ]; then
  echo "   IPNS: https://dweb.link/ipns/$IPNS/"
fi
echo
echo "⚠️  MANUAL STEP REQUIRED:"
echo "🔧 Update Unstoppable Domains with this CID:"
echo "   $CID"
echo
echo "💡 The CID is saved in 'latest-cid.txt' for easy copy/paste"
echo "   (UD does not support IPNS updates automatically; update manually)"

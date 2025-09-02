#!/bin/bash

# Quick CID display script

if [ -f "latest-cid.txt" ]; then
    CID=$(cat latest-cid.txt)
    echo "🔗 Current CID for Unstoppable Domains:"
    echo "   $CID"
    echo ""
    echo "📋 Copy this to update your domain settings"
    
    # Try to copy to clipboard if available
    if command -v xclip &> /dev/null; then
        echo "$CID" | xclip -selection clipboard
        echo "✅ Copied to clipboard!"
    elif command -v pbcopy &> /dev/null; then
        echo "$CID" | pbcopy
        echo "✅ Copied to clipboard!"
    fi
else
    echo "❌ No CID found. Run './update-ipfs.sh' first."
fi

#!/bin/bash

# Multi-Pinning IPFS Deployment Script
# Automatically pins to multiple services for Web2-speed global availability

set -e

# Load environment variables if .env exists
if [ -f .env ]; then
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building website...${NC}"
npm run build

echo -e "${BLUE}📦 Adding to local IPFS...${NC}"
CID=$(ipfs add -r -Q out/)
echo -e "${GREEN}✅ New CID: $CID${NC}"

# Save CID
echo "$CID" > latest-cid.txt

# Force announce locally
echo -e "${BLUE}📡 Announcing to local IPFS network...${NC}"
ipfs routing provide $CID

# Pin to multiple services for Web2 speed
echo -e "${YELLOW}⚡ Deploying to pinning services...${NC}"

# Pinata - Upload files directly (free tier compatible)
if [ ! -z "$PINATA_JWT" ]; then
    echo -e "${BLUE}📌 Uploading to Pinata...${NC}"
    
    # Create a tar archive of the out directory
    tar -czf out.tar.gz -C out .
    
    PINATA_RESPONSE=$(curl -s -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" \
         -H "Authorization: Bearer $PINATA_JWT" \
         -F "file=@out.tar.gz" \
         -F "pinataMetadata={\"name\":\"qube-brave-$(date +%Y%m%d-%H%M%S)\"}")
    
    # Clean up tar file
    rm -f out.tar.gz
    
    if echo "$PINATA_RESPONSE" | grep -q "IpfsHash"; then
        PINATA_CID=$(echo "$PINATA_RESPONSE" | grep -o '"IpfsHash":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Uploaded to Pinata: $PINATA_CID${NC}"
        
        # If Pinata CID differs from local, prefer Pinata's (it's the same content)
        if [ "$PINATA_CID" != "$CID" ]; then
            echo -e "${YELLOW}⚠️  Pinata CID differs from local. Using Pinata's CID for better performance.${NC}"
            CID=$PINATA_CID
            echo "$CID" > latest-cid.txt
        fi
    else
        echo -e "${RED}❌ Pinata failed: $PINATA_RESPONSE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PINATA_JWT not set - skipping Pinata${NC}"
fi

# Web3.Storage
if [ ! -z "$WEB3_STORAGE_TOKEN" ]; then
    echo -e "${BLUE}📌 Pinning to Web3.Storage...${NC}"
    WEB3_RESPONSE=$(curl -s -X POST "https://api.web3.storage/pins" \
         -H "Authorization: Bearer $WEB3_STORAGE_TOKEN" \
         -H "Content-Type: application/json" \
         -d "{
             \"cid\":\"$CID\",
             \"name\":\"qube-brave-$(date +%Y%m%d-%H%M%S)\"
         }")
    
    if echo "$WEB3_RESPONSE" | grep -q "requestid\|created"; then
        echo -e "${GREEN}✅ Pinned to Web3.Storage${NC}"
    else
        echo -e "${RED}❌ Web3.Storage failed: $WEB3_RESPONSE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  WEB3_STORAGE_TOKEN not set - skipping Web3.Storage${NC}"
fi

# Filebase (Pinata alternative)
if [ ! -z "$FILEBASE_TOKEN" ]; then
    echo -e "${BLUE}📌 Pinning to Filebase...${NC}"
    FILEBASE_RESPONSE=$(curl -s -X POST "https://api.filebase.io/v1/ipfs/pins" \
         -H "Authorization: Bearer $FILEBASE_TOKEN" \
         -H "Content-Type: application/json" \
         -d "{
             \"cid\":\"$CID\",
             \"name\":\"qube-brave-$(date +%Y%m%d-%H%M%S)\"
         }")
    
    if echo "$FILEBASE_RESPONSE" | grep -q "requestId\|created"; then
        echo -e "${GREEN}✅ Pinned to Filebase${NC}"
    else
        echo -e "${RED}❌ Filebase failed: $FILEBASE_RESPONSE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  FILEBASE_TOKEN not set - skipping Filebase${NC}"
fi

# Update IPNS
echo -e "${BLUE}🔗 Updating IPNS...${NC}"
IPNS=$(ipfs name publish $CID 2>&1 | grep -o 'k51[a-zA-Z0-9]*')
echo -e "${GREEN}✅ IPNS updated: $IPNS${NC}"

# Test multiple gateways for availability
echo ""
echo -e "${BLUE}🧪 Testing global availability...${NC}"
TIMESTAMP=$(date +%s)

declare -A GATEWAYS=(
    ["dweb.link"]="https://dweb.link/ipfs"
    ["cloudflare"]="https://cloudflare-ipfs.com/ipfs"
    ["pinata"]="https://gateway.pinata.cloud/ipfs"
    ["filebase"]="https://ipfs.filebase.io/ipfs"
    ["4everland"]="https://ipfs.4everland.io/ipfs"
)

AVAILABLE_GATEWAYS=()

for name in "${!GATEWAYS[@]}"; do
    gateway="${GATEWAYS[$name]}"
    echo -n "   Testing $name... "
    
    if timeout 10 curl -s -I "$gateway/$CID/?cb=$TIMESTAMP" | grep -q "200 OK\|301\|302"; then
        echo -e "${GREEN}✅ Available${NC}"
        AVAILABLE_GATEWAYS+=("$gateway/$CID/")
    else
        echo -e "${YELLOW}⏳ Propagating...${NC}"
    fi
done

# Copy to clipboard
if command -v xclip &> /dev/null; then
    echo "$CID" | xclip -selection clipboard
    echo -e "${GREEN}📋 CID copied to clipboard!${NC}"
fi

echo ""
echo -e "${GREEN}🌐 Your website is now available at:${NC}"
echo -e "   🏠 Local:     http://localhost:8080/ipfs/$CID/"
echo -e "   🔗 IPNS:      https://dweb.link/ipns/$IPNS/"

if [ ${#AVAILABLE_GATEWAYS[@]} -gt 0 ]; then
    echo -e "${GREEN}   ⚡ Fast gateways (immediately available):${NC}"
    for gateway_url in "${AVAILABLE_GATEWAYS[@]}"; do
        echo -e "      $gateway_url"
    done
else
    echo -e "${YELLOW}   ⏳ Global propagation in progress (5-15 minutes)${NC}"
fi

echo ""
echo -e "${YELLOW}⚠️  MANUAL STEP REQUIRED:${NC}"
echo -e "${BLUE}🔧 Update Unstoppable Domains with this CID:${NC}"
echo -e "   $CID"
echo ""
echo -e "${GREEN}💡 Multiple pinning services ensure fast global availability!${NC}"

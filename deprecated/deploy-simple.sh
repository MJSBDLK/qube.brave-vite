#!/bin/bash

# Simple Vite → Existing IPFS Workflow
# Builds with Vite, deploys with proven NextJS system

set -e

echo "🚀 Building with Vite..."
cd /var/www/qube.brave-vite
npm run build

echo "📦 Copying to deployment directory..."
cp -r out/* /var/www/qube.brave/out/

echo "🌐 Publishing with existing IPFS workflow..."
cd /var/www/qube.brave
./update-ipfs.sh

echo "✅ Done! Your Vite app is live using the proven deployment system."

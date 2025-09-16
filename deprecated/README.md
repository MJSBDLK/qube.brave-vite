# Deprecated Files

This directory contains old deployment scripts and configurations that are no longer in use but are kept for reference.

## Deprecated Scripts

- `deploy-simple.sh` - Old simple deployment script
- `deploy-web2-speed.sh` - Old web2 speed deployment script  
- `deploy-multi-pin.sh` - Old multi-pin deployment script (was `publish:fast`)
- `update-ipfs-fast.sh` - Old fast IPFS update script

## Current Deployment

The current deployment uses:
- `npm run publish:all` - Unified script that builds, publishes to IPFS, and updates Docker container
- `update-ipfs.sh` - Current IPFS publishing script
- `docker-compose.yml` - Docker container management

## Migration Date
These files were moved to deprecated on September 16, 2025 during the documentation cleanup and workflow unification.
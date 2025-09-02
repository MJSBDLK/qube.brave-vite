# Current Tech Stack - qube.brave (Vite Migration)

**Updated:** September 2025  
**Status:** Production Ready & Migrated to Vite

## Architecture Overview

```
Internet/LAN → nginx (reverse proxy) → Docker Container → Vite App
                ↓
         Dell OptiPlex 7070 Ubuntu Server 24.04 LTS
                ↓
         IPFS Node (Kubo) → Distributed Web3 Network
```

## Core Technology Stack

### **Frontend Application**
- **Framework**: Vite 7.1.4 + React 18.3.1 (migrated from Next.js for IPFS compatibility)
- **Routing**: React Router 6.26.1 (HashRouter for IPFS static hosting)
- **Language**: JavaScript (ESX/JSX - Vanilla JS over TypeScript for development speed)
- **Styling**: Custom CSS design system (Tailwind temporarily disabled due to v4 conflicts)
- **Build Target**: Static SPA (Single Page Application)
- **Web3 Deployment**: IPFS static export (base: './' for gateway compatibility)
- **Domain Strategy**: Unstoppable Domains (.brave TLD) with IPFS CID updates

### **Backend Infrastructure** 
- **Server OS**: Ubuntu Server 24.04 LTS
- **Web Server**: nginx (reverse proxy + SSL termination)
- **Container Runtime**: Docker + Docker Compose
- **Process Management**: Docker containers (replaced PM2 for isolation)
- **Database**: PostgreSQL (installed, ready for use)
- **IPFS Node**: Kubo v0.37.0 (lightweight configuration for Web3 hosting)

### **Web3 Infrastructure**
- **IPFS Implementation**: Kubo (go-ipfs) - official Go implementation
- **Node Type**: Lightweight client (DHT client mode only)
- **Resource Usage**: ~160MB RAM (configured minimal vs 6GB default)
- **Network Role**: Content hosting + retrieval (not full DHT server)
- **Startup**: systemd service (auto-start on boot)

### **Development Stack**
- **Runtime**: Node.js 22.x LTS
- **Package Manager**: npm
- **Version Control**: Git (connected to GitHub)
- **Editor**: VS Code Remote-SSH

## Migration Rationale: Next.js → Vite

### **Problems Solved**
- **CSS Path Issues**: Next.js had problems with CSS asset paths on IPFS gateways
- **Routing Conflicts**: App Router doesn't work well with static IPFS hosting
- **Build Complexity**: Simpler static build process with Vite
- **IPFS Compatibility**: Better support for hash-based routing

### **Migration Benefits**
- **Faster Development**: ~171ms startup vs Next.js dev server
- **Smaller Bundle**: 277KB vs previous larger Next.js bundles
- **IPFS Optimized**: Native static export with proper relative paths
- **Simpler Routing**: HashRouter provides clean IPFS URLs (/#/ramps/)

## Deployment Architecture

### **Container Strategy**
- **Base Image**: `nginx:alpine` (switched from node:22-alpine to avoid npm install issues)
- **Build Process**: Host-based build (bypasses Alpine npm issues completely)
- **Container Role**: Static file serving only (no npm install required in container)
- **Security**: nginx runs as non-root user within isolated container

### **Traffic Flow**
1. **External Request** → nginx (port 80/443)
2. **nginx** → Docker container (port 3001 → nginx:80)
3. **Container** → nginx serving static files from /usr/share/nginx/html/
4. **Response** flows back through same path

### **Network Configuration**
- **Internal**: Static IP 192.168.1.100
- **Container**: Isolated Docker network
- **Firewall**: UFW enabled (SSH, HTTP, HTTPS only)
- **Authentication**: SSH key-based access

## File Structure

```
/var/www/qube.brave-vite/
├── src/                    # Vite application source
│   ├── App.jsx            # Main application with HashRouter
│   ├── main.jsx           # Application entry point
│   ├── components/        # Shared React components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── Update.jsx
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Homepage
│   │   └── Ramps.jsx      # Gradient ramps tool entry
│   └── pages/ramps/       # Gradient ramps tool
│       ├── components/    # Tool-specific components
│       ├── hooks/         # Custom hooks
│       └── utils/         # Utility functions
├── public/                # Static assets
├── out/                   # Static export output (IPFS-ready)
├── node_modules/          # Dependencies (host-installed)
├── latest-cid.txt         # Current IPFS CID (auto-generated)
├── update-ipfs.sh         # IPFS publishing script
├── get-cid.sh            # CID retrieval helper
├── Dockerfile             # Container configuration
├── vite.config.js         # Vite configuration (IPFS-optimized)
├── package.json           # Project dependencies
├── tailwind.config.js     # Tailwind configuration (currently disabled)
└── postcss.config.mjs     # PostCSS configuration
```

## Development Workflow

### **Daily Development**
1. **Connect**: VS Code Remote-SSH to server
2. **Edit**: Direct file editing on server via remote session
3. **Test**: Local development server (`npm run dev` - port 3001)
4. **Build**: Static build process (`npm run build`)
5. **Deploy Traditional**: Container rebuild (`sudo docker compose up --build -d`)
6. **Deploy Web3**: IPFS publish (`./update-ipfs.sh`) + update Unstoppable Domains

### **Web3 Publishing Process**
1. **Build for IPFS**: Static export with relative asset paths (`npm run build`)
2. **Add to IPFS**: Content gets CID (Content Identifier) via `./update-ipfs.sh`
3. **Update IPNS**: Mutable pointer for future updates
4. **Update Domain**: Paste new CID into Unstoppable Domains (manual step)
5. **Propagation**: 15-30 minutes for blockchain + DNS propagation

### **Vite-Specific Commands**
```bash
# Development server
npm run dev          # Starts dev server on port 3001

# Production build
npm run build        # Static export to out/ directory

# Preview build
npm run preview      # Preview production build locally

# IPFS publish
./update-ipfs.sh     # Build and publish to IPFS
```

## Key Design Decisions

### **Migration Architecture Choices**
- **Vite over Next.js**: Better IPFS compatibility, simpler static builds
- **HashRouter over BrowserRouter**: Required for IPFS static hosting
- **Custom CSS over Tailwind**: Avoided v4 PostCSS conflicts during migration
- **JSX file extensions**: Explicit JSX files for better Vite optimization
- **Trailing slashes**: IPFS-compatible routing (/#/ramps/ vs /#/ramps)

### **Vite Configuration Rationale**
- **Base: './'**: Relative paths for IPFS gateway compatibility
- **outDir: 'out'**: Consistent with existing IPFS workflow
- **Port 3001**: Avoids conflicts with potential Next.js instances
- **Hash mode router**: Essential for static IPFS hosting

### **IPFS Configuration Rationale**
- **Minimal resource usage**: Configured for hosting, not serving entire network
- **DHT Client Mode**: Finds content without serving routing info to others
- **Reduced peer connections**: 20-50 peers vs default hundreds
- **Daily garbage collection**: Prevents excessive disk usage
- **systemd integration**: Automatic startup, logging, restart on failure

### **Development Philosophy**
- **Tight margins/padding**: Compact UI design preference
- **Code organization**: Clear separation of pages, components, utilities
- **Performance optimization**: Minimal bundle size, fast load times

## Current Status

### **Migration Completed**
- ✅ Vite 7.1.4 application successfully deployed
- ✅ React Router 6 with HashRouter implemented
- ✅ All components migrated (Header, Footer, Sidebar, Ramps tool)
- ✅ IPFS publishing workflow preserved
- ✅ Docker containerization updated
- ✅ Development server operational (port 3001)
- ✅ Build system producing 277KB optimized bundle

### **Current Build Performance**
- **Build Time**: ~1.84s (Vite optimization)
- **Bundle Size**: 
  - CSS: 55.67 kB (gzipped: 10.46 kB)
  - JS: 277.26 kB (gzipped: 87.90 kB)
- **Dev Server Startup**: ~171ms

### **Functional Features**
- ✅ Single Page Application with hash routing
- ✅ Gradient Ramps tool fully functional
- ✅ IPFS static export working
- ✅ Docker containerization operational
- ✅ nginx reverse proxy ready
- ✅ Web3 domain strategy preserved

### **Current IPFS Status**
- **Node ID**: 12D3KooWENjh9U4a4eRkD7uVeEFPBswiLrDdPqSBffraSuzMPc8V
- **IPNS**: k51qzi5uqu5dhvcu5wmucgbak7c1s3n00kau0n7q41r7g6dplhoanliji4z8fi
- **Service Status**: systemd managed, auto-restart enabled
- **Gateway Access**: https://dweb.link/ipfs/[CID]/

## Dependencies & Compatibility

### **Production Dependencies**
```json
{
  "lucide-react": "^0.542.0",    // Icons (IPFS-compatible)
  "react": "^18.3.1",            // Core framework
  "react-dom": "^18.3.1",        // DOM rendering
  "react-router-dom": "^6.26.1"  // Client-side routing
}
```

### **Development Dependencies**
```json
{
  "@vitejs/plugin-react": "^4.3.1",
  "vite": "^7.1.4"
}
```

### **Removed Dependencies** (from Next.js migration)
- next (Next.js framework)
- @next/font (replaced with standard web fonts)
- Various Next.js-specific packages

## Migration Lessons Learned

### **Technical Challenges Overcome**
1. **PostCSS Conflicts**: Tailwind v4 configuration conflicts resolved by temporary disable
2. **File Extensions**: Vite requires explicit .jsx extensions for JSX files
3. **Routing Strategy**: HashRouter essential for IPFS static hosting
4. **Asset Paths**: Vite's base: './' handles IPFS relative paths correctly
5. **Import Resolution**: React Router imports needed updates from Next.js patterns

### **Performance Improvements**
- **Development Speed**: Significantly faster hot reload and dev server startup
- **Build Speed**: 1.84s vs previous Next.js build times
- **Bundle Optimization**: Better tree shaking and chunk splitting
- **IPFS Compatibility**: Native static export without Next.js complications

## Future Considerations

### **Immediate Priorities**
- **Tailwind Re-integration**: Resolve PostCSS v4 compatibility issues
- **CSS Optimization**: Further bundle size reduction
- **Performance Testing**: IPFS gateway load testing
- **Error Boundaries**: Add React error handling for production

### **Scaling Options**
- Docker Compose ready for additional services
- PostgreSQL configured for future data persistence
- nginx ready for SSL and advanced routing
- **Component Library**: Extract reusable components for future tools

### **IPFS Infrastructure Scaling**
- **Pinning Services**: Consider Pinata, NFT.Storage for redundancy
- **Multiple Gateways**: Reduce single point of failure
- **Content Distribution**: Geographic pinning for performance
- **Automated Updates**: Potential UD API integration for CID updates

### **Security Enhancements**
- **IPFS Access Control**: Currently local-only API/gateway
- **Content Verification**: Automatic integrity checking
- **Backup Strategy**: IPNS key backup (critical for domain control)
- **Monitoring**: IPFS node health checking and alerting

## Troubleshooting Guide

### **Vite-Specific Issues**

#### **Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules out .vite
npm install
npm run build
```

#### **Import Errors**
- Ensure all JSX files have .jsx extension
- Check React Router imports (useLocation vs usePathname)
- Verify lucide-react icon imports

#### **Routing Issues**
- Confirm HashRouter is used (not BrowserRouter)
- Check trailing slashes in routes (/#/ramps/ not /#/ramps)
- Verify base: './' in vite.config.js for IPFS

#### **IPFS Deployment Issues**
- Ensure build outputs to 'out/' directory
- Check asset paths are relative (no leading slash)
- Test with local IPFS gateway first

#### **Docker Build Issues**
- **npm install stuck**: Use nginx:alpine base image instead of node:22-alpine
- **Network timeouts**: Build dependencies on host, copy pre-built files to container
- **Alpine npm issues**: Avoid running npm commands inside Alpine containers
- **Container won't start**: Check port mapping (3001:80 for nginx, 3001:3000 for node)

### **Development Workflow**
```bash
# Start development
cd /var/www/qube.brave-vite
npm run dev

# Build for production
npm run build

# Test IPFS deployment
./update-ipfs.sh

# View IPFS content locally
cat latest-cid.txt
curl http://localhost:8080/ipfs/$(cat latest-cid.txt)/
```

## Migration Success Metrics

- ✅ **Build Performance**: 60% faster build times (1.84s vs ~4.4s)
- ✅ **Bundle Size**: Optimized 277KB total bundle
- ✅ **Development Speed**: Sub-second hot reload
- ✅ **IPFS Compatibility**: Native static export support
- ✅ **Code Maintainability**: Cleaner separation of concerns
- ✅ **Future Scalability**: Vite ecosystem and plugin support

The migration successfully addresses the original CSS/routing issues with IPFS while maintaining all existing functionality and improving development experience.

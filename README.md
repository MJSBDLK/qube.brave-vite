# qube.brave - Decentralized Website

A modern React application deployed both traditionally and on IPFS (InterPlanetary File System) for decentralized web hosting.

## 🚀 Quick Start

### Development
```bash
# Start development server
npm run dev
# → Available at http://localhost:3000
```

### Deployment
```bash
# Deploy everywhere (IPFS + External IP)
npm run publish:all
# → Builds, publishes to IPFS, updates Docker container
# → Available at your external IP and IPFS gateways
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build static files to `out/` directory |
| `npm run preview` | Preview production build locally |
| `npm run publish` | Publish to IPFS only |
| `npm run publish:all` | **Complete deployment** - IPFS + Docker update |
| `npm run ipfs:cid` | Get current IPFS Content ID |

## 🏗️ Architecture

```
Internet/LAN → nginx (reverse proxy) → Docker Container → Vite App
                ↓
         Ubuntu Server (192.168.1.100)
                ↓
         IPFS Node → Distributed Web3 Network
```

### Access Points
- **Development**: `http://localhost:3000` (when running `npm run dev`)
- **External IP**: `http://YOUR_EXTERNAL_IP` (via nginx → Docker)
- **IPFS**: `https://dweb.link/ipfs/[CID]/` or `qube.brave` (Unstoppable Domain)

## 🛠️ Tech Stack

- **Frontend**: Vite 7.1.4 + React 18.3.1
- **Routing**: React Router (HashRouter for IPFS compatibility)
- **Styling**: Custom CSS (Tailwind temporarily disabled)
- **Container**: Docker + nginx:alpine
- **Web Server**: nginx (reverse proxy)
- **IPFS**: Kubo (go-ipfs) full DHT node
- **Domain**: Unstoppable Domains (.brave TLD)

## 📁 Project Structure

```
/var/www/qube.brave-vite/
├── src/                     # React application source
│   ├── App.jsx             # Main app with HashRouter
│   ├── components/         # Shared components
│   ├── pages/              # Page components
│   └── utils/              # Utilities
├── public/                 # Static assets
├── out/                    # Built files (Docker + IPFS)
├── deprecated/             # Old scripts (kept for reference)
├── docker-compose.yml      # Container configuration
├── Dockerfile             # nginx:alpine setup
├── update-ipfs.sh         # IPFS publishing script
└── package.json           # Dependencies + scripts
```

## 🔄 Deployment Workflow

### Current Unified Process
1. **Edit code** in VS Code (Remote-SSH)
2. **Deploy everywhere**: `npm run publish:all`
   - Builds Vite app → `out/` directory
   - Publishes to IPFS → Gets new CID
   - Rebuilds Docker container → Updates external IP
   - Takes ~30 seconds total

### Manual Updates (if needed)
- **IPFS only**: `npm run publish`
- **Docker only**: `docker compose up -d --build`
- **Unstoppable Domain**: Manually paste new CID from `latest-cid.txt`

## 🌐 IPFS Integration

### Current Status
- **Node ID**: 12D3KooWENjh9U4a4eRkD7uVeEFPBswiLrDdPqSBffraSuzMPc8V
- **Mode**: Full DHT (content advertisement enabled)
- **Gateway**: `http://localhost:8080/ipfs/[CID]/`
- **Current CID**: Check `latest-cid.txt`

### IPFS Features
- **Decentralized hosting**: Content distributed across global network
- **Censorship resistance**: No single point of failure
- **Version history**: Each update gets unique CID
- **Fast CDN**: Cached at global IPFS gateways

## 🐳 Docker Container

The site runs in a lightweight nginx:alpine container:
- **Base Image**: `nginx:alpine` (~6MB)
- **Port Mapping**: Host 3001 → Container 80
- **Content**: Static files copied from `out/` directory
- **Proxy**: nginx on host forwards to container

## ⚡ Performance

- **Build Time**: ~1.84s (Vite optimization)
- **Bundle Size**: 277KB total (87KB gzipped)
- **Dev Server**: ~171ms startup
- **Hot Reload**: Sub-second updates

## 🔧 Development

### Prerequisites
- Node.js 22.x LTS
- Docker & Docker Compose
- IPFS (Kubo)
- nginx (system service)

### Getting Started
1. **Clone/Access**: Already set up in `/var/www/qube.brave-vite/`
2. **Dependencies**: `npm install` (already done)
3. **Development**: `npm run dev`
4. **Deploy**: `npm run publish:all`

### Development Tips
- **File Extensions**: Use `.jsx` for React components
- **Routing**: Use HashRouter routes like `/#/ramps/`
- **Assets**: Keep in `public/` for proper IPFS paths
- **CSS**: Custom CSS in `src/index.css`

## 🚨 Troubleshooting

### IPFS Issues
```bash
# Check IPFS status
ipfs config Routing.Type  # Should be "dht" (not "dhtclient")

# Test local gateway
curl http://localhost:8080/ipfs/$(cat latest-cid.txt)/

# Test external gateway
curl -s "https://dweb.link/ipfs/$(cat latest-cid.txt)/" | head -5
```

### Docker Issues
```bash
# Check container status
docker ps

# View container logs  
docker logs qube-brave-vite-app

# Rebuild container
docker compose up -d --build
```

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules out .vite
npm install
npm run build
```

## 📚 Documentation

- **[TECH_STACK.md](./TECH_STACK.md)**: Comprehensive technical documentation
- **[IPFS_URL_SOLUTION.md](./IPFS_URL_SOLUTION.md)**: IPFS UX enhancements
- **[deprecated/](./deprecated/)**: Old scripts and configurations

## 🔒 Security

- **SSH**: Key-based authentication only
- **Firewall**: UFW enabled (SSH, HTTP, HTTPS only)
- **Container**: Isolated Docker network
- **IPFS**: Local API only (not exposed externally)

## 📈 Migration Success

Migrated from Next.js to Vite (September 2025):
- ✅ 60% faster build times
- ✅ Better IPFS compatibility  
- ✅ Simplified deployment
- ✅ Maintained all functionality
- ✅ Improved development experience

## 🤝 Contributing

This is a personal project, but the architecture and scripts can serve as reference for similar IPFS + Docker deployments.

---

**Last Updated**: September 16, 2025  
**Status**: Production Ready  
**Access**: [qube.brave](https://qube.brave) (Unstoppable Domain) | External IP
# IPFS URL Display Solution

## Problem
When serving your website over IPFS, users see indecipherable hash URLs instead of the friendly "qube.brave" domain name they typed in.

## Solution Overview
Since we can't change the browser's address bar when accessing via IPFS hash, we've implemented several enhancements to maintain brand consistency and improve user experience:

### 1. Enhanced Header Display
- **File**: `src/components/Header.jsx`
- **What it does**: Always displays "qube.brave" in the header regardless of the IPFS hash URL
- **Routes handled**: 
  - `/` → "qube.brave"
  - `/ramps` → "qube.brave/ramps"
  - Other routes → "qube.brave{pathname}"

### 2. IPFS Detection & User Education
- **Files**: 
  - `src/utils/urlUtils.js` - Detection logic
  - `src/components/IPFSIndicator.jsx` - UI component
- **What it does**: 
  - Detects when users are accessing via IPFS
  - Shows a subtle 🌐 indicator in the header
  - Displays educational tooltip explaining decentralized hosting
  - Encourages users to bookmark "qube.brave" for easier access

### 3. SEO & Metadata Improvements
- **Files**: 
  - `src/App.jsx` - Dynamic metadata updates
  - `index.html` - Base canonical URL
- **What it does**:
  - Sets canonical URLs pointing to qube.brave
  - Updates page titles dynamically
  - Improves SEO and bookmarking experience

## IPFS Gateway Detection
The system detects IPFS access via these patterns:
- `*.ipfs.*` (gateway patterns like dweb.link)
- Direct CID hostnames (both CIDv0 and CIDv1)
- IPNS keys (starting with k51...)
- Common IPFS gateways (dweb.link, ipfs.io, cf-ipfs.com)

## User Experience
1. **Browser URL**: Shows IPFS hash (can't be changed)
2. **App Header**: Always shows "qube.brave" (consistent branding)
3. **IPFS Indicator**: Appears when accessing via IPFS with helpful tooltip
4. **Page Title**: Shows friendly URLs in browser tab
5. **Canonical URLs**: Help with SEO and bookmarking

## Unstoppable Domains Integration
Your existing setup with Unstoppable Domains still works perfectly:
- Users can access via qube.brave → redirects to IPFS
- Manual CID updates still required (UD doesn't support IPNS)
- Your `update-ipfs.sh` script handles publishing workflow

## Implementation Notes
- Uses React Router's `useLocation` for route detection
- CSS animations for smooth tooltip appearance
- Responsive design for mobile/desktop
- Accessible with proper ARIA labels
- Performance optimized with minimal bundle impact

## Usage
Simply continue your normal workflow:
1. Build: `npm run build`
2. Publish: `npm run publish` (runs your update-ipfs.sh script)
3. Update Unstoppable Domains with the new CID

Users will now see consistent branding and understand they're on the decentralized version!

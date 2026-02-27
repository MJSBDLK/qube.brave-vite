# qube.brave Architecture Instructions

## Critical Constraints (MUST FOLLOW)

### 1. HashRouter Required for IPFS
- **ALWAYS** use `HashRouter` from react-router-dom (NEVER `BrowserRouter`)
- All routes must be hash-based (e.g., `/#/ramps`)
- Routes should handle both `/path` and `/path/` for flexibility
- **Why**: IPFS static hosting has no server-side routing

### 2. JSX Extensions Required
- **ALL** React components must use `.jsx` extension (not `.js`)
- Vanilla JavaScript utilities use `.js`
- **Why**: Vite optimization requirement

### 3. Dual Deployment Architecture
- Every build deploys to BOTH Docker container AND IPFS
- Must use relative paths: `base: './'` in vite.config.js
- Build output: `out/` directory (not `dist/` or `build/`)
- Deploy command: `npm run publish:all`

### 4. Host-Based Build Strategy
- **NEVER** suggest installing npm packages in Docker container
- All builds run on host Ubuntu system
- Container only serves pre-built static files from `out/`
- **Why**: Avoids Alpine Linux npm installation issues

## Project Overview

**qube.brave** is a React + Vite personal website with IPFS support, migrated from Next.js in Sept 2025 for better decentralized web compatibility.

**Tech Stack**:
- Build: Vite 7.1.4
- Framework: React 19.1.1
- Routing: React Router 7.8.2 (HashRouter)
- Styling: Custom CSS (2,146 lines) + ramps.css (3,385 lines)
- Container: Docker + nginx:alpine
- IPFS: Kubo v0.37.0 (full DHT mode)
- Domain (Web2): mjsbdlk.com (Njalla)
- Domain (Web3): qube.brave (Unstoppable Domains)

## File Organization Patterns

### Adding a Simple Page

**See [NEW_PAGE_CHECKLIST.md](../NEW_PAGE_CHECKLIST.md) for the full checklist.**

Quick reference:
1. Create component: `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`:
   ```jsx
   <Route path="/newpage" element={
     <ErrorBoundary><NewPage /></ErrorBoundary>
   } />
   ```
3. Add navigation in `src/components/Sidebar.jsx`
4. Add homepage card in `src/pages/Home.jsx`
5. Update metadata in `App.jsx` `getPageInfo()` function

### Adding a Complex Tool (like Ramps)

**Pattern**: Self-contained tool directory with local dependencies

```
src/pages/mytool/
├── MyTool.jsx           # Main tool component
├── mytool.css           # Tool-specific styles
├── components/          # Tool-specific components
│   ├── Subcomponent1.jsx
│   └── Subcomponent2.jsx
├── hooks/               # Custom hooks for tool logic
│   ├── useMyTool.js
│   └── useMyToolState.js
└── utils/               # Tool-specific utilities
    ├── myToolUtils.js
    └── helpers.js
```

**Entry wrapper pattern**: `src/pages/MyTool.jsx`
```jsx
import React from 'react'
import './mytool/mytool.css'
import MyToolMain from './mytool/MyTool'

export default function MyTool() {
  return <MyToolMain />
}
```

**Benefits**: Clear boundaries, easy maintenance, self-documenting

### Custom Hooks Pattern

Extract complex state logic into custom hooks:

```jsx
// src/pages/mytool/hooks/useMyTool.js
export function useMyTool() {
  const [state, setState] = useState(null)

  // Complex logic here

  return { state, actions }
}
```

**Why**: Reusable logic, testable, keeps components clean

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Component | PascalCase.jsx | `Header.jsx` |
| Utility | camelCase.js | `urlUtils.js` |
| Custom Hook | useCamelCase.js | `useColorSampling.js` |
| CSS | lowercase.css | `ramps.css` |

## CSS Architecture

### Design System (index.css)
- CSS custom properties in `:root` for theming
- Colors: `--color-primary`, `--bg-primary`, `--text-primary`
- Spacing: `--space-xs` through `--space-3xl`
- Layout: `--sidebar-width`, `--header-height`, `--footer-height`
- Transitions: `--transition-fast`, `--transition-normal`

### CSS Class Naming
- **Utilities**: `.u-*` prefix (`.u-mb-lg`, `.u-flex`)
- **Components**: `.c-*` prefix (`.c-button`, `.c-button--primary`)
- **Text**: `.text-*` (`.text-primary`, `.text-secondary`)
- **BEM-style**: `.component__element--modifier`

### Tailwind Status
- Configured but **currently disabled** due to v4 PostCSS conflicts
- Use custom CSS and utility classes instead

## Build & Deployment

### Development
```bash
npm run dev          # Start dev server (localhost:3000)
```

### Build
```bash
npm run build        # Build to out/ (~1.84s)
```

### Deployment
```bash
npm run publish:all  # Build + IPFS + Docker (~30s)
npm run publish      # IPFS only
docker compose up -d --build  # Docker only
```

### Deployment Workflow
1. `npm run build` creates static files in `out/`
2. `update-ipfs.sh` publishes to IPFS, saves CID to `latest-cid.txt`
3. **MANUAL**: Copy CID to Unstoppable Domains dashboard
4. Docker container serves from `out/` on port 3001

## Component Patterns

### Error Boundary Wrapping
**ALWAYS** wrap routes in ErrorBoundary:

```jsx
<Route path="/page" element={
  <ErrorBoundary><Page /></ErrorBoundary>
} />
```

### App Structure
```jsx
<HashRouter>
  <SpicyModeProvider>
    <AppLayout>
      <Header />
      <Sidebar />
      <main>
        <Routes>...</Routes>
      </main>
      <Footer />
    </AppLayout>
  </SpicyModeProvider>
</HashRouter>
```

## Data Management

### Changelog Pattern
- Centralized data: `src/data/changelog.js`
- Reusable component: `src/components/Changelog.jsx`
- Format:
  ```javascript
  {
    version: "v7.2.1",
    date: "Sep 17, 2025",
    changes: ["Change 1", "Change 2"]
  }
  ```

### localStorage Pattern
- Use custom hooks for persistence (see `useSavedRamps.js`)
- State in memory, sync to localStorage on changes
- Example: SpicyMode Context + localStorage

## IPFS-Specific Rules

### Must Follow for IPFS Compatibility
1. Relative paths only (`base: './'` in vite.config.js)
2. HashRouter required (no BrowserRouter)
3. No server-side routing
4. Static assets in `public/` (copied to `out/`)
5. Test locally: `http://localhost:8080/ipfs/[CID]/`

### IPFS Detection
- `urlUtils.js` provides `isIPFSAccess()` function
- Shows `<IPFSIndicator>` when accessed via gateway
- Maintains branding consistency across access methods

## Common Pitfalls to Avoid

### ❌ Don't Do This
```jsx
// ❌ BrowserRouter (breaks IPFS)
import { BrowserRouter } from 'react-router-dom'

// ❌ .js extension for React components
export default function MyComponent() {}  // in .js file

// ❌ Absolute paths in config
base: '/'  // breaks IPFS gateways

// ❌ npm install in Dockerfile
RUN npm install  // fails in Alpine

// ❌ Tailwind classes
<div className="p-4 m-2">  // Tailwind disabled
```

### ✅ Do This
```jsx
// ✅ HashRouter (IPFS compatible)
import { HashRouter } from 'react-router-dom'

// ✅ .jsx extension for React components
// src/components/MyComponent.jsx
export default function MyComponent() {}

// ✅ Relative paths in config
base: './'  // works everywhere

// ✅ Build on host
npm run build  // on Ubuntu host

// ✅ Custom CSS classes
<div className="u-p-lg u-m-md">  // custom utilities
```

## Brands Research Prompts

The brands page includes a two-tier AI research workflow with copy-to-clipboard prompts.

- **Source of truth**: `src/pages/brands/utils/prompts.js` — `getDiscoveryPrompt()` and `getDeepResearchPrompt()`
- **Documentation**: `public/data/brands/RESEARCH_PROMPT.md`
- **Data file**: `public/data/brands/brands.json`

### Workflow
1. **Discovery**: "I want to buy [product]" — generates shallow brand list (JSON array, `report: null`)
2. **Deep research**: Per-brand deep dive — generates a `report` object with inline `[N]` citations

### Updating prompts
- Edit `prompts.js` (the JS is what clipboard buttons use)
- Bump `promptVersion` in the JSON schema inside the prompt (e.g. `"0.1"` → `"0.2"`)
- Update `RESEARCH_PROMPT.md` to match
- Reports track which prompt version and model generated them via `promptVersion` and `model` fields

### Adding a new column (IMPORTANT)
When adding a new data field to the brands schema:
1. Add the field to the JSON schema in **both** `prompts.js` (discovery prompt) and `RESEARCH_PROMPT.md`
2. Add a column in `BrandsTable.jsx` — render `null` as `<span className="text-subtle">—</span>`
3. Add `fieldName: null` to all existing brands in `brands.json` (use a Node script)
4. Add filter UI in `FilterBar.jsx` if the field is filterable
5. Data availability convention:
   - **Field omitted** (key not in JSON object) = "not yet researched" — UI shows `—`
   - **`null`** (key present, value null) = "researched, no data found" — UI shows `N/A` (italic)
   - Use the `NoDataCell` helper in `BrandsTable.jsx` for consistent rendering

### Adding researched brands
- Paste discovery output into the `brands` array in `brands.json`
- For deep research, replace the brand's `"report": null` with the generated report object
- Set `"sample": false` (or omit) for real researched brands; seed data has `"sample": true`

## Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Architecture docs | [TECH_STACK.md](TECH_STACK.md) |
| Quick start | [README.md](README.md) |
| IPFS details | [IPFS_URL_SOLUTION.md](IPFS_URL_SOLUTION.md) |
| Changelog docs | [CHANGELOG_COMPONENT.md](CHANGELOG_COMPONENT.md) |
| Vite config | [vite.config.js](vite.config.js) |
| Main app | [src/App.jsx](src/App.jsx) |
| Design system | [src/index.css](src/index.css) |
| Routing | [src/App.jsx](src/App.jsx) |
| Navigation | [src/components/Sidebar.jsx](src/components/Sidebar.jsx) |

## SpicyMode (Future Feature)

- Global Context: `src/contexts/SpicyModeContext.jsx`
- Component: `src/components/SpicyWord.jsx`
- Status: **Currently disabled** (waiting for authentication)
- Don't remove - planned for future user authentication system

## Code Style

### Region Comments (Optional)
```jsx
// #region State Management
const [state, setState] = useState()
// #endregion /State Management
```

### Import Order
1. React imports
2. Third-party libraries
3. Local components
4. Utilities
5. CSS/Styles

## Performance Notes

- Build time: ~1.84s
- Bundle size: 277KB total (87KB gzipped)
- Dev server startup: ~171ms
- Hot reload: sub-second updates

## When Suggesting Changes

1. **Read files first** - Never propose changes to unread code
2. **Minimal changes** - Only change what's requested
3. **No over-engineering** - Keep it simple
4. **IPFS compatibility** - Always consider dual deployment
5. **Test locally** - Suggest testing at `localhost:3000` first
6. **Security** - Watch for XSS, injection, OWASP top 10

## Summary

This is a **dual-deployed React + Vite site** optimized for both traditional hosting and IPFS. The architecture prioritizes decentralized web compatibility while maintaining developer experience. Key differentiators: HashRouter for IPFS, host-based builds, page-level tool organization, and custom CSS design system.

**When in doubt**: Check [TECH_STACK.md](TECH_STACK.md) for comprehensive details.

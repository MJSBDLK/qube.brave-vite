# qube.brave - Feature Roadmap

---

## Current Branch: `rqd--inflation`

### Inflation Page Remaining Work
- [ ] Derive median work hours as far back as possible
- [ ] Derive stratified percentile work hours as far back as possible
- [ ] Commit new untracked data files (median-extended, p10/p25/p75/p90 wages)

---

## Feature: Fitness Log
**Branch:** `rqd--fitness`
**Potential subdomain:** qube.fit

### Phase 1 - MVP (Strong App Clone)
- [ ] Scaffold page per NEW_PAGE_CHECKLIST.md (route, sidebar, homepage card, meta)
- [ ] Design data model for workouts, exercises, sets, reps, weight
- [ ] Build exercise library (searchable list of exercises with muscle groups, equipment)
- [ ] Build workout logging UI (add exercises, log sets/reps/weight, rest timers)
- [ ] Workout history view (past sessions, filterable by date/exercise)
- [ ] Exercise progress tracking (charts per exercise over time)
- [ ] Data persistence (localStorage MVP, API backend later)
- [ ] Significantly more free options than Strong (no paywall on exercise count, charts, etc.)

### Phase 2 - Smart Programming
- [ ] Exercise rotation system (auto-rotate accessories in/out on a schedule)
- [ ] Periodization templates (linear, block, undulating)
- [ ] Deload week suggestions based on accumulated volume/fatigue

### Phase 3 - Trainer/Client
- [ ] Trainer accounts that can create/assign programs to clients
- [ ] Client progress dashboard visible to trainer
- [ ] Program templates that trainers can share/sell
- [ ] Messaging/notes between trainer and client

### Phase 4 - Advanced Programming
- [ ] Intermediate routines library (5/3/1, GZCL, nSuns, etc.)
- [ ] Advanced routines library
- [ ] **Conjugate method focus** - max effort / dynamic effort / repetition method tracking
  - ME day rotation tracking (exercise variation cycling)
  - DE day percentage/band/chain progression
  - Weakness identification and accessory recommendations
  - This fills a real gap - PTs in the strength community need good conjugate tooling
- [ ] **5th Set (Swede Burns) secondary focus** - RPE-based autoregulation program
  - Ideal for athletes limited to 3 days/week (vs 4 for conjugate)
  - Weight increases / volume decreases across mesocycle for peaking
  - Also has confirmed demand from PTs in the strength community

---

## Feature: Tier List
**Branch:** `rqd--tierlist`

### Phase 1 - MVP (Video Game Tier Lists)
- [ ] Scaffold page per NEW_PAGE_CHECKLIST.md
- [ ] Integrate IGDB API and/or SteamGridDB API for game data (cover art, metadata)
- [ ] Tier list UI - drag-and-drop games into tiers (S/A/B/C/D/F)
- [ ] Click on entry to expand optional description/explanation
- [ ] Streamlined UX (cleaner than TierMaker.com - less clutter, faster workflow)
- [ ] Save/load tier lists (localStorage MVP)
- [ ] Share tier list (export as image or shareable link)

### Phase 2 - Expansion
- [ ] Support tier lists for categories beyond video games (movies, music, food, etc.)
- [ ] Custom tier labels and colors
- [ ] Template system (pre-populated tier lists others can rank)
- [ ] User accounts and public tier list gallery

---

## Feature: Master Brands Spreadsheet
**Branch:** `rqd--brands`
**Potential subdomain:** TBD

### Phase 1 - MVP (Admin-Curated)
- [ ] Scaffold page per NEW_PAGE_CHECKLIST.md
- [ ] Design data model for brands/products:
  - Brand name, parent company, ownership type (family/founder vs megacorp/PE)
  - Animal welfare rating (supply chain abuse, testing practices)
  - Overall star rating (1-5)
  - Category tags (food, cosmetics, household, etc.)
  - Source citations for all claims
- [ ] Spreadsheet/database UI with sorting, filtering, search
- [ ] "Shit list" flagging for brands with animal abuse in supply chain
- [ ] Highlight and surface animal-abuse-free brands
- [ ] Ownership transparency: family/founder-owned vs megacorp/private-equity
- [ ] Admin interface for CRUD on brands/products
- [ ] Initial dataset of admin-researched brands

### Phase 2 - AI Research Agents
- [ ] AI agent pipeline to research individual brands/products and generate reports
- [ ] Auto-generate star ratings with justification text
- [ ] Source prioritization: prefer independent scientific research over industry-funded studies
- [ ] Admin review/override workflow (AI generates draft, admin approves/edits)
- [ ] Batch research capability (queue up brands for agent processing)

### Phase 3 - Chemical/Ingredient Safety
- [ ] Ingredient database tracking known harmful or dubious chemicals
- [ ] Product-level ingredient analysis
- [ ] Flag products with harmful additives
- [ ] Scientific source citations (prioritize research without financial conflicts of interest)

### Phase 4 - Community
- [ ] User-submitted brands/products
- [ ] Clear visual indicator differentiating admin-curated vs user-submitted content
- [ ] User voting/feedback on brand ratings
- [ ] Moderation pipeline for submissions

---

## General / Cross-Cutting
- [ ] Decide which features need their own subdomain vs staying on qube.brave
- [ ] Backend API expansion (qube-api) for features needing persistence beyond localStorage
- [ ] Auth system for trainer/client, admin, and user-submitted content features

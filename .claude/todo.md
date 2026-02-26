# qube.brave - Feature Roadmap

---

## Current Branch: `rqd--inflation`

### Inflation Page — Completed
- [x] Scaffold inflation page with chart UI, data source cards, moving average, regression
- [x] Add core datasets: median-home, case-shiller, median-rent, gasoline, crude-oil, gold, silver, bitcoin, S&P 500
- [x] Add grocery datasets: beans, rice, beer, beef-retail, pork-retail, chicken-retail
- [x] Add commodity datasets: coffee-arabica, wheat, copper, corn, soybeans
- [x] Add labor/wage datasets: labor-hours, avg-wage, mfg-wage
- [x] Derive median-extended wage series back to 1964 (avg-wage × 0.99 for pre-1979)
- [x] Derive stratified percentile wages: p10, p25, p75, p90 (2000-present)
- [x] Commit all data files (median-extended, p10/p25/p75/p90 wages)
- [x] Extend S&P 500 back to 1871 with expandable methodology notes on data source cards
- [x] Fetch data files for electricity, ground-beef, eggs, milk, beef-steak (JSON files present)

### Inflation Page — Remaining Work
- [ ] Wire up already-fetched datasets to frontend UI (electricity, ground-beef, eggs, milk — data exists but not in DATA_SERIES)
- [ ] Fetch and wire medical-cpi (configured in dataSeries.js but no JSON file yet)
- [ ] Fetch and wire tuition-cpi (configured in dataSeries.js but no JSON file yet)
- [ ] Add CPIAUCSL (CPI-U All Items) as a utility series for un-adjusting "real" datasets
- [ ] Review CPI-based series (electricity, ground-beef, eggs, milk, median-rent) — ensure nominal USD, un-adjust if needed
- [ ] Investigate Zillow ZHVI Bottom Tier as "starter home" proxy (needs CSV fetcher)
- [ ] Investigate Case-Shiller Low Tier metro indices for starter home tracking

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

## Feature: Recipe Book
**Branch:** `rqd--recipes`
**Potential subdomain:** TBD

### Phase 1 - Data Model & Storage
- [ ] Define standardized recipe schema (JSON):
  - Title, description, source/attribution
  - Ingredients list (quantity, unit, item, prep notes)
  - Steps (ordered, with optional timing/temp metadata)
  - Tags/categories (cuisine, meal type, dietary: vegan, GF, etc.)
  - Prep time, cook time, total time, servings
  - Difficulty rating
  - Photos (hero image, optional per-step images)
  - Notes/tips field
  - Version/edit history
- [ ] Scaffold page per NEW_PAGE_CHECKLIST.md
- [ ] Backend API endpoints for recipe CRUD (qube-api)
- [ ] Recipe file storage format decision (DB records vs flat JSON files vs hybrid)

### Phase 2 - Core UI
- [ ] Recipe list/browse view with search, filter by tag/category/dietary
- [ ] Full recipe detail view (clean, readable, mobile-friendly)
- [ ] "Cook mode" — simplified step-by-step view optimized for kitchen use (large text, keep-screen-awake, tap to advance)
- [ ] Scaling — adjust servings and auto-recalculate ingredient quantities
- [ ] Print-friendly layout
- [ ] Admin interface for manual recipe entry/editing

### Phase 3 - OpenClaw Integration
- [ ] Define API endpoint for recipe submission (POST with auth token)
- [ ] Validate incoming recipes against the standardized schema
- [ ] Auto-parse and normalize ingredient formats (e.g., "2 cloves garlic, minced" → structured data)
- [ ] Support submitting recipes via natural language (OpenClaw sends freeform text, API parses into schema)
- [ ] Pending/review queue — OpenClaw-submitted recipes land in draft state for quick review before publishing
- [ ] Feedback response — API returns confirmation or validation errors back to OpenClaw
- [ ] Bulk import support (submit multiple recipes in one request)

### Phase 4 - Family Sharing
- [ ] Shareable recipe links (public or family-only via private link/token)
- [ ] Family collection/cookbook grouping (e.g., "Holiday Favorites," "Weeknight Dinners")
- [ ] Favorites/bookmarking per user
- [ ] Comments/notes per recipe (family members can add their own tweaks)
- [ ] Meal planning calendar — drag recipes onto days of the week
- [ ] Shopping list generation from selected recipes (aggregate + deduplicate ingredients)

### Phase 5 - Extras
- [ ] Import recipes from URL (scrape and parse common recipe sites)
- [ ] Export cookbook as PDF
- [ ] Nutritional info estimation (API integration or manual entry)
- [ ] Recipe version history (track edits over time)
- [ ] Voice control / hands-free navigation in cook mode

---

## General / Cross-Cutting
- [ ] Backend API expansion (qube-api) for features needing persistence beyond localStorage
- [ ] Auth system for admin and user-submitted content features
- [ ] Fitness app lives separately at /var/www/fit.mjsbdlk (fit.mjsbdlk.com) — see that project's todo

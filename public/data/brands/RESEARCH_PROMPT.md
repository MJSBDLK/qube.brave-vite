# Brand Research Workflow

Two-step workflow: **discover** brands in a product category, then **deep-dive** individual brands.

> **Source of truth for prompt text:** `src/pages/brands/utils/prompts.js`
> The clipboard buttons in the UI call these functions directly. Edit prompts there — not here.

---

## Step 1: Discovery

Use when you want to buy something (e.g., "shampoo") and need to map the landscape. Returns JSON entries with table-level fields + summaries.

**Prompt function:** `getDiscoveryPrompt(productType)`

### Field reference

| Field | Type | Notes |
|---|---|---|
| `id` | string | URL-safe slug |
| `name` | string | Display name |
| `parentCompany` | string \| null | Ultimate parent |
| `ownershipType` | string[] | **Only** these 7 values: `family`, `founder`, `cooperative`, `public`, `venture-backed`, `private-equity`, `megacorp`. No "independent", "private", "subsidiary", etc. Use `parentCompany` for subsidiary relationships. |
| `categories` | string[] | Broad + specific: `food`, `beef`, `chicken`, `dairy`, `eggs`, `pork`, `cosmetics`, `household`, `clothing`, `tech`, `beverage`, `pet-care`, `personal-care`, `shampoo`, `soap` |
| `priceTier` | 1-4 \| null | 1=$ budget, 4=$$$$ luxury |
| `starRating` | 0.5-5 | Half-star increments |
| `animalWelfare` | object | `rating` (good/moderate/poor/unknown), `supplyChainAbuse`, `testingOnAnimals`, `notes` |
| `shitList` | boolean | Documented abuse/testing |
| `recommended` | boolean | Independently verified ethical practices only |
| `notes` | string | One-sentence table view summary |
| `tldr` | string | 1-2 sentence verdict: "should I buy this?" Direct recommendation or warning |
| `summary` | string | Markdown with 4 sections: `## Ownership & Structure`, `## Animal Welfare`, `## Controversies`, `## Assessment`. 2-4 sentences each |
| `sources` | array | `[{label, url}]` |
| `report` | null | Set to null at discovery; populated by deep research |
| `dateAdded` | string | YYYY-MM-DD |
| `lastUpdated` | string | YYYY-MM-DD |

### After receiving discovery output

1. Validate the JSON
2. Skim the list — remove any brands you don't care about
3. Add entries to the `brands` array in `public/data/brands/brands.json`
4. Set `"sample": false` on all real entries
5. Use the deep research prompt (below) on individual brands you want to investigate further

---

## Step 2: Deep Research

Use to generate a full cited report for a single brand. The output replaces an existing entry's `report: null`.

**Prompt function:** `getDeepResearchPrompt(brandName)`

### Report sections

- `## Overview` — What the company makes, founding date, HQ
- `## Ownership & Corporate Structure` — Who owns them, acquisition history
- `## Animal Welfare` — Category-aware subsections (food: farm conditions, certifications; cosmetics: testing, ingredient sourcing; clothing: material sourcing)
- `## Controversies & Legal` — Lawsuits, regulatory actions, NGO investigations
- `## Verdict` — One-paragraph rating justification

### Report JSON fields

| Field | Type | Notes |
|---|---|---|
| `generatedBy` | string | `"ai-agent"` |
| `generatedDate` | string | YYYY-MM-DD |
| `verified` | boolean | Set `false`; flip to `true` after manual review |
| `promptVersion` | string | Current: `"0.3"` |
| `model` | string | e.g. `"Claude Opus 4.6"` |
| `content` | string | Full markdown report with `[N]` inline citations |
| `citations` | array | `[{id, label, url, type, accessed}]` — types: `primary`, `secondary`, `corporate`, `industry` |

### After receiving deep research output

1. Validate the JSON
2. Review the report — check that citation URLs actually exist
3. Set the brand's `report` field to this object in `brands.json`
4. Set `"verified": true` once you've reviewed it
5. Optionally update top-level fields if the research reveals new information

---

## Tips

- Start with discovery for a product category, then deep-dive the ones you care about
- Research controversial brands first — independent sources are most plentiful
- Cross-reference citation URLs manually — AI can hallucinate URLs
- If a brand is a subsidiary, research both the brand and the parent company
- For brands with little public information, the AI will return `"unknown"` welfare ratings — that's honest
- Use `null` for any field where you actively looked but couldn't find data — the UI renders this as "N/A"

## Maintaining the schema

When adding a new field to the brands table:
1. Add the field to the JSON schema in `src/pages/brands/utils/prompts.js`
2. Add the column in `BrandsTable.jsx`
3. Backfill `fieldName: null` on all existing brands in `brands.json`
4. Bump `promptVersion` if the schema change is significant
5. Update the field reference tables above

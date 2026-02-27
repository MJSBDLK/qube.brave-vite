# Brand Research Prompts

Two-step workflow: **discover** brands in a product category, then **deep-dive** individual brands.

---

## Prompt 1: Discovery

Use when you want to buy something (e.g., "shampoo") and need to map the landscape. Returns lightweight JSON entries — enough for table rows but no full reports.

```
I want to buy [PRODUCT TYPE]. List the major brands in this space and produce a JSON array of brand entries.

IMPORTANT: Use web search to verify ownership structures, animal welfare certifications, and any claims before including them. Do NOT rely solely on training data — it may be contaminated by corporate PR and advertising.

For each brand, provide a quick assessment. Do NOT write a full report — just populate the table-level fields. Set "report": null for all entries.

CRITICAL RULES:
- Include a mix: mainstream brands, ethical alternatives, and brands to avoid
- Be honest about ownership — trace subsidiaries to their parent companies
- Do NOT give the benefit of the doubt on animal welfare. If uncertain, use "unknown"
- Flag shitList: true for any brand with documented animal abuse or testing
- Flag recommended: true ONLY for brands with strong, independently verified ethical practices
- Aim for 8-15 brands covering the range from best to worst

OWNERSHIP TYPES (pick ALL that apply as an array): "family", "founder", "cooperative", "public", "venture-backed", "private-equity", "megacorp"
- A brand can have multiple: e.g. Cargill is ["family", "megacorp"], Tyson is ["public", "megacorp"]
- "public" = publicly traded. "megacorp" = massive conglomerate (by scale/market power). These overlap.
WELFARE RATINGS (pick one): "good", "moderate", "poor", "unknown"
CATEGORIES (pick all that apply): "food", "cosmetics", "household", "clothing", "tech", "beverage", "pet-care", "personal-care"

JSON SCHEMA (array of objects):
[
  {
    "id": "brand-slug",
    "name": "Brand Name",
    "parentCompany": "Parent Corp" or null,
    "ownershipType": ["..."],
    "categories": ["..."],
    "priceTier": 1-4 (1=$ budget, 2=$$ mid-range, 3=$$$ premium, 4=$$$$ luxury) or null if unknown,
    "starRating": 0.5-5 (half-star increments),
    "animalWelfare": {
      "rating": "good|moderate|poor|unknown",
      "supplyChainAbuse": true/false,
      "testingOnAnimals": true/false,
      "notes": "One-sentence summary"
    },
    "shitList": true/false,
    "recommended": true/false,
    "notes": "One-sentence summary for the table view",
    "sources": [{"label": "...", "url": "..."}],
    "report": null,
    "dateAdded": "YYYY-MM-DD",
    "lastUpdated": "YYYY-MM-DD"
  }
]

Output ONLY the JSON array. No markdown fences, no commentary.
```

### After receiving discovery output

1. Validate the JSON
2. Skim the list — remove any brands you don't care about
3. Add entries to the `brands` array in `public/data/brands/brands.json`
4. Update `meta.count` and `meta.lastUpdated`
5. Use the deep research prompt (below) on individual brands you want to investigate further

---

## Prompt 2: Deep Research

Use to generate a full report for a single brand. The output replaces an existing entry's `report: null` with a detailed, cited report.

```
Research the brand [BRAND NAME] and produce a structured report. Your output must be a single valid JSON "report" object matching the schema below — no commentary outside the JSON.

IMPORTANT: You MUST use web search extensively for this research. Search for the brand name alongside terms like "animal testing", "cruelty free", "controversy", "lawsuit", "ownership", "acquired by", "parent company". Do NOT rely on training data — verify every claim against live sources. All citation URLs must be real, working links you found during research.

CRITICAL RULES:
- Prioritize adversarial and independent sources (investigative journalism, NGO reports, court documents, government filings) over corporate self-reporting
- If a claim is only supported by the company's own statements, cite it as "corporate" type and note the limitation in the text
- If you find industry-funded studies supporting a claim, flag them as "industry" type
- Do NOT soften language to protect brand reputation. Be direct about documented harms
- If you cannot verify a claim from at least one independent source, say so explicitly
- Use [N] inline citation markers in the report content. Multiple citations per claim are encouraged — e.g., [1][2][3]
- Every factual claim must have at least one citation

REPORT SECTIONS (use these exact ## headings):
## Overview — What the company makes, founding date, HQ, brief history
## Ownership & Corporate Structure — Who owns them, acquisition history, investor structure, executive compensation if notable
## Animal Welfare
### Testing Practices — Do they test on animals? In which markets? Commitments to alternatives?
### Supply Chain — Documented conditions, factory farming ties, audits
### Certifications — Third-party certifications and whether they're meaningful
## Controversies & Legal — Lawsuits, regulatory actions, investigative journalism, NGO exposés
## Verdict — One paragraph summarizing the rating justification

CITATION TYPES:
- "primary" — independent journalism, academic research, court documents, government data
- "secondary" — NGO reports, industry watchdogs, established certification databases
- "corporate" — company's own statements, press releases, sustainability reports
- "industry" — industry-funded studies, trade association publications

JSON SCHEMA (report object only):
{
  "generatedBy": "ai-agent",
  "generatedDate": "YYYY-MM-DD",
  "verified": false,
  "promptVersion": "0.1",
  "model": "MODEL_NAME (e.g. Claude Opus 4.6)",
  "content": "## Overview\n\n...[1][2]...\n\n## Ownership & Corporate Structure\n\n...",
  "citations": [
    {"id": 1, "label": "Source Title", "url": "https://...", "type": "primary|secondary|corporate|industry", "accessed": "YYYY-MM-DD"}
  ]
}

Output ONLY the JSON report object. No markdown fences, no commentary.
```

### After receiving deep research output

1. Validate the JSON
2. Review the report — check that citation URLs actually exist
3. Set the brand's `report` field to this object in `brands.json`
4. Set `"verified": true` once you've reviewed it
5. Optionally update the brand's top-level fields (starRating, notes, etc.) if the research reveals new information

---

## Tips

- Start with the discovery prompt for a product category, then deep-dive the ones you care about
- Research controversial brands first — independent sources are most plentiful
- Cross-reference citation URLs manually — AI can hallucinate URLs
- If a brand is a subsidiary, research both the brand and the parent company
- For brands with little public information, the AI will return `"unknown"` welfare ratings — that's honest
- Use `null` for any field where you actively looked but couldn't find data — the UI renders this as "N/A"
- If a field is omitted entirely from the JSON, the UI shows "—" (meaning "not yet researched")

## Maintaining the schema

When adding a new column to the brands table:
1. Add the field to the JSON schema in both this file and `src/pages/brands/utils/prompts.js`
2. Add the column in `BrandsTable.jsx`
3. Backfill `fieldName: null` on all existing brands in `brands.json`
4. Bump `promptVersion` if the schema change is significant

const today = new Date().toISOString().split('T')[0]

export function getDiscoveryPrompt(productType) {
  return `I want to buy ${productType}. List the major brands in this space and produce a JSON array of brand entries.

IMPORTANT: Use web search to verify ownership structures, animal welfare certifications, and any claims before including them. Do NOT rely solely on training data — it may be contaminated by corporate PR and advertising.

For each brand, provide a quick assessment. Do NOT write a full report — just populate the table-level fields. Set "report": null for all entries.

CRITICAL RULES:
- Include a mix: mainstream brands, ethical alternatives, and brands to avoid
- Be honest about ownership — trace subsidiaries to their parent companies
- Do NOT give the benefit of the doubt on animal welfare. If uncertain, use "unknown"
- Flag shitList: true for any brand with documented animal abuse or testing
- Flag recommended: true ONLY for brands with strong, independently verified ethical practices
- Aim for 8-15 brands covering the range from best to worst

OWNERSHIP TYPES — use ONLY these 7 values (pick all that apply as an array):
  "family"          — family-owned or family-controlled
  "founder"         — founder-owned or founder-led (use this, NOT "founder-led" or "independent")
  "cooperative"     — co-op or member-owned structure
  "public"          — publicly traded on a stock exchange
  "venture-backed"  — venture capital funded
  "private-equity"  — private equity owned or controlled (use this, NOT "PE-influenced")
  "megacorp"        — massive conglomerate by scale/market power
- A brand can have multiple: e.g. Cargill is ["family", "megacorp"], Tyson is ["public", "megacorp"]
- "public" and "megacorp" often overlap — use both when applicable
- Do NOT invent new ownership types. No "independent", "private", "subsidiary", "foreign-owned", etc.
- If a brand is a subsidiary, capture the parent in "parentCompany" — do NOT add "subsidiary" as an ownership type
- If none of the 7 types fit, use the closest match or leave the array empty
WELFARE RATINGS (pick one): "good", "moderate", "poor", "unknown"
CATEGORIES (pick all that apply): "food", "beef", "chicken", "dairy", "pork", "cosmetics", "household", "clothing", "tech", "beverage", "pet-care", "personal-care", "shampoo", "soap"
- Use broad + specific together: e.g. ["personal-care", "shampoo"] or ["food", "beef", "chicken"]

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
    "summary": "Markdown string with 4 sections: ## Ownership & Structure, ## Animal Welfare, ## Controversies, ## Assessment. Write 2-4 sentences per section. No citations needed — this is a condensed overview for the detail panel, not the full report.",
    "sources": [{"label": "...", "url": "..."}],
    "report": null,
    "dateAdded": "${today}",
    "lastUpdated": "${today}"
  }
]

Output ONLY the JSON array. No markdown fences, no commentary.`
}

export function getDeepResearchPrompt(brandName) {
  return `Research the brand ${brandName} and produce a structured report. Your output must be a single valid JSON "report" object matching the schema below — no commentary outside the JSON.

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
  "generatedDate": "${today}",
  "verified": false,
  "promptVersion": "0.2",
  "model": "YOUR_MODEL_NAME (e.g. Claude Opus 4.6, GPT-4o, etc.)",
  "content": "## Overview\\n\\n...[1][2]...\\n\\n## Ownership & Corporate Structure\\n\\n...",
  "citations": [
    {"id": 1, "label": "Source Title", "url": "https://...", "type": "primary|secondary|corporate|industry", "accessed": "${today}"}
  ]
}

Output ONLY the JSON report object. No markdown fences, no commentary.`
}

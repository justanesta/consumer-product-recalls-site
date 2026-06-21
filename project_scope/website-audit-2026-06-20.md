# Landing page
- Title: "Your online resource for recalls"
- Subtitle: "A unified, open access database of U.S. consumer product recalls from five federal agency resources. Browse and filter every recall to check details like firms involved, areas impacted, and products included, among others. Data updates every day from publicly available sources.
- "Recalls over time" --> "Over time"
- "All sources combined, by the month each recall was announced (since 2012)." --> "From every source, by month recall was announced."
- "Total recalls contributed by each agency feed." --> "Total recally from each regulating agency"
- "Each agency's own severity vocabulary — shown separately." --> "Separated by each agency's own recall severity level"
- "Each agency's own severity vocabulary, shown separately — classifications are source-native and not comparable across sources." --> "Classifications are source-native and not comparable across sources."
- "What this data is — and isn't" --> "A note about this data"
- "These five feeds use different vocabularies, scopes, and lifecycles. We keep them source-native rather than forcing a false common scale: classifications aren't comparable across agencies, recall geography has two distinct lenses, and counts reflect reporting practices, not product risk. Read the methodology & caveats before drawing conclusions." --> "These five regulators use have slight differences in nomenclature, scope, and lifecycles. For most fields they are kept source-native as and only combined when semantic overlaps warrant integration. Counts reflect reporting practices, not product risk. Read the methodology & caveats before drawing conclusions."

# /recalls/
- "Filter by source, classification, status, scope, date, and firm — or search by keyword. The active filters live in the URL, so any view you build is shareable." -- "Filter by source, classification, status, scope, date, and firm or even search by keyword. The active filters stay live in the URL, so any view you build is shareable."

# /search/
- "Keyword search is exact (not fuzzy) across our five sources. UPC lookup is recall-level and sparse (mostly CPSC); for vehicles and boats use the model/HIN fields." --> "Keyword search is exact (not fuzzy) across data from all five sources. UPC lookup is recall-level. For vehicles and boats use the model/HIN fields."
- "Enter a product name or identifier to search." --> This can be removed.

# /dashboards/
- "Trends across all five sources, refreshed daily from the data pipeline. Every panel reads a single pre-aggregated table — and every chart carries the caveats that keep the numbers honest." --> "High-level trends & views from all five data sources."
- "Recalls over time" --> "Over time"
- "All sources combined, by announcement date — switch the time grain." --> "By recall announcement date"
- "Counted by each recall's announcement (initiation) date. The most recent bucket is partial." --> "Most recent bucket is typically partial"
- "Trend by source" --> "By source"
- "Monthly count by announcement date (faint) with a 3-month rolling average (bold), per source, since 2010." --> "Monthly recall count by announcement date"
    - Can the axes for these not be the same for each source? Can they be dynamic to the range of the data so we can see the trend for each?
- "Two different questions — read each map on its own terms" --> "Two different geographic scopes for recalls"
- "Recall geography has two distinct lenses that are not interchangeable. Distribution is where a product was sent (FDA/USDA only). Firm registration is where the responsible firm is registered — not where the product went or where harm occurred. We show them as two separate maps, never one toggle."  --> "Recall geography has two distinct lenses that are not interchangeable. Distribution is where a product was sent (currently only available in FDA/USDA data). Firm registration is where the responsible firm is registered, not where the product was delivered or where harm occurred."
- (Distribution lens map subhead) "Where recalled products were distributed (FDA/USDA)." --> "Where recalled products were distributed"
- (Firm-registration lens map subhead) "Where the responsible firm is registered (not where harm occurred)." --> "Where the responsible firm is registered."
- (Firm-registration lens map caption) "Registration location ≠ where the product was sold or caused harm." --> "A single recall can have interact with multiple firms in different roles (importer, distributor, manufacturer, etc.)."

# /methodology/
- "Methodology & caveats" --> "Methodology & data details"
- "This site aggregates five independent U.S. federal recall feeds into one searchable view. They use different vocabularies, scopes, and lifecycles — so we keep each source's data source-native and never force a false common scale. Here's what that means." --> "This site aggregates five independent U.S. federal agencies that regulate consumer products into one database. The sources use different vocabularies, scopes, and lifecycles when reporting their product recalls. For most fields they are kept source-native as and only combined when semantic overlaps warrant integration."
- "USDA Food Safety & Inspection Service" --> "U.S. Department of Agriculture"
- "Honesty caveats" --> "Data details"
- "FDA uses 1/2/3/NC, USDA uses Class I/II/III plus Public Health Alert, USCG uses H/M/L/S, and CPSC and NHTSA have none. These are not comparable across agencies — an FDA "Class 2" is not a USDA "Class II". We never show a single global classification legend." --> "FDA uses 1/2/3/NC, USDA uses Class I/II/III plus Public Health Alert, USCG uses H/M/L/S, and CPSC and NHTSA have none. These are not inherantly comparable across agencies. An FDA "Class 2" is not necessarily a USDA "Class II". This is why there is no single overall classification legend."
- "USCG's H/M/L/S codes are a special case: their official meaning is not publicly documented (the public USCG recall index shows no severity column, and 33 CFR 179 defines no such scale). We pass them through verbatim and order them provisionally — H/M/L as High/Medium/Low, with S shown last and left uncolored — pending confirmation from the Coast Guard. Don't read them as a settled scale." --> "USCG's H/M/L/S codes are a special case: their official meaning is not publicly documented either on the Coast Guard's site or in the legal text laying out the regulating authority. We pass them through verbatim and order them provisionally, H/M/L are assumed to be High/Medium/Low, with S shown last and left uncolored. This is pending confirmation from the Coast Guard and are not a settled scale."
- "Every time-series here (recalls by month/week/year and the per-source trend) buckets each recall by its announcement / initiation date — coalesce(announced_at, published_at) — so the curve reflects when recalls actually happened, not when a record was last published. For the handful of FDA events with no trustworthy announce date, we fall back to the publish date. (The browse and RSS lists are separately ordered by publish date — the right "what's new" signal — so the two bases aren't the same.)" --> "Every time-series data visualization on this site buckets each recall by its announcement / initiation date and reflect when recalls actually happened, not when a record was last published. The browse and RSS lists are separately ordered by the last date the source published or updated the recall to try give newly edited recalls more primacy."
- "Recall status is tri-state" --> "Recall status is only applicable for three sources"
- "Only FDA, USDA, and USCG track an active/inactive lifecycle. CPSC and NHTSA carry none, so their recalls show "No lifecycle" — not a false "Inactive"." --> "Only FDA, USDA, and USCG track an active/inactive lifecycle. CPSC and NHTSA do not, so their recalls show "No lifecycle", not a false "Inactive"."
- "Distribution (where a product was sent; FDA/USDA only) and firm registration (where the responsible firm is registered) answer different questions. Registration is not where the product went or where harm occurred. On the dashboards these are two separate maps, never one toggle. Also, a recall counts in every state it touches, so per-state counts sum to more than the total." --> "Distribution is where a product was sent and currently only available for recalls from the FDA & USDA. Firm registration is where the responsible firm is physicall registered. These geograhic slices answer different questions. Registration is not where the product went or where harm occurred. A recall counts in every state or firm it interacts with, so per-state and per-firm counts sum to more than the total."
- "Reported units (NHTSA/USCG) and quantities (FDA/USDA) are a recall-magnitude measure, not unique items, and use incommensurable categories (count / weight / volume). Never sum them across sources or categories." --> "Reported units are available for select recalls from the NHTSA & USCG. Quantities are available for select recalls from the FDA & USDA. They are a recall-magnitude measure, not unique items, and use incommensurable categories (e.g., count vs. weight vs. volume). They cannot be summed them across sources or categories."
- "There is no per-product UPC. UPC search matches a recall-level list that is CPSC-sourced and covers only ~5% of CPSC recalls. For vehicles and boats, use the model and HIN fields." --> "There is no per-product UPC yet. UPC search matches a recall-level list that is CPSC-sourced and covers only ~5% of CPSC recalls."
- "A recall marked revised means the pipeline detected an editorially-meaningful change since first ingest — it is observed-edit evidence, not an official agency amendment, and carries no date." --> "A recall marked revised means the data pipeline detected an editorially-meaningful change since first ingest. The revision is observed-edit evidence, not an official agency amendment, and currently carries no date."
- "A source with more recalls isn't "less safe" — counts reflect each agency's reporting scope, history, and granularity. Treat cross-source comparisons with care, and read the API reference for field-level provenance. A "no match" in search only covers these five sources." --> "A source or product with more recalls isn't necessarily "less safe". Recall counts reflect each agency's reporting scope, history, and granularity. Treat cross-source comparisons with care, and read the API reference for field-level provenance. A "no match" in search only covers these five sources."
- Remove the "How it's built" title and subheading completely.

# /about/
This page needs to be completely redone. All of how it currently is should go. It should briefly introduce me, Adrian Nesta who is a data engineer and journalist who has a passion for making publicly available data more accessible and useful. It should link back to my [website](https://justanesta.com/) (use the website for any additional information about me) or my Buy Me a Coffee (https://www.buymeacoffee.com/justanesta). Any feedback or improvements about the site or data pipeline are welcome.

# General
- Add this to the footer note after the "Not affiliated with any agency.": "Always confirm a recall on the issuing agency's official site before acting."
- The USDA glyph should be something more recognizable but easy to draw. Either a pig, chicken, or cow.
- "Data updated Jun 20, 2026, 18:51 UTC" --> Just answer this question: Remind me again where this date is being sourced.
- Tooltip text in dark mode is not readable on the white background (both landing and dashboard pages)









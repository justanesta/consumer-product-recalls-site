# Landing page
- Get rid of the four cards "Total recalls", "Distinct firms", "Sources", and "Data updated". 
- The 'Data updated %b %d, %Y' information needs to include the time the data was last updated as well and consistently be an artifact ideally in the same spot on **every** page on the site. (Evaluate if the placement of this makes sense even on `/recalls/<source>/<source_recall_id>` pages)
- Why is there such a massive spike in seemingly FDA recalls in September 2018? Something I need to probe in the `consumer-product-recalls/` pipeline repo. Are we sure this is aggregating the recalls by `announced_at`?
- The "By source" visualization should sort/order agences with the most recalls at the top (in this case FDA) to the lowest at the bottom (in this case USDA)
- The "By Classification" bar graph can go and just be replaced with a prettier data table (put FDA/USDA/USCG at the top, sort from class 1/I/Severe(S) to class 3/III/Low(L) to bottom and add some color like is one on the `recalls/` page. CPSC/NHTSA should be at the bottom since they are all "unclassified")

# /search/
- Where is the place to search by UPC?

# /dashboard/
- Remove the "By classification" grouped bar chart. It looks ugly. 
- Active vs. inactive stacked bar chart should sort descening by total amount/height of the bar.
- The "Firm-registration lens" map legend has overlapping numbers (see [this picture](../screenshots/firm-registration-lens-map.png))
- Remove the "Units recalled" visualization for now.

# /api/
- I still have no idea how to search for a UPC code even in the API in the documentation. Where is that spelled out?

# /recalls/<source>/<source_recall_id>
- Why are only the first handful of these pages populated with data and the rest I get [this 404 page](../screenshots/individual-recall-not-found-page.png) when I click on them.

# /firms/<firm_id>
- Why do none of the firm profile pages render when I click on them. I get [this same 404 page](../screenshots/individual-firm-not-found-page.png).

# General
- Is it possible to get tooltips with data for data visualizations?
- Can we use the agency icons/favicons and color scheme as much as possible? I can try to provide them to you but here are the websites:
    - [FDA](https://www.fda.gov/)
    - [USDA](https://www.fsis.usda.gov/recalls)
    - [CPSC](https://www.cpsc.gov/Recalls)
    - [USCG](https://uscgboating.org/content/recalls.php)
    - [NHTSA](https://www.nhtsa.gov/recalls)
- A lot of the copy on this site seemed either superfluous or over-explained. Not the worst default but I will need to trim down. Please go through with me section-by-section to show me where copy/text can be edited in this repo. For example most of the info on the `/about/` page needs to be trimmed/altered. If information in the `/api/` documentation is rendered from the `consumer-product-recalls-api/` repo tell me where there I can edit it.
- Some running ideas for the copy edits:
    - A full accounting of data particulars/caveats/appropriately called out provenance can continue to live in the `/methodology/` page. Repeated reminders/call-outs in the `/api/` documentation are fine they just don't need to be as verbose.  
- I also have CI errors due to some npm packages missing from lock file:
```
npm error code EUSAGE
npm error
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
npm error
npm error Missing: @emnapi/runtime@1.11.1 from lock file
npm error Missing: @emnapi/core@1.11.1 from lock file
npm error
npm error Clean install a project
npm error
npm error Usage:
npm error npm ci
npm error
npm error Options:
npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]
npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]
npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]
npm error [--no-bin-links] [--no-fund] [--dry-run]
npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]
npm error
npm error aliases: clean-install, ic, install-clean, isntall-clean
npm error
npm error Run "npm help ci" for more info
npm error A complete log of this run can be found in: /home/runner/.npm/_logs/2026-06-20T03_28_33_776Z-debug-0.log
```

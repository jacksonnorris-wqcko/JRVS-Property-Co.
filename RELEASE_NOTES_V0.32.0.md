# JRVS V0.32.0 — JRVS Photography Package Catalogue

## Added
- Automatically seeds the four JRVS introductory photography packages when missing:
  - Essential — $119, up to 6 edited photographs
  - Standard — $149, up to 10 edited photographs
  - Plus — $189, up to 15 edited photographs
  - Complete — $229, up to 20 edited photographs
- Adds the five proposed optional extras:
  - Additional 5 photographs — $30
  - Additional 10 photographs — $50
  - Priority turnaround — $30
  - Second visit / reshoot — from $60
  - Twilight photography — from $100
- Stores the package inclusions and descriptions in the reusable package catalogue.
- Adds service-area, delivery, travel and introductory-pricing information to the package workspace.
- Seeded JRVS package names, inclusions and add-on descriptions are fixed; their price fields remain editable.
- Existing custom packages remain editable as before.
- Seed process is non-destructive: existing matching packages are retained, missing defaults are added, and existing package prices are never overwritten.

## Quoting
- Seeded packages and extras appear in the existing quote line-item selector.
- Selecting a package fills its current saved price; quote line price remains editable for individual quote adjustments.
- Existing saved quotes and their historical line items are not rewritten.

## Compatibility and preservation
- Built from V0.31.0.
- No database/schema changes, localStorage key changes, IndexedDB database/store changes or data clearing.
- Existing jobs, clients, photos, RAW files, quotes, invoices and business records are preserved.
- APP_VERSION, version.json, service worker cache, README and roadmap updated to 0.32.0.
- ZIP contains only RELEASE_NOTES_V0.32.0.md.

# JRVS Property Co. Desktop — V0.52.0 Release Notes

## Desktop visual redesign
- Brought the desktop workspace much closer to the approved JRVS dark dashboard reference: near-black workspace, charcoal cards, deep olive sidebar, warm high-contrast text and brighter sage/lime highlights.
- Reworked sidebar proportions, logo treatment, navigation spacing and active navigation state.
- Simplified the dashboard header into a greeting/search row with notification and profile controls.
- Removed the persistent bottom status strip and returned that space to the workspace.
- Applied a consistent dark surface and readable text treatment across dashboard, quotes, invoices, calendar, photo studio, finance, settings and editor panels.

## Dashboard layout
- Rebuilt the dashboard composition into a three-column workspace: upcoming jobs, quick actions and schedule rail, with recent properties across the lower main workspace.
- Updated the KPI cards to show jobs scheduled this week, edited photos, month-to-date revenue and active properties.
- Changed upcoming jobs into a compact table with date, time, property/address, agent/client and status columns.
- Limited recent properties to four visual cards to match the reference layout.
- Updated quick actions to New job, Edit photos, Import photos, Create quote, Create invoice and Open library.

## Pricing, quotes and invoices
- Reworked package cards with clearer hierarchy, more legible descriptions, visible pricing and expandable inclusions.
- Reworked package selection in the quote form to resolve the selected package directly from current package records.
- Selecting a package now applies its current price and recalculates quote totals, including valid zero-price packages.
- Saved quote items retain their package name and link where available, including where an older quote refers to a package that has since been removed.
- Existing saved quote prices are preserved when editing a quote until the user changes the selected package.

## Desktop workspace
- Updated local workspace copy to describe the current local records, managed photo copies and portable backups accurately.
- No business-data schema or backup-format migration is introduced in this release.

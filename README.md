# JRVS Property Co. V0.4.0 — Visual Polish & Refinement

A broad visual refinement release focused on making the existing application cleaner, more consistent, sharper and easier to use across desktop and mobile.

## What changed
- Unified spacing, typography, borders, radii, shadows and control sizing across the application.
- Refined desktop navigation, page header, dashboard cards, panels, list rows, forms, photo cards and modal presentation.
- Improved hover and keyboard-focus feedback, input focus treatment and button interaction states.
- Refined settings and photo workspace presentation while retaining the sage/cream JRVS identity.
- Improved responsive layout behaviour for tablet and mobile widths.
- Added reduced-motion support and more consistent scrollbar styling.
- Corrected the internal app version so the UI, update checker, version.json and service-worker cache all identify V0.4.0.

## Preserved
- Existing `jrvs-data` localStorage business records.
- Existing `jrvs-calendar` localStorage events.
- Existing `jrvs-photo-library` IndexedDB database and `photos` object store.
- Existing Supabase project configuration, authentication, schema and cloud-sync implementation.
- Existing jobs, clients, quotes, invoices, finances, calendar, photo library, photo search and install prompt workflows.
- Five-record default list limits and seven-day upcoming-events window.
- JRVS sage green `#899B68` and warm cream `#F7F1DF` brand palette and logo assets.

## Install
Extract the ZIP and upload all files/folders into the existing GitHub repository root, replacing matching files. Do not upload the ZIP itself. No SQL changes are required. Keep using the same browser profile and existing app URL; do not clear browser/site data.

## Validation
Static validation only. HTML structure, JavaScript syntax, duplicate element IDs, version alignment, archive integrity and key preservation were checked. Live browser interaction, iPhone rendering and Supabase account sync have not been exercised in this build; test those after deployment.


## V0.4.0.1 Dashboard welcome banner fix
Improves contrast and readability of the dashboard “Good to see you” banner. The banner now uses a soft sage/cream surface with explicitly dark heading, supporting text and a distinct date chip. No database, local storage, photo library or cloud-sync changes.

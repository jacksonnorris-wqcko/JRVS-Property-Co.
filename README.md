# JRVS Property Co. V0.2.3 – Sync Reliability Diagnostics

## Install
Upload the contents of this ZIP into the root of the existing GitHub Pages repository and commit. Keep the same URL and browser profiles. Do not clear site data or uninstall the iPhone PWA.

## Changes
- Preserves legacy business/calendar/photo metadata records that do not contain an `id`; earlier merge logic silently skipped these records. Such rows cannot be deduplicated automatically and are retained.
- Validates the merged snapshot before attempting a cloud write.
- Displays Supabase error code, HTTP status, details and hint in the sync status to identify the actual API failure.
- Keeps additive merging and concurrency guard from V0.2.2.
- Bumps app, version.json and service-worker cache to 0.2.3.

## Important
This is a diagnostic/reliability hotfix, not a claim that full two-way sync has been live-verified. Keep dummy data only. Do not repeatedly press Sync if an error appears; capture the complete status text. Deletions are not synchronised and same-ID simultaneous edits still require review. No new SQL is required.

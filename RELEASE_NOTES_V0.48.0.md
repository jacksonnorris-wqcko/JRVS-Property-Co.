# JRVS Property Co. V0.48.0 — Data Reliability Hardening

## Changes
- Retained V0.47.0 record-level sync merging, invoice merging, timestamps, tombstones and number-sequence reconciliation.
- Removed automatic 365-day tombstone expiry. Deletion markers are retained until a future acknowledged compaction strategy exists, preventing time-based resurrection from long-offline devices.
- Photo deletion tombstones are now written only after the IndexedDB delete and cover-photo update complete successfully.
- Standardised remaining calendar, photo, quote-created client/job and edited-photo generated IDs on the application's UUID helper.
- Updated application, version metadata and service-worker cache to 0.48.0.

## Preserved
- Existing business records and legacy IDs.
- Supabase payload shape and existing sync protocol.
- V0.45 photo enhancement and RAW development.
- V0.46 premium editor layout and photo workflow.
- Existing database schema; no destructive migration.

## Verification limits
- JavaScript syntax and package integrity checked locally.
- Live Supabase multi-device concurrency, RLS policies and browser IndexedDB behaviour require testing in the deployed environment.

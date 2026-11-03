# JRVS Property Co. V0.2.5 – Photo Metadata Resilience

This release improves handling of legacy cloud photo metadata. When a cloud photo has a stable ID but no `storage_path`, the app derives the established private object path (`userId/photoId`). A cloud photo with an invalid ID or unavailable object is recorded for review and skipped rather than stopping the entire business-data sync. Local photos are never deleted by this sync process.

## Install
Upload all extracted files and folders to the existing GitHub repository root, replacing matching files. Do not upload the ZIP itself. No SQL changes are required. Keep the existing Supabase account and local browser data.

## Important
This does not provide deletion synchronisation or automatic same-record conflict resolution. Skipped photo transfers are logged in local storage under `jrvs-photo-sync-review-*`; the status message reports the count. Keep using dummy data until both devices have been tested. This build has passed static package/version/JavaScript checks, but has not been live-tested against your Supabase project or on iPhone Safari.

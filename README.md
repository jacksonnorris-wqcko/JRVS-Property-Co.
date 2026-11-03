# JRVS Property Co. V0.2.4 – Sync Request Reliability

This release targets the iPhone/Safari `InvalidRequest · HTTP 400 · No content provided` failure. Photo uploads are now read and validated as ArrayBuffer bytes before being sent to Supabase Storage, and failures identify the exact sync stage.

## Install
Upload all extracted files and folders to the existing GitHub repository root, replacing matching files. Do not upload the ZIP itself. No SQL changes are required. Keep the existing Supabase account and local browser data.

## Important
Two-way sync remains experimental. Deletions are not synchronised and simultaneous edits are not fully resolved. Keep using dummy data and do not clear browser storage. This build has passed static package/version/JavaScript checks, but has not been live-tested against your Supabase project or on your iPhone.

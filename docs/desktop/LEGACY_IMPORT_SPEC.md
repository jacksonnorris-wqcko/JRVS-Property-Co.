# JRVS Desktop — V0.48.0 Legacy Import Specification

## Purpose

Define a safe, repeatable migration from the existing browser/PWA app into the Windows desktop workspace. The current app stores business data in localStorage and photo metadata/blobs in IndexedDB. The desktop importer must not depend on direct access to a browser profile or attempt to read browser storage from Tauri.

## Required source export

Add a dedicated **Export for JRVS Desktop** workflow to a temporary V0.48-compatible migration build (or a standalone migration helper page) that produces one portable archive containing:

- `manifest.json` with format version, app version, export timestamp, counts and checksums.
- `business.json` containing the complete parsed `jrvs-data` object, not a reduced subset.
- `calendar.json` containing the complete `jrvs-calendar` array.
- `photos/metadata.json` containing every IndexedDB photo record with Blob fields replaced by archive-relative asset references.
- `photos/original/<photo-id>.<ext>` containing each photo's `blob` bytes.
- `photos/preview/<photo-id>.<ext>` containing optional `previewBlob` bytes.
- Optional diagnostics listing malformed or unsupported records; diagnostics must never omit data silently.

The export operation is read-only. It must not clear, rewrite, rename or move any source browser records or photo files.

## Photo ownership and copy policy

The user has confirmed the current photos and business data are test data on the home PC. The desktop library policy is:

1. Copy every source photo into the JRVS-managed library.
2. Preserve the original source filename, MIME type, file size, original photo ID, job ID, addedAt, type/status, cover flag, sourcePhotoId and editRecipe metadata.
3. Never move or delete the browser's IndexedDB Blob or any source file from its original folder.
4. Keep original files immutable. Edited outputs are separate managed assets and must not overwrite source originals.
5. If a filename already exists, use the photo ID as the stable storage filename; retain the original filename as metadata.
6. Verify each copy with byte length and SHA-256 before committing its metadata row.
7. Support interrupted copies: unreferenced partial files are safe to clean only after a later integrity scan confirms they are not referenced by SQLite.

## Import phases

### Phase A — Inspect
- Open and validate the archive before changing the active workspace.
- Validate manifest format version, required files, declared counts and archive paths.
- Reject path traversal, absolute paths, duplicate photo IDs and unsupported compression/oversized entries.
- Parse JSON and validate expected top-level shapes.
- Compute hashes and byte counts for every photo asset.
- Produce a preview summary: record counts, photo count/bytes, missing jobs, orphan photo references, duplicate IDs and numbering warnings.

### Phase B — Stage
- Copy photo assets into a temporary staging directory under the JRVS app data directory.
- Verify every staged file against its declared SHA-256 and size.
- Create a staging SQLite database and import all business/calendar/photo metadata into a transaction.
- Preserve complete payload JSON, including unknown keys.
- Verify relationships and numbering invariants.

### Phase C — Commit
- Only after staging passes validation, create a rollback backup of the current workspace.
- Atomically promote the staged database and managed photo directory into the active workspace.
- If the final rename/commit fails, retain the old workspace and report the failure.
- Never silently merge imported data into an existing workspace. A restore/replace operation must show an explicit warning and require confirmation.

### Phase D — Verify
- Reopen the database from the final path.
- Compare source and destination counts, IDs, full payloads and photo hashes.
- Show a completion report with warnings and the location of the pre-import rollback backup.

## Duplicate and orphan handling

- Duplicate IDs within the same collection are a hard validation error.
- The same string ID in different record types is allowed.
- Orphan photos whose jobId is absent must be retained in a recoverable state and reported; do not delete them.
- Edited photos whose sourcePhotoId is missing must be retained and reported; keep their flattened rendered file available.
- A missing photo binary is a hard error for a full-photo import. The user may explicitly choose a metadata-only recovery path, which must be labelled incomplete.

## Privacy and security

- Do not export Supabase session tokens, passwords or auth state.
- Do not include the Supabase publishable key in the desktop backup.
- Treat imported filenames and JSON as untrusted input.
- No network upload is part of this migration.

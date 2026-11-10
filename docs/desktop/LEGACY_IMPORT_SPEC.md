# JRVS Desktop — V0.48.0 Legacy Import Specification

## Purpose

Define a safe migration from the existing browser/PWA app into the Windows desktop workspace. The browser app stores business data in localStorage and photo metadata/blobs in IndexedDB. The desktop importer must not depend on direct access to a browser profile or attempt to read browser storage from Tauri.

## Required source export

The read-only helper `scripts/export-legacy-workspace.js` runs in the old JRVS browser tab's DevTools Console and downloads a portable gzip JSON export containing:

- `business`: the complete parsed `jrvs-data` object, not a reduced subset.
- `calendar`: the complete `jrvs-calendar` array.
- `photos`: every IndexedDB photo record with original and optional preview Blob bytes encoded as base64.
- `manifest`: version 2 SHA-256 checksums and byte counts for business data, calendar data and each photo original/preview.
- Source version and export timestamp metadata.

The export is read-only. It does not clear, rewrite, rename or move source browser records or photo files. Version 1 exports remain supported by the desktop importer but do not include checksums.

## Photo ownership and copy policy

1. Copy every source photo into the JRVS-managed library.
2. Preserve the original source filename, MIME type, file size, original photo ID, job ID, addedAt, type/status, cover flag, sourcePhotoId and editRecipe metadata.
3. Never move or delete the browser's IndexedDB Blob or any source file from its original folder.
4. Keep original files immutable. Edited outputs are separate photo records linked through sourcePhotoId; they must not overwrite source originals.
5. If a filename already exists, use the photo ID as the stable storage filename; retain the original filename as metadata.
6. Verify exported file hashes and byte lengths before replacing business/calendar records.
7. Support interrupted copies: unreferenced partial files are safe to clean only after a later integrity scan confirms they are not referenced by SQLite.

## Import phases

### Phase A — Inspect

- Validate the supported format and top-level JSON shapes.
- For version 2, validate the manifest, business/calendar SHA-256 checksums, declared photo count, unique photo IDs, original/preview byte lengths and per-file SHA-256 values.
- Reject incomplete photo records before changing business/calendar records.
- The UI displays a record/photo count summary and requires explicit confirmation before replacement.

### Phase B — Copy and commit

- The app downloads a full safety backup of the current desktop workspace.
- Each photo is written to the IndexedDB working library. The native bridge mirrors the committed photo transaction into staged managed files and records the metadata in SQLite.
- The importer waits for the native photo mirror queue to flush before it commits the business/calendar payload to the SQLite-backed workspace.
- When the source export declares a complete photo library, photos absent from the import are removed from the active IndexedDB library and their managed copies are moved to trash.
- The native importer keeps a JSON snapshot of existing SQLite key/value records before replacement.

### Phase C — Verify

- Reopen the app and confirm record, calendar and photo counts.
- Check representative original JPEG/RAW files, previews, edited outputs and cover selections.
- Confirm job/quote/invoice numbering continues from the imported sequences.
- Keep the original browser workspace and the downloaded safety backup until this review passes.

## Known limitations

- The current import is a guarded replacement flow, not a fully atomic multi-file workspace swap. The downloaded safety backup is the rollback path if a photo transaction or final replacement is interrupted.
- Orphan photos and edited assets with missing sources must be retained for recovery.
- The version 1 format has no per-file checksum; version 2 is preferred.
- No network upload is part of this migration.

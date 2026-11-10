# JRVS Property Co. — Portable Workspace Backup

**Current format:** JRVS Portable Workspace, version 1  
**File extension:** `.jrvsbackup.gz`  
**Container:** GZIP-compressed UTF-8 JSON

## Payload structure

The decompressed JSON contains:

- `format`: `jrvs-portable-workspace`
- `formatVersion`: integer (currently 1)
- `appVersion`
- `exportedAt`: ISO-8601 timestamp
- `business`: complete `jrvs-data` object, including unknown fields and numbering state
- `calendar`: complete `jrvs-calendar` array
- `photos`: an array of full photo metadata plus base64-encoded original and optional preview blobs
- `hasPhotoLibrary`: indicates whether restore should reconcile the target photo library to the source backup

Legacy browser exports use the same structure with `format` set to `jrvs-legacy-workspace`.

## Backup behaviour

- The backup is assembled from the SQLite-backed localStorage compatibility store and the active IndexedDB photo library.
- Photo originals are included byte-for-byte as base64 data and are also mirrored into the native managed photo folder.
- The original browser/PWA data is not changed by export.
- The app downloads the finished compressed file to the normal Windows download location.
- A restore validates the format, required arrays, business object and presence of every photo original before changing records.
- Before a restore/import, the app downloads a full safety backup of the current desktop workspace. The native importer also retains a JSON snapshot of the existing SQLite key/value store under the workspace backups folder.

## Current limitations and safeguards

- Version 1 uses gzip-compressed JSON rather than a ZIP container.
- Per-file SHA-256 checksums and archive-level integrity manifests are not yet implemented.
- Very large libraries may require substantial memory while blobs are encoded and compressed.
- The first desktop restore flow is designed for a single workspace replacement, not merging two businesses.
- Keep the original browser workspace and a separate backup until you have checked the imported records, photo count and several sample files.


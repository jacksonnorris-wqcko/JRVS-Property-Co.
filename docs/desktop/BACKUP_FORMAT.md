# JRVS Desktop — Portable Backup Format

**Format name:** JRVS Portable Workspace  
**Initial format version:** 1  
**Container:** ZIP archive  
**Purpose:** Full local backup and manual transfer between Windows PCs

## Archive layout

```text
JRVS-Backup-<date>-<workspace-id>.jrvsbackup
  manifest.json
  database/jrvs.sqlite
  photos/original/<photo-id>.<ext>
  photos/preview/<photo-id>.<ext>
  photos/edited/<photo-id>.<ext>
  settings/settings.json
  checksums/sha256.json
```

The extension is a ZIP container with a JRVS-specific extension. A normal ZIP utility may inspect it, but restore must use the JRVS validator.

## Manifest

The manifest must include:

- `formatName`: `jrvs-portable-workspace`
- `formatVersion`: integer (initially 1)
- `appVersion`
- `schemaVersion`
- `workspaceId` — stable UUID for this business workspace, not a machine ID.
- `createdAt` — ISO-8601 timestamp.
- `recordCounts` by entity type.
- `photoCounts` by original/preview/edited asset type.
- `totalAssetBytes`
- `databaseFile`
- `checksumAlgorithm`: `SHA-256`
- `checksumsFile`

## Backup consistency

- Use SQLite's online backup API or a consistent read transaction; never copy a live database file while writes are in progress.
- Pause/queue app writes during the backup snapshot.
- Ensure every photo referenced by the snapshot is included.
- Compute SHA-256 checksums for the database and every asset.
- Write the manifest/checksum index last, then close the archive.
- The app must report backup success only after the archive can be reopened and every checksum verified.

## Restore and transfer

- Restore first into a temporary workspace, never directly over the active workspace.
- Validate archive format/version, safe relative paths, manifest counts, checksum index, SQLite integrity (`PRAGMA integrity_check`) and schema version.
- Validate every photo path referenced by the database exists and matches its checksum.
- Display a summary before the final replace: record counts, photos, total size, source workspace and backup date.
- Make a rollback backup of the current workspace before promotion.
- Promote staged workspace atomically where the platform allows; if promotion fails, preserve the existing active workspace.
- Do not merge two workspaces automatically.
- Keep the workspace UUID and all record IDs unchanged across PCs.
- On a new PC, restore the complete backup and then resume using the same business identity and numbering sequences.

## Backup retention and user experience

- Default to a complete portable backup with all photos.
- Allow choosing the destination folder and show estimated size before starting.
- Show progress by database snapshot, asset copy, hashing, archive write and final verification.
- Offer a backup reminder/status indicator, but never silently upload data.
- Metadata-only exports, if ever offered, must be clearly distinguished and must warn that photos are excluded.
- Do not automatically delete old backups. The user controls retention.

## Failure handling

- Failed backup must not alter the active database or managed photo library.
- Failed restore must leave the active workspace untouched.
- A failed checksum must identify the exact archive entry and stop promotion.
- An unsupported future format version must be rejected with a clear upgrade message, not partially restored.

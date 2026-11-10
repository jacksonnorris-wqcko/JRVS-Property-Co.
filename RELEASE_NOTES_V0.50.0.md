# JRVS Property Co. Desktop — V0.50.0

## What changed

- Added a native SQLite workspace for business and calendar data while preserving the existing JRVS JSON record structure, IDs and numbering.
- Added a native localStorage compatibility adapter so existing app workflows save to the desktop database without an immediate rewrite of every screen.
- Connected committed IndexedDB photo additions, edits, deletions and photo-library clears to the native managed photo folder.
- Added safe staged writes for photo originals/previews, SQLite metadata updates and a quarantine folder for deleted assets.
- Added a read-only legacy browser exporter at `scripts/export-legacy-workspace.js`.
- Added version 2 portable migration/backup files with SHA-256 checksums and byte-length verification for business data, calendar data and each photo original/preview.
- Kept version 1 migration/backup imports supported for existing files.
- Updated imports to wait for managed photo copies before committing business/calendar records to SQLite.
- Added Settings controls to import a legacy export or portable backup and create a full compressed backup.
- Added pre-import safety backup downloads and a native JSON rollback snapshot.
- Kept this work isolated on `desktop-transition`; the stable browser/PWA branch is unchanged.

## Migration

The legacy export helper reads the existing browser `jrvs-data`, `jrvs-calendar` and `jrvs-photo-library` stores and downloads a `.jrvslegacy.gz` file. It is read-only: the original browser workspace remains untouched. The installed desktop app validates supported integrity hashes, imports the business/calendar data into SQLite and mirrors photo originals/previews into the local managed folder.

## Known limitations

- The photo studio still uses IndexedDB as its active working cache; managed filesystem copies are mirrored separately.
- The normalized relational business-record schema is not yet promoted. Full business JSON remains preserved in SQLite for compatibility.
- The restore flow is guarded but is not yet a fully atomic swap of database and photo assets. Keep the downloaded safety backup until the import is checked.
- RAW decoding still depends on the existing remote runtime. This is not yet a fully offline desktop release.
- The complete workflow still requires a passing Windows CI build and verification against a real legacy workspace before this release should be installed as the production desktop app.

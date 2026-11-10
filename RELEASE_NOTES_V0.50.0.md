# JRVS Property Co. Desktop — V0.50.0

## What changed

- Added a native SQLite workspace for business and calendar data while preserving the existing JRVS JSON record structure and numbering.
- Added a native localStorage compatibility adapter so current app workflows save to the desktop database without an immediate rewrite of every screen.
- Added a managed local photo-copy folder with SQLite metadata, safe staged file writes and a quarantine folder for deleted assets.
- Added a read-only legacy browser exporter at `scripts/export-legacy-workspace.js`.
- Added Settings controls to import a legacy export or portable backup and create a full compressed backup.
- Added automatic pre-import safety backup downloads and a native JSON rollback snapshot.
- Kept this work isolated on `desktop-transition`; the stable browser/PWA branch is unchanged.

## Migration

The legacy export helper reads the existing browser `jrvs-data`, `jrvs-calendar` and `jrvs-photo-library` stores and downloads a `.jrvslegacy.gz` file. The installed desktop app imports the business data and calendar into SQLite, copies photo originals/previews into its managed folder and retains the original browser source data.

## Known limitations

- The current photo studio still uses IndexedDB as its working cache; managed native copies are mirrored alongside it.
- The normalized relational business-record schema is not yet promoted. Full business JSON remains preserved in SQLite for compatibility.
- GZIP backups are validated structurally but do not yet contain per-asset SHA-256 manifests.
- RAW decoding still depends on the existing remote runtime. This is not yet a fully offline desktop release.
- The full workflow must pass the Windows CI build and be verified against a real legacy workspace before this release should be installed over the working browser app.


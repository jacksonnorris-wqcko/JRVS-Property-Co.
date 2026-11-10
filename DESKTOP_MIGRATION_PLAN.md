# JRVS Property Co. — Desktop Transition Plan

**Planning baseline:** V0.48.0 on `main`  
**Working branch:** `desktop-transition`  
**Target:** Windows-first, single-PC desktop application using Tauri 2  
**Data strategy:** Local-first; manual full-business export/import for a future replacement PC

## Safety rules

1. Keep `main` as the current working PWA until the desktop build is proven.
2. Do not delete or disable the existing Supabase project, tables, storage bucket, or SQL setup during development.
3. Do not clear, overwrite, or migrate live browser data without a verified export and restore test.
4. Keep the desktop transition isolated on this branch. Promote changes only after review and testing.
5. Preserve existing business workflows, invoice/job/quote numbering, photo editor behaviour, RAW support, and the JRVS visual identity.
6. Treat a successful compile as necessary but not sufficient: test database migration, photo files, backups, restore, and a second-machine transfer.

## Current repository findings (V0.48.0)

- The default branch is `main`; the application reports version `0.48.0`.
- The main UI and application logic are concentrated in `index.html` (about 426 KB / 3,892 lines).
- Business records are loaded and saved through `localStorage`, principally under `jrvs-data` and `jrvs-calendar`.
- Property photo records and binary photo data are stored in IndexedDB database `jrvs-photo-library`, object store `photos`.
- Supabase is loaded from jsDelivr using `@supabase/supabase-js@2`. The app initialises a Supabase client and implements email sign-up/sign-in/sign-out, record snapshot sync, photo upload/download, conflict/tombstone handling, and a cloud reset workflow.
- The Supabase SQL setup creates `public.jrvs_user_state`, enables row-level security, and configures the private `jrvs-photos` storage bucket and policies.
- The app includes a PWA manifest and service worker with browser update logic.
- RAW development dynamically imports `flashraw@0.1.0` from esm.sh. Desktop packaging should bundle or otherwise pin/package this dependency so RAW processing does not unexpectedly rely on a live CDN.
- Existing records have legacy identifiers and cross-links. The desktop migration must preserve IDs and references rather than regenerate them wholesale.

## Target desktop architecture

- **Tauri 2 shell:** native Windows window, application menu, installer, filesystem integration and app lifecycle.
- **Existing web UI:** reuse the current HTML/CSS/JavaScript first; avoid a visual rewrite during the storage migration.
- **SQLite:** authoritative local database for clients, jobs, quotes, invoices, income, expenses, packages, calendar events, numbering sequences, and photo metadata.
- **Managed photo library:** original RAW/JPEG files, previews and edited outputs stored in predictable application-managed folders, with relative paths and metadata in SQLite.
- **Backup package:** a versioned ZIP containing a consistent SQLite backup, manifest, settings and the selected/all managed photo assets. Include checksums and a clear backup format version.
- **Restore/import:** validate the archive and schema before changing live data; show a summary; preserve a rollback backup; never silently overwrite an existing workspace.
- **Manual PC transfer:** export on the old PC, import on the new PC, verify record/photo counts and checksums, then continue with the same business IDs and numbering sequences.

## Migration stages

### Stage 0 — Inventory and design (current)
- Confirm repository baseline and isolate work on this branch.
- Map all storage access, Supabase calls, photo workflows, app startup, and external runtime dependencies.
- Define the SQLite schema and versioned backup format before implementation.

### Stage 1 — Desktop scaffold
- Add Tauri 2 project configuration and Windows build workflow.
- Load the existing UI in a Tauri window without changing the live PWA.
- Add a small, testable desktop bridge for app paths, file dialogs and app metadata.
- Keep PWA and browser paths working until desktop parity is established.

### Stage 2 — Local persistence layer
- Implement SQLite schema and migration/version tracking.
- Create import routines from `jrvs-data`, `jrvs-calendar`, and IndexedDB photo metadata.
- Verify every record type, ID, relationship, number sequence, and photo reference before switching the desktop app to SQLite.
- Keep a read-only legacy import path until migration is signed off.

### Stage 3 — Local photo library
- Copy source photos, RAW files, previews and edited outputs into managed folders.
- Update photo loading, editing, export, cover selection and deletion to use managed files.
- Verify large files, duplicate names, interrupted copies and missing-file recovery.
- Bundle/pin the RAW decoder for offline desktop operation.

### Stage 4 — Backup and transfer
- Implement full backup, validation, restore and manual transfer.
- Test round-trip export/import on a clean profile and confirm counts, checksums, IDs and numbering.
- Provide an explicit backup location and backup status in Settings.

### Stage 5 — Remove cloud dependencies
- Only after local persistence and backup/restore are proven, remove Supabase auth, sync, conflict/tombstone logic, cloud UI, CDN SDK and cloud-only code.
- Retain the SQL/setup file in repository history; document that it is no longer needed by the desktop edition rather than deleting historical setup prematurely.
- Remove PWA-only install/update behaviour from the desktop experience while retaining any separately needed web build only if intentionally supported.

### Stage 6 — Release readiness
- Build and sign/package a Windows installer where feasible.
- Test install, upgrade, uninstall behaviour (without deleting user data), offline operation, RAW editing, backup/restore and transfer.
- Keep the existing V0.48.0 PWA available as a fallback until the desktop edition is accepted.

## Known risks and decisions to resolve

- **Photo file ownership:** decide whether the app copies files into its managed library (recommended) or references arbitrary folders. Copying gives more reliable backups and PC transfer.
- **Backup size:** full photo inclusion can make backups large. Offer a full portable backup as the default; any smaller metadata-only export must clearly warn that it does not contain the photos.
- **Database access:** use SQLite transactions and a supported Rust/Tauri database layer; do not implement ad-hoc JSON writes for business-critical records.
- **Financial precision:** preserve existing displayed amounts and GST outcomes during migration; assess a cents-based internal representation with explicit conversion tests before changing calculations.
- **External services:** map any remaining CDN fonts, icons, RAW decoder and other network-loaded assets and package what is needed for offline use.
- **Existing browser data:** do not attempt to read browser IndexedDB/localStorage from Tauri automatically without an explicit, verified import process. Provide a safe export/import bridge from V0.48.0 first.

## Initial acceptance criteria

- Existing V0.48.0 remains usable and untouched on `main`.
- Desktop branch can launch the existing UI in a Tauri window.
- All existing data types migrate with IDs, links and numbering intact.
- Photo originals and edits remain accessible and export correctly.
- The app works offline, including RAW development.
- A full backup can be restored and transferred to another Windows PC with verified integrity.
- No cloud sync, authentication or cloud reset dependency remains in the final desktop edition.


## Confirmed user decisions and detailed specifications

- **Photo ownership confirmed:** copy all imported originals into the JRVS-managed library. Never move/delete the source files. Preserve RAW bytes, previews, edited outputs and edit recipes as separate assets.
- The user has confirmed current app data/photos are test data on the home PC. This permits development/testing against test exports, but it does not remove the requirement for a verified export and restore process.
- Detailed specifications now live in:
  - `docs/desktop/LOCAL_DATA_MODEL.md`
  - `docs/desktop/LEGACY_IMPORT_SPEC.md`
  - `docs/desktop/PHOTO_LIBRARY_SPEC.md`
  - `docs/desktop/BACKUP_FORMAT.md`

### Additional V0.48.0 inventory detail

- `jrvs-data` currently includes (at minimum) jobs, clients, quotes, invoices, income, expenses, packages, attentionCleared, numberSequences and deleted tombstones. Preserve the complete object, including unknown keys.
- `jrvs-calendar` is a separate event array in localStorage.
- IndexedDB `jrvs-photo-library` / `photos` stores records keyed by photo ID. The record can contain `blob`, optional `previewBlob`, `jobId`, `sourcePhotoId`, `editRecipe`, `editRecipeVersion`, original filename, MIME type, byte size, RAW/type/status fields, cover flag and timestamps.
- The app uses stable JOB/QUO/INV numbering sequences. Desktop migration must preserve existing values and allocate new values transactionally.
- Photo originals are immutable; edited outputs are separate photo records linked through `sourcePhotoId`. Existing flattened edited images must remain usable.
- The current RAW implementation loads FlashRaw 0.1.0 dynamically from esm.sh. Desktop packaging must bundle and pin the dependency before offline RAW support can be claimed.

### Next implementation order

1. Complete the Tauri shell launch on the user's Windows development PC.
2. Implement the read-only V0.48.0 export workflow and validate a real test archive from the home PC.
3. Implement the versioned SQLite schema and staged import with complete payload preservation.
4. Implement managed photo copy/verification and photo-path bridge.
5. Implement full portable backup/restore and round-trip validation.
6. Only then replace browser persistence and remove Supabase from the desktop edition.

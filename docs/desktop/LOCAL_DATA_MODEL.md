# JRVS Desktop — Local Data Model

**Current implementation:** SQLite-backed storage bridge, V0.50.0  
**Future direction:** relational records with full JSON payload preservation

## Current tables

### workspace_storage

The first desktop release stores the complete existing browser application values in SQLite:

- `storage_key TEXT PRIMARY KEY`
- `storage_value TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

The key values `jrvs-data` and `jrvs-calendar` retain their original JSON structures. This deliberately preserves all current fields, IDs, unknown future properties, deletion tombstones and numbering sequences while the data model is being migrated. The JavaScript UI continues to use the established synchronous localStorage API through a native adapter; the native adapter batches writes into SQLite transactions.

### managed_photos

The photo editor continues to use IndexedDB as its active working cache. A native bridge mirrors committed photo writes and deletes into a managed folder and records:

- `photo_id TEXT PRIMARY KEY`
- `original_name TEXT NOT NULL`
- `mime_type TEXT`
- `original_relpath TEXT NOT NULL`
- `preview_relpath TEXT`
- `file_size INTEGER NOT NULL`
- `metadata_json TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

New photo originals and previews are copied into Tauri's application-data folder under `workspace/photos/originals` and `workspace/photos/previews`. Metadata-only changes do not recopy the original. Committed deletes quarantine managed files in `workspace/photos/trash`.

## Import and preservation rules

- The migration exporter reads the complete `jrvs-data` and `jrvs-calendar` localStorage values from the source browser profile.
- It reads every record from IndexedDB database `jrvs-photo-library`, object store `photos`, and includes original and preview Blob bytes in the migration file.
- Current version 2 exports include SHA-256 checksums and byte lengths for business data, calendar data, and each photo asset. The importer verifies these before replacement.
- Original record IDs and JSON properties are retained. No business records are renumbered during import.
- The import is explicit; the old browser data is not cleared, overwritten or moved.
- The native database creates a pre-import JSON safety snapshot before replacing its business and calendar values.
- Photo assets are mirrored to disk only after their IndexedDB transaction commits.

## Planned schema promotion

The normalized `business_records`, `calendar_events`, `workspace_state` and `app_settings` tables described in the former design are still the intended next step. Promote data from the complete JSON payloads only after parity tests cover every current workflow. The first desktop release intentionally favours compatibility over premature normalization.

# JRVS Desktop — Local Data Model

**Status:** Design specification for the Tauri desktop transition  
**Source baseline:** V0.48.0  
**Database:** SQLite, owned by the desktop application

## Design goals

- Preserve every existing record ID, relationship, user-entered field and number sequence.
- Preserve unknown/future JSON fields during the first migration instead of dropping data because the schema is not yet fully understood.
- Use SQLite transactions for every multi-record save or migration.
- Keep photo binary files outside SQLite in a managed file library; store paths and metadata in the database.
- Make schema changes explicit and versioned.
- Keep the current browser app as a read-only migration source until import and backup/restore are accepted.

## Existing source stores

| Existing store | Current contents | Desktop destination |
|---|---|---|
| localStorage `jrvs-data` | jobs, clients, quotes, invoices, income, expenses, packages, attentionCleared, numberSequences, deleted and other app fields | typed records plus preserved JSON payload and app settings |
| localStorage `jrvs-calendar` | calendar event array | calendar_events |
| IndexedDB `jrvs-photo-library` / `photos` | photo metadata and Blob fields (including optional previewBlob) | photos metadata + managed original/preview/edited files |
| Browser preferences | theme/UI and other settings where present | app_settings key/value JSON; preserve separately from business records |

The current app's synchronised collection list is jobs, clients, quotes, invoices, income, expenses and packages. The initial migration must also preserve fields/collections outside that list, including attentionCleared, deleted, numberSequences and unknown keys.

## SQLite schema direction

Use a hybrid relational + JSON-payload design. Relational columns support safe lookup, uniqueness and relationships; the full original JSON payload preserves compatibility with fields not yet promoted into columns.

### app_meta
- `key TEXT PRIMARY KEY`
- `value TEXT NOT NULL`
- Stores schema version, import provenance, app data format version, last successful backup timestamp and workspace UUID.
- Never store credentials or Supabase auth tokens.

### business_records
- `record_type TEXT NOT NULL` — one of client, job, quote, invoice, income, expense, package, or a future registered type.
- `record_id TEXT NOT NULL` — original app ID, unchanged.
- `parent_id TEXT NULL` — optional indexed relationship helper; original relationship fields remain in payload.
- `display_number TEXT NULL` — JOB/QUO/INV number where applicable.
- `created_at TEXT NULL`, `updated_at TEXT NULL`
- `payload_json TEXT NOT NULL` — complete record object, including fields unknown to this schema.
- Primary key: (`record_type`, `record_id`).
- Indexes: (record_type, display_number), (record_type, parent_id), updated_at.

### calendar_events
- `event_id TEXT PRIMARY KEY` — preserve original event ID.
- `start_at TEXT NULL`, `end_at TEXT NULL`, `related_job_id TEXT NULL`
- `payload_json TEXT NOT NULL`
- Indexes on start_at and related_job_id.

### photos
- `photo_id TEXT PRIMARY KEY` — preserve current IndexedDB ID.
- `job_id TEXT NULL` — preserve original jobId when present; allow legacy orphan photos with no linked job.
- `source_photo_id TEXT NULL` — links edited copy to its source.
- `original_name TEXT NOT NULL`, `media_type TEXT NULL`, `file_size INTEGER NOT NULL`
- `photo_type TEXT NULL`, `status TEXT NULL`, `is_cover INTEGER NOT NULL DEFAULT 0`
- `added_at TEXT NULL`
- `original_relpath TEXT NOT NULL` — path relative to the JRVS managed library root.
- `preview_relpath TEXT NULL`
- `edit_recipe_json TEXT NULL`, `edit_recipe_version INTEGER NULL`
- `metadata_json TEXT NOT NULL` — preserves the full photo record minus Blob objects and temporary object URLs.
- Foreign-key relationship to job records is validated at application level during import so legacy orphan photos can be reported and recovered rather than silently discarded.
- Indexes on job_id, source_photo_id and (job_id, is_cover).

### app_settings
- `setting_key TEXT PRIMARY KEY`
- `value_json TEXT NOT NULL`
- Holds UI preferences and non-business configuration only.

### migration_runs
- `migration_id TEXT PRIMARY KEY`
- `source_app_version TEXT NOT NULL`
- `started_at TEXT NOT NULL`, `completed_at TEXT NULL`
- `status TEXT NOT NULL`
- `summary_json TEXT NOT NULL`
- Records import results, warnings and counts. Does not contain photo binary data.

## Numbering invariants

- Preserve the existing `numberSequences` values exactly, after validating they are numeric.
- Preserve every existing JOB/QUO/INV number exactly as stored. Do not renumber during import.
- Validate that the next sequence is greater than every recognised existing sequence number.
- If a collision or malformed sequence is found, stop the import and report it for review; do not silently allocate replacements.
- New numbers must be allocated in a SQLite transaction so two simultaneous UI actions cannot allocate the same number.

## Monetary values

- The first migration stores the original numeric values and complete payload unchanged.
- Do not silently convert binary floating-point values to integer cents in the migration.
- A later financial precision change requires separate parity tests for GST, quote totals, invoices, income and expenses.

## Deletion and audit behaviour

- Preserve the existing `deleted` tombstone array and all deletion metadata.
- Desktop deletes should use SQLite transactions and explicit confirmation UI.
- Photo deletion must remove or mark the managed asset only after the database operation succeeds; interrupted file deletion must be recoverable.
- No automatic expiry or purge of user data.

## Initial acceptance checks

1. Export every existing browser collection and count records by type.
2. Import into a fresh SQLite workspace in one transaction.
3. Compare IDs, full JSON payloads, relationships and numbering sequences.
4. Compare calendar event IDs and payloads.
5. Compare photo metadata and verify every copied asset by byte size and SHA-256.
6. Close and reopen the app; verify counts and selected sample records.
7. Export a full backup and restore into a second clean workspace; compare the same invariants.

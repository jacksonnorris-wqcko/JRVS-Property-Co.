-- JRVS Property Co. Desktop — SQLite schema migration 001
-- This migration is design-ready but is not wired into the running app yet.
-- Apply through the desktop migration runner inside a transaction.
PRAGMA foreign_keys = ON;

CREATE TABLE schema_migrations (
  version       INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  applied_at    TEXT NOT NULL
);

CREATE TABLE app_meta (
  key           TEXT PRIMARY KEY,
  value         TEXT NOT NULL
);

CREATE TABLE business_records (
  record_type   TEXT NOT NULL,
  record_id     TEXT NOT NULL,
  parent_id     TEXT,
  display_number TEXT,
  created_at    TEXT,
  updated_at    TEXT,
  payload_json  TEXT NOT NULL CHECK (json_valid(payload_json)),
  PRIMARY KEY (record_type, record_id)
);

CREATE INDEX idx_business_records_type_number
  ON business_records(record_type, display_number);
CREATE INDEX idx_business_records_type_parent
  ON business_records(record_type, parent_id);
CREATE INDEX idx_business_records_updated
  ON business_records(updated_at);

CREATE TABLE calendar_events (
  event_id      TEXT PRIMARY KEY,
  start_at      TEXT,
  end_at        TEXT,
  related_job_id TEXT,
  payload_json  TEXT NOT NULL CHECK (json_valid(payload_json))
);

CREATE INDEX idx_calendar_events_start
  ON calendar_events(start_at);
CREATE INDEX idx_calendar_events_job
  ON calendar_events(related_job_id);

CREATE TABLE photos (
  photo_id          TEXT PRIMARY KEY,
  job_id            TEXT,
  source_photo_id   TEXT,
  original_name     TEXT NOT NULL,
  media_type        TEXT,
  file_size         INTEGER NOT NULL CHECK (file_size >= 0),
  photo_type        TEXT,
  status            TEXT,
  is_cover          INTEGER NOT NULL DEFAULT 0 CHECK (is_cover IN (0, 1)),
  added_at          TEXT,
  original_relpath  TEXT NOT NULL,
  preview_relpath   TEXT,
  edit_recipe_json  TEXT CHECK (edit_recipe_json IS NULL OR json_valid(edit_recipe_json)),
  edit_recipe_version INTEGER,
  metadata_json     TEXT NOT NULL CHECK (json_valid(metadata_json))
);

CREATE INDEX idx_photos_job
  ON photos(job_id);
CREATE INDEX idx_photos_source
  ON photos(source_photo_id);
CREATE INDEX idx_photos_job_cover
  ON photos(job_id, is_cover);

-- Non-record top-level values from jrvs-data. This includes numbering counters,
-- cleared-attention state, deletion tombstones and any unrecognised future keys.
CREATE TABLE workspace_state (
  state_key     TEXT PRIMARY KEY,
  value_json    TEXT NOT NULL CHECK (json_valid(value_json))
);

CREATE TABLE app_settings (
  setting_key   TEXT PRIMARY KEY,
  value_json    TEXT NOT NULL CHECK (json_valid(value_json))
);

CREATE TABLE migration_runs (
  migration_id  TEXT PRIMARY KEY,
  source_app_version TEXT NOT NULL,
  started_at    TEXT NOT NULL,
  completed_at  TEXT,
  status        TEXT NOT NULL,
  summary_json  TEXT NOT NULL CHECK (json_valid(summary_json))
);

INSERT INTO schema_migrations(version, name, applied_at)
VALUES (1, 'initial_local_workspace', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

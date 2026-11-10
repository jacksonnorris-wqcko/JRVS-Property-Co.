#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::Engine;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
};
use tauri::{webview::WebviewWindowBuilder, AppHandle, Manager, WebviewUrl};
use tauri_plugin_updater::UpdaterExt;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopUpdateInfo {
    version: String,
    current_version: String,
    notes: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopWorkspaceStatus {
    database_path: String,
    storage_keys: usize,
    has_business_data: bool,
    managed_photo_count: usize,
    managed_photo_bytes: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopPhotoResult {
    photo_id: String,
    original_path: String,
    preview_path: Option<String>,
    file_size: u64,
}

fn workspace_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    path.push("workspace");
    fs::create_dir_all(&path).map_err(|e| format!("Could not create JRVS workspace folder: {e}"))?;
    Ok(path)
}

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(workspace_dir(app)?.join("jrvs.sqlite"))
}

fn open_database(app: &AppHandle) -> Result<Connection, String> {
    let path = database_path(app)?;
    let connection = Connection::open(&path)
        .map_err(|e| format!("Could not open the JRVS local database: {e}"))?;
    connection
        .execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = FULL;
             PRAGMA foreign_keys = ON;
             CREATE TABLE IF NOT EXISTS workspace_storage (
               storage_key TEXT PRIMARY KEY NOT NULL,
               storage_value TEXT NOT NULL,
               updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             );
             CREATE TABLE IF NOT EXISTS workspace_meta (
               meta_key TEXT PRIMARY KEY NOT NULL,
               meta_value TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS managed_photos (
               photo_id TEXT PRIMARY KEY NOT NULL,
               original_name TEXT NOT NULL,
               mime_type TEXT,
               original_relpath TEXT NOT NULL,
               preview_relpath TEXT,
               file_size INTEGER NOT NULL DEFAULT 0,
               metadata_json TEXT NOT NULL,
               updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             );",
        )
        .map_err(|e| format!("Could not initialise the JRVS local database: {e}"))?;
    Ok(connection)
}

fn read_storage(connection: &Connection) -> Result<HashMap<String, String>, String> {
    let mut statement = connection
        .prepare("SELECT storage_key, storage_value FROM workspace_storage ORDER BY storage_key")
        .map_err(|e| e.to_string())?;
    let rows = statement
        .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?;
    let mut result = HashMap::new();
    for row in rows {
        let (key, value) = row.map_err(|e| e.to_string())?;
        result.insert(key, value);
    }
    Ok(result)
}

fn save_storage_entries(
    connection: &mut Connection,
    entries: &HashMap<String, Option<String>>,
) -> Result<(), String> {
    let transaction = connection.transaction().map_err(|e| e.to_string())?;
    for (key, value) in entries {
        if key.trim().is_empty() || key.len() > 512 {
            return Err("A local storage key was invalid; no changes were saved.".to_string());
        }
        match value {
            Some(value) => {
                transaction
                    .execute(
                        "INSERT INTO workspace_storage(storage_key, storage_value, updated_at)
                         VALUES (?1, ?2, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
                         ON CONFLICT(storage_key) DO UPDATE SET
                           storage_value=excluded.storage_value,
                           updated_at=excluded.updated_at",
                        params![key, value],
                    )
                    .map_err(|e| e.to_string())?;
            }
            None => {
                transaction
                    .execute("DELETE FROM workspace_storage WHERE storage_key = ?1", params![key])
                    .map_err(|e| e.to_string())?;
            }
        }
    }
    transaction.commit().map_err(|e| e.to_string())
}

fn safe_asset_id(value: &str) -> String {
    let cleaned: String = value
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_')
        .take(100)
        .collect();
    if cleaned.is_empty() {
        format!("photo-{}", uuid_fallback())
    } else {
        cleaned
    }
}

fn uuid_fallback() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis().to_string())
        .unwrap_or_else(|_| "unknown".to_string())
}

fn safe_extension(name: &str) -> String {
    let ext = Path::new(name)
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("bin");
    let cleaned: String = ext
        .chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .take(10)
        .collect();
    if cleaned.is_empty() {
        "bin".to_string()
    } else {
        cleaned.to_lowercase()
    }
}

#[tauri::command]
fn desktop_save_storage(
    app: AppHandle,
    entries: HashMap<String, Option<String>>,
) -> Result<(), String> {
    let mut connection = open_database(&app)?;
    save_storage_entries(&mut connection, &entries)
}

#[tauri::command]
fn desktop_photo_exists(app: AppHandle, photo_id: String) -> Result<bool, String> {
    let connection = open_database(&app)?;
    connection
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM managed_photos WHERE photo_id=?1)",
            params![photo_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn desktop_storage_status(app: AppHandle) -> Result<DesktopWorkspaceStatus, String> {
    let connection = open_database(&app)?;
    let storage_keys: usize = connection
        .query_row("SELECT COUNT(*) FROM workspace_storage", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    let has_business_data: bool = connection
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM workspace_storage WHERE storage_key='jrvs-data')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    let (managed_photo_count, managed_photo_bytes): (usize, u64) = connection
        .query_row(
            "SELECT COUNT(*), COALESCE(SUM(file_size),0) FROM managed_photos",
            [],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| e.to_string())?;
    Ok(DesktopWorkspaceStatus {
        database_path: database_path(&app)?.to_string_lossy().to_string(),
        storage_keys,
        has_business_data,
        managed_photo_count,
        managed_photo_bytes,
    })
}

#[tauri::command]
fn desktop_import_legacy_workspace(
    app: AppHandle,
    business_json: String,
    calendar_json: String,
) -> Result<serde_json::Value, String> {
    let business: serde_json::Value = serde_json::from_str(&business_json)
        .map_err(|e| format!("The business-data file is not valid JSON: {e}"))?;
    if !business.is_object() {
        return Err("The business-data file must contain a JRVS data object.".to_string());
    }
    let calendar: serde_json::Value = serde_json::from_str(&calendar_json)
        .map_err(|e| format!("The calendar data is not valid JSON: {e}"))?;
    if !calendar.is_array() {
        return Err("The calendar data must be an array.".to_string());
    }

    let jobs = business.get("jobs").and_then(|v| v.as_array()).map_or(0, Vec::len);
    let clients = business.get("clients").and_then(|v| v.as_array()).map_or(0, Vec::len);
    let quotes = business.get("quotes").and_then(|v| v.as_array()).map_or(0, Vec::len);
    let invoices = business.get("invoices").and_then(|v| v.as_array()).map_or(0, Vec::len);
    let income = business.get("income").and_then(|v| v.as_array()).map_or(0, Vec::len);
    let expenses = business.get("expenses").and_then(|v| v.as_array()).map_or(0, Vec::len);
    let calendar_count = calendar.as_array().map_or(0, Vec::len);

    let root = workspace_dir(&app)?;
    let mut connection = open_database(&app)?;
    let current = read_storage(&connection)?;
    if !current.is_empty() {
        let backups = root.join("backups");
        fs::create_dir_all(&backups).map_err(|e| e.to_string())?;
        let snapshot = serde_json::json!({
            "format": "jrvs-pre-import-rollback",
            "createdAt": chrono_fallback_timestamp(),
            "storage": current
        });
        fs::write(
            backups.join(format!("pre-import-{}.json", uuid_fallback())),
            serde_json::to_vec_pretty(&snapshot).map_err(|e| e.to_string())?,
        )
        .map_err(|e| format!("Could not create the pre-import safety copy: {e}"))?;
    }

    let mut entries = HashMap::new();
    entries.insert("jrvs-data".to_string(), Some(business_json));
    entries.insert("jrvs-calendar".to_string(), Some(calendar_json));
    save_storage_entries(&mut connection, &entries)?;

    Ok(serde_json::json!({
        "jobs": jobs,
        "clients": clients,
        "quotes": quotes,
        "invoices": invoices,
        "income": income,
        "expenses": expenses,
        "calendarEvents": calendar_count,
        "photoImportRequired": true
    }))
}

fn chrono_fallback_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or_default();
    format!("unix-{seconds}")
}

#[tauri::command]
fn desktop_store_photo(
    app: AppHandle,
    photo_id: String,
    original_name: String,
    mime_type: Option<String>,
    metadata_json: String,
    original_base64: String,
    preview_base64: Option<String>,
) -> Result<DesktopPhotoResult, String> {
    let metadata: serde_json::Value = serde_json::from_str(&metadata_json)
        .map_err(|e| format!("Photo metadata was invalid: {e}"))?;
    let original_bytes = base64::engine::general_purpose::STANDARD
        .decode(original_base64.as_bytes())
        .map_err(|e| format!("Could not decode the original photo: {e}"))?;
    if original_bytes.is_empty() {
        return Err("The original photo file was empty.".to_string());
    }
    let preview_bytes = preview_base64
        .filter(|value| !value.is_empty())
        .map(|value| {
            base64::engine::general_purpose::STANDARD
                .decode(value.as_bytes())
                .map_err(|e| format!("Could not decode the photo preview: {e}"))
        })
        .transpose()?;

    let root = workspace_dir(&app)?.join("photos");
    let originals = root.join("originals");
    let previews = root.join("previews");
    let staging = root.join("staging");
    fs::create_dir_all(&originals).map_err(|e| e.to_string())?;
    fs::create_dir_all(&previews).map_err(|e| e.to_string())?;
    fs::create_dir_all(&staging).map_err(|e| e.to_string())?;

    let stable_id = safe_asset_id(&photo_id);
    let original_file = format!("{stable_id}.{}", safe_extension(&original_name));
    let original_relative = format!("photos/originals/{original_file}");
    let original_target = originals.join(&original_file);
    let original_temp = staging.join(format!("{stable_id}.original.tmp"));
    fs::write(&original_temp, &original_bytes)
        .map_err(|e| format!("Could not stage the original photo: {e}"))?;
    fs::rename(&original_temp, &original_target)
        .map_err(|e| format!("Could not commit the original photo copy: {e}"))?;

    let (preview_relative, preview_size) = if let Some(bytes) = preview_bytes {
        let file = format!("{stable_id}.jpg");
        let target = previews.join(&file);
        let temp = staging.join(format!("{stable_id}.preview.tmp"));
        fs::write(&temp, &bytes).map_err(|e| format!("Could not stage the preview: {e}"))?;
        fs::rename(&temp, &target)
            .map_err(|e| format!("Could not commit the preview copy: {e}"))?;
        (Some(format!("photos/previews/{file}")), bytes.len() as u64)
    } else {
        (None, 0)
    };

    let mut connection = open_database(&app)?;
    connection
        .execute(
            "INSERT INTO managed_photos(photo_id, original_name, mime_type, original_relpath, preview_relpath, file_size, metadata_json, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(photo_id) DO UPDATE SET
               original_name=excluded.original_name,
               mime_type=excluded.mime_type,
               original_relpath=excluded.original_relpath,
               preview_relpath=excluded.preview_relpath,
               file_size=excluded.file_size,
               metadata_json=excluded.metadata_json,
               updated_at=excluded.updated_at",
            params![
                photo_id,
                original_name,
                mime_type,
                original_relative,
                preview_relative,
                original_bytes.len() as u64 + preview_size,
                metadata.to_string()
            ],
        )
        .map_err(|e| format!("Could not save managed photo metadata: {e}"))?;

    Ok(DesktopPhotoResult {
        photo_id,
        original_path: original_target.to_string_lossy().to_string(),
        preview_path: preview_relative.map(|p| root.join(p.strip_prefix("photos/").unwrap_or(&p)).to_string_lossy().to_string()),
        file_size: original_bytes.len() as u64 + preview_size,
    })
}

#[tauri::command]
fn desktop_delete_photo(app: AppHandle, photo_id: String) -> Result<(), String> {
    let root = workspace_dir(&app)?.join("photos");
    let mut connection = open_database(&app)?;
    let row: Option<(String, Option<String>)> = connection
        .query_row(
            "SELECT original_relpath, preview_relpath FROM managed_photos WHERE photo_id=?1",
            params![photo_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(|e| e.to_string())?;
    if let Some((original, preview)) = row {
        let trash = root.join("trash");
        fs::create_dir_all(&trash).map_err(|e| e.to_string())?;
        for relative in std::iter::once(Some(original)).chain(std::iter::once(preview)) {
            if let Some(relative) = relative {
                let source = workspace_dir(&app)?.join(relative);
                if source.exists() {
                    let name = source.file_name().and_then(|s| s.to_str()).unwrap_or("photo.bin");
                    let target = trash.join(format!("{}-{name}", uuid_fallback()));
                    fs::rename(&source, &target)
                        .map_err(|e| format!("Could not quarantine a deleted photo asset: {e}"))?;
                }
            }
        }
        connection
            .execute("DELETE FROM managed_photos WHERE photo_id=?1", params![photo_id])
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn desktop_check_update(app: tauri::AppHandle) -> Result<Option<DesktopUpdateInfo>, String> {
    let update = app
        .updater()
        .map_err(|error| error.to_string())?
        .check()
        .await
        .map_err(|error| error.to_string())?;

    Ok(update.map(|update| DesktopUpdateInfo {
        version: update.version,
        current_version: update.current_version,
        notes: update.body,
    }))
}

#[tauri::command]
async fn desktop_install_update(app: tauri::AppHandle) -> Result<(), String> {
    let update = app
        .updater()
        .map_err(|error| error.to_string())?
        .check()
        .await
        .map_err(|error| error.to_string())?
        .ok_or_else(|| "No JRVS update is currently available.".to_string())?;

    update
        .download_and_install(|_chunk_length, _content_length| {}, || {})
        .await
        .map_err(|error| error.to_string())?;

    app.restart();
}

fn storage_initialization_script(seed: &HashMap<String, String>) -> Result<String, String> {
    let seed = serde_json::to_string(seed).map_err(|e| e.to_string())?;
    let seed = seed.replace("</", "<\\/");
    Ok(format!(
        r#"(function() {{
  // This script is attached only to the native JRVS webview.
  const seed = {seed};
  const original = window.localStorage;
  const memory = new Map(Object.entries(seed));
  const pending = new Map();
  try {{
    for (let i = 0; i < original.length; i++) {{
      const key = original.key(i);
      if (key !== null && !memory.has(key)) {{
        memory.set(key, original.getItem(key));
        pending.set(key, original.getItem(key));
      }}
    }}
  }} catch (_) {{}}
  let timer = null;
  let saveQueue = Promise.resolve();
  const invoke = () => window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke;
  const flush = () => {{
    if (timer) {{ clearTimeout(timer); timer = null; }}
    if (!pending.size) return saveQueue;
    const batch = Object.fromEntries(pending);
    pending.clear();
    saveQueue = saveQueue.then(() => {{
      const call = invoke();
      if (!call) throw new Error('JRVS native storage service is unavailable.');
      return call('desktop_save_storage', {{ entries: batch }});
    }}).catch(error => {{
      Object.entries(batch).forEach(([key, value]) => pending.set(key, value));
      window.__JRVS_STORAGE_ERROR__ = String(error && error.message || error);
      console.error('JRVS native storage save failed', error);
    }});
    return saveQueue;
  }};
  const schedule = () => {{
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 90);
  }};
  const storage = {{
    getItem(key) {{ const value = memory.get(String(key)); return value === undefined ? null : value; }},
    setItem(key, value) {{ key=String(key); value=String(value); memory.set(key,value); pending.set(key,value); schedule(); }},
    removeItem(key) {{ key=String(key); memory.delete(key); pending.set(key,null); schedule(); }},
    clear() {{ for (const key of memory.keys()) pending.set(key,null); memory.clear(); schedule(); }},
    key(index) {{ return Array.from(memory.keys())[Number(index)] ?? null; }},
    get length() {{ return memory.size; }}
  }};
  Object.defineProperty(window, 'localStorage', {{ value: storage, configurable: false }});
  window.__JRVS_NATIVE_STORAGE__ = {{
    flush,
    entries: () => Object.fromEntries(memory),
    replace(entries) {{ for (const [key,value] of Object.entries(entries || {{}})) storage.setItem(key,value); }}
  }};
  window.addEventListener('pagehide', () => {{ try {{ flush(); }} catch (_) {{}} }});
  window.addEventListener('visibilitychange', () => {{ if (document.visibilityState === 'hidden') {{ try {{ flush(); }} catch (_) {{}} }} }});
  window.__JRVS_NATIVE_STORAGE_READY__ = true;
}})();"#
    ))
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_updater::Builder::new()
                .pubkey(include_str!("../updater.pubkey").trim())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            desktop_save_storage,
            desktop_storage_status,
            desktop_import_legacy_workspace,
            desktop_store_photo,
            desktop_photo_exists,
            desktop_delete_photo,
            desktop_check_update,
            desktop_install_update
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            let connection = open_database(&handle)
                .map_err(|error| std::io::Error::new(std::io::ErrorKind::Other, error))?;
            let seed = read_storage(&connection)
                .map_err(|error| std::io::Error::new(std::io::ErrorKind::Other, error))?;
            drop(connection);
            let script = storage_initialization_script(&seed)
                .map_err(|error| std::io::Error::new(std::io::ErrorKind::Other, error))?;

            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("JRVS Property Co.")
                .inner_size(1440.0, 940.0)
                .min_inner_size(1120.0, 720.0)
                .resizable(true)
                .center()
                .initialization_script(script)
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running JRVS Property Co.");
}

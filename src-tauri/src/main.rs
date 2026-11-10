#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_updater::UpdaterExt;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopUpdateInfo {
    version: String,
    current_version: String,
    notes: Option<String>,
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

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_updater::Builder::new()
                .pubkey(include_str!("../updater.pubkey").trim())
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            desktop_check_update,
            desktop_install_update
        ])
        .run(tauri::generate_context!())
        .expect("error while running JRVS Property Co.");
}

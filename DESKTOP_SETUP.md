# JRVS Property Co. Desktop — Developer Setup

This is the first Tauri 2 desktop shell for the existing JRVS Property Co. V0.48.0 interface. It is deliberately isolated on the `desktop-transition` branch. The current PWA on `main` is not changed.

## Windows prerequisites

Install these on the Windows development PC:

1. **Microsoft C++ Build Tools** — select the **Desktop development with C++** workload.
2. **Rust** using rustup, with the stable MSVC toolchain.
3. **Node.js LTS** (includes npm).
4. **Microsoft Edge WebView2 Runtime** (normally already present on Windows 10/11).

Official instructions: https://v2.tauri.app/start/prerequisites/

## Get the project onto your PC

1. Open the [desktop-transition branch](https://github.com/jacksonnorris-wqcko/JRVS-Property-Co./tree/desktop-transition).
2. Choose **Code → Download ZIP** and extract the ZIP to a normal folder, for example `Documents\\JRVS-Desktop`.
3. Open that extracted folder in File Explorer.
4. Right-click an empty area in the folder and choose **Open in Terminal** (or open PowerShell and `cd` into the extracted folder).

You do not need Git installed for this first local test. Git is only needed later if you want to pull code changes directly rather than downloading a fresh branch ZIP.

## First launch

Open PowerShell in the repository folder and run:

```powershell
npm install
npm run desktop:dev
```

To create Windows installers:

```powershell
npm run desktop:build
```

Build output is created under `src-tauri/target/release/bundle/`.

## Downloading the Windows test installer

Every push to `desktop-transition` runs the Windows installer build. When the run succeeds:

1. Open [JRVS Desktop Shell Check runs](https://github.com/jacksonnorris-wqcko/JRVS-Property-Co./actions/workflows/desktop-shell-check.yml).
2. Open the latest successful run for the commit you want to test.
3. Scroll to **Artifacts** and download **JRVS-Desktop-Windows-Installers**.
4. Extract the downloaded ZIP. Use the `.exe` NSIS installer for the normal test installation; the `.msi` is included as an alternative.
5. Install into Windows as a test app. Do not import your live business data yet.

These CI artifacts are temporary test builds retained for 14 days. They are not signed production releases and do not enable the in-app updater. A successful CI run proves the installer was generated and packaged; it does not replace the real Windows migration, photo and restore checks below.

## Desktop workspace storage and migration (V0.50.0)

- The desktop app creates its own SQLite database at the Tauri application data path under `workspace/jrvs.sqlite`. A compatibility table stores the complete `jrvs-data` and `jrvs-calendar` JSON payloads without dropping unknown fields or changing existing record IDs and number sequences.
- The frontend keeps its existing synchronous localStorage interface, but the desktop webview loads and saves those keys through a native SQLite-backed adapter. Writes are committed transactionally in short batches.
- Photo records continue to be used by the existing photo UI in IndexedDB. Committed photo additions, updates and deletes are mirrored to the native managed library under `workspace/photos/originals`, `workspace/photos/previews` and `workspace/photos/trash`, with metadata recorded in SQLite. The native mirror queue is flushed during import. Originals are copied; source files are not moved or deleted.
- Settings includes a **Workspace data & backups** panel. Current exports use format version 2 (`.jrvsbackup.gz`) and include SHA-256 checksums plus byte lengths for business data, calendar data, and each photo original/preview. Version 1 files remain importable but do not have checksum verification.
- The old browser/PWA data lives in a different browser storage profile and is not automatically visible to the Windows app. Use the read-only exporter described below to create a migration file; the source browser data remains untouched.
- The desktop release remains isolated on `desktop-transition`. The stable browser/PWA version on `main` is not modified.
- The legacy Supabase routines remain in shared source for compatibility, but the desktop build removes the Supabase SDK and cloud initialisation. No cloud login or sync is required by the desktop app.
- Weather still uses an external service and the RAW decoder still loads from the existing remote runtime. This release is not fully offline-ready.
- The normalized relational `business_records` model in `docs/desktop/LOCAL_DATA_MODEL.md` remains a future schema promotion. Current SQLite persistence stores full JSON records intact to preserve compatibility.

### V0.50 verification status and limitations

The code path now mirrors photo-library transactions into the native managed folder and checks version 2 migration/backup payload hashes before replacement. The build workflow verifies the generated desktop frontend and compiles the Tauri application; it does not exercise a real Windows user profile or a real photo library.

Before treating V0.50 as production-ready, complete these checks on the target Windows PC:

1. Export the existing browser workspace using the read-only helper below.
2. Import the export into JRVS Desktop. Confirm the reported business/calendar/photo counts match the export.
3. Check several original JPEGs and CR2 files, previews, edited outputs, cover selections and orphan photos.
4. Create a full backup, restore it into a separate clean Windows user profile or test PC, and compare counts plus sample file hashes.
5. Restart the app and confirm job, quote and invoice sequences continue correctly.
6. Disconnect the PC from the internet and verify the normal workflows. RAW development is still known to require the remote decoder; do not treat offline RAW as supported.
7. Keep the old browser workspace and the downloaded pre-import backup until the checks pass.

**Important:** Import is a guarded replacement workflow, not yet a fully atomic swap of SQLite and the photo directory. The safety backup is downloaded before import, but the user must keep it available for manual recovery if an interrupted import is reported. Do not uninstall the old working app or delete its browser data during this test.

### Migrate from the existing browser app

1. Open the original JRVS browser/PWA app in Chrome or Edge on the PC where its data currently lives.
2. Open the [legacy export helper](https://raw.githubusercontent.com/jacksonnorris-wqcko/JRVS-Property-Co./desktop-transition/scripts/export-legacy-workspace.js) and copy its complete contents.
3. In the old JRVS browser tab, press **F12**, select **Console**, paste the helper and press **Enter**. If Chrome asks to allow pasting, follow its on-screen instruction. The helper reads localStorage and the existing IndexedDB photo library; it does not delete or rewrite anything.
4. Wait for the download named `JRVS-Legacy-Migration-YYYY-MM-DD.jrvslegacy.gz`.
5. Open the installed JRVS Desktop app, go to **Settings → Workspace data & backups**, select that file under **Import an existing JRVS export**, review the counts and confirm.
6. JRVS first downloads a safety backup of the desktop workspace, then copies the business records, calendar events and photo files into the local desktop workspace.

### Portable backups

Use **Create backup** in the same Settings panel. Keep the resulting `.jrvsbackup.gz` somewhere separate from the PC (for example, an external drive). The file contains the original photo data and preview blobs as well as the business records and calendar. Restoring a backup replaces the desktop workspace after confirmation; the app downloads a safety backup first.

The first backup format is a gzip-compressed JSON payload with structural validation. Per-asset SHA-256 verification, scheduled backup reminders and a native restore preview are planned follow-up hardening. Keep the original browser app/data and at least one separate backup until you have confirmed the imported record and photo counts.



## Automatic desktop updates

JRVS Desktop uses the signed Tauri updater and GitHub Releases. Once the first signed desktop installer has been installed, later tagged releases can be checked and installed from inside JRVS. The app checks for updates at startup and the version badge can also be used to check manually.

### One-time signing-key setup

The updater requires a stable signing key pair. Generate it on a trusted PC and keep the private key out of the repository.

In PowerShell, from the project folder:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.tauri" | Out-Null
npm.cmd run tauri signer generate -- -w "$env:USERPROFILE\.tauri\jrvs-updater.key"
```

The command creates a private key and a matching `jrvs-updater.key.pub` public-key file. Do not commit or share `jrvs-updater.key`. Keep a secure offline copy as well; losing the private key prevents publishing trusted updates for existing installations.

1. Copy the complete contents of `jrvs-updater.key.pub` into `src-tauri/updater.pubkey`, replacing `PUBLIC_KEY_PENDING_SETUP`.
2. Replace the `plugins.updater.pubkey` value in `src-tauri/tauri.conf.json` with the same public-key contents.
3. In GitHub, open **Settings → Secrets and variables → Actions → New repository secret**. Create `TAURI_SIGNING_PRIVATE_KEY` using the complete contents of `jrvs-updater.key`.
4. If you protected the key with a password, create `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` with that password. If you used no password, that second secret can be omitted.

The public key is safe to commit. The private key and its password must only be stored as GitHub Actions secrets and in your own secure backup.

### Publishing a desktop release

The `.github/workflows/desktop-release.yml` workflow runs when a tag matching `desktop-v*` is pushed. It reads the desktop version from `src-tauri/tauri.conf.json`, builds the Windows installer, generates signed updater artifacts and uploads the installer plus updater manifest (`latest.json`) to the matching GitHub Release.

The first signed release is **0.49.0**. Because the currently running development shell is not an installed updater-enabled release, install that first Windows installer once. After that, normal future releases can be installed from JRVS without downloading and extracting a new source ZIP.

To create the first release after the public key and GitHub secrets are configured, open **Releases → Draft a new release**. Create the tag `desktop-v0.49.0` targeting the `desktop-transition` branch, then publish the release. This pushes the tag and starts the signed Windows build; the workflow uploads the installer and updater manifest to that release. Do not publish before the public key and private-key secret are in place.

Windows updates use Tauri's passive installer mode, which shows installer progress. The updater verifies the update signature before installation. See the [official Tauri updater guide](https://v2.tauri.app/plugin/updater/) for the signing and updater model.

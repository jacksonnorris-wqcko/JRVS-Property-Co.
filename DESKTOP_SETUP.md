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

## Current scope and limitations

- The desktop preparation step creates an isolated `desktop-dist/` frontend from the V0.48.0 interface. It removes the Supabase SDK/key bootstrap, does not initialise cloud sync, hides cloud/PWA installation and browser-update controls, and keeps the main PWA source unchanged.
- The initial window is configured for a desktop workspace (1440 × 940, minimum 1120 × 720).
- The initial shell still uses the existing WebView localStorage and IndexedDB stores as a temporary compatibility layer. No native filesystem, SQLite, managed photo-library, backup, or restore commands are enabled yet.
- Legacy Supabase routines remain in the shared source so the existing PWA can continue working on `main`; the generated desktop frontend strips the Supabase SDK, credentials/bootstrap, sync initialisation and cloud settings UI. The shared legacy routines can be removed from the desktop source once local persistence, photo migration, and full backup/restore are implemented and verified.
- The generated desktop frontend is isolated in `desktop-dist/`; repository documentation, Rust sources, and development files are not included as frontend assets.
- Weather data still uses an external service, and genuine RAW decoding still depends on the existing runtime implementation. This first shell is not yet an offline-ready desktop release.

Do not use this shell with important business data yet. The local database and verified migration/backup path are future stages.


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

The `.github/workflows/desktop-release.yml` workflow runs when a tag matching `desktop-v*` is pushed. It builds the Windows installer, generates signed updater artifacts and publishes a GitHub Release with the updater manifest (`latest.json`).

The first signed release is **0.49.0**. Because the currently running development shell is not an installed updater-enabled release, install that first Windows installer once. After that, normal future releases can be installed from JRVS without downloading and extracting a new source ZIP.

To create the first release after the public key and GitHub secrets are configured, publish the tag `desktop-v0.49.0` on the commit containing the completed key setup. Do not publish a release before the public key and private-key secret are in place.

Windows updates use Tauri's passive installer mode, which shows installer progress. The updater verifies the update signature before installation. See the [official Tauri updater guide](https://v2.tauri.app/plugin/updater/) for the signing and updater model.

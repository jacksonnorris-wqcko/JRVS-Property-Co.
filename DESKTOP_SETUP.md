# JRVS Property Co. Desktop — Developer Setup

This is the first Tauri 2 desktop shell for the existing JRVS Property Co. V0.48.0 interface. It is deliberately isolated on the `desktop-transition` branch. The current PWA on `main` is not changed.

## Windows prerequisites

Install these on the Windows development PC:

1. **Microsoft C++ Build Tools** — select the **Desktop development with C++** workload.
2. **Rust** using rustup, with the stable MSVC toolchain.
3. **Node.js LTS** (includes npm).
4. **Microsoft Edge WebView2 Runtime** (normally already present on Windows 10/11).

Official instructions: https://v2.tauri.app/start/prerequisites/

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

- The shell loads the existing V0.48.0 web interface without changing its business logic or existing browser storage.
- The initial window is configured for a desktop workspace (1440 × 940, minimum 1120 × 720).
- No native filesystem, SQLite, photo-library, backup, or restore commands are enabled yet.
- The existing Supabase code and browser/PWA code are intentionally still present at this stage. They will only be retired after local persistence, photo migration, and full backup/restore have been implemented and tested.
- The initial frontend asset configuration embeds the repository root for a low-risk first launch. Before shipping installers, this will be narrowed to a dedicated desktop asset directory so development documents and repository-only files are not packaged.
- The existing app still has external runtime dependencies (including the Supabase SDK and RAW decoder). This first shell is not yet an offline-ready desktop release.

Do not use this shell with important business data yet. The local database and verified migration/backup path are future stages.

# JRVS Property Co. — Live Project Status

> This is the durable handover for every JRVS development conversation. Read it at the start of a new chat, then verify the live GitHub branch and files before making changes. The repository is the source of truth for code; this file is the source of truth for the latest recorded work state and next action.

**Last reviewed:** 11 November 2026 (Australia/Sydney)  
**Repository:** [jacksonnorris-wqcko/JRVS-Property-Co.](https://github.com/jacksonnorris-wqcko/JRVS-Property-Co.)  
**Active desktop branch:** `desktop-transition`  
**Current desktop version:** `0.53.0`  
**Stable browser/PWA branch:** `main` — keep it unchanged unless the user explicitly requests browser/PWA work.

## Start here — current position

JRVS has two deliberately separate tracks:

- **Desktop:** Windows-first Tauri 2 application on `desktop-transition`. All current desktop development belongs here.
- **Browser/PWA:** stable application on `main`. This is the fallback and must not be overwritten by desktop work.

The desktop branch is independently versioned. The desktop version is defined in `package.json`, `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`. The desktop preparation script now reads `package.json` and injects that version into the generated desktop app. The inherited `index.html` source and root `version.json`/README may still show the stable PWA baseline version; do not mistake those inherited values for the desktop release version or change them just to make the desktop number match.

The desktop build now runs `npm run handover:check` before building. This validates that `package.json`, `Cargo.toml` and Tauri configuration agree, that this handover records the current desktop version/branch, and that the new-chat and continuity instructions are present. The check is wired into `.github/workflows/desktop-shell-check.yml`.

## Current active work and next action

### Application task — shared scrolling fix verified

The shared desktop scrolling fix was committed on 11 November 2026:

- **Commit:** `798542fa80e0f2cae02cf0f49b68c59c38091cbd`
- **Message:** `Fix shared desktop vertical scrolling across all workspace tabs`
- **File changed:** `scripts/prepare-desktop.mjs`
- **Implementation:** desktop document/body are viewport-locked; the desktop shell is a fixed-height grid; the main workspace and sidebar have their own vertical scroll areas; active page content remains naturally sized and visible.

**Status:** user-confirmed working in the Windows desktop app on 11 November 2026. The current Windows CI build also completed successfully for the handover commit `f40d221a2305c015a404adfbf169272ff0d7c37f`. CI confirms the project check, Windows installer build, output verification and artifact upload; it is not a substitute for the user's runtime test.

**User test result:** user reported "alright it works" after testing the build. Treat the shared scrolling issue as closed unless a specific page/control is later reported as still clipped.

### Active major development — Phase 1 + Phase 2: Photo Studio engine and professional Develop tools

**User-approved scope:** improve Photo Studio as a professional property-photography editor. Finance is out of scope.

**Current development milestone (desktop-transition, version 0.53.0):**
- FlashRaw `0.1.0` pinned as a desktop dependency. The generated frontend copies the package browser module and WASM assets into `desktop-dist/vendor/flashraw`; the editor imports the local browser entry instead of loading esm.sh at runtime.
- RAW sensor development requests CPU SIMD, automatic demosaic, as-shot white balance and highlight reconstruction. The editor stores whether a recipe used sensor-developed RAW and attempts to re-develop the untouched CR2 when reopening. If sensor decoding falls back to the embedded JPEG preview, the editor warns and clears the sensor-developed marker so a later save doesn't misrepresent the image source.
- Added a three-anchor luminance tone curve and eight-band HSL mixer (hue/saturation/luminance for red, orange, yellow, green, aqua, blue, purple and magenta).
- Tone curve and HSL data are persisted in edit recipe schema v4; old recipe schemas v1–v3 remain accepted. Advanced controls participate in undo/redo and are reset/isolated appropriately for presets and batch operations.
- Added `npm run photo:engine:check` and wired it into Windows CI. It checks HSL RGB round trips, default curve identity, monotonic shaped curve, recipe compatibility and local RAW bundling references.

**Build/test evidence:**
- Static parsing of the 5 inline HTML scripts passed after the initial controls were added.
- The first Windows CI attempt failed before Tauri compilation because the preparation script checked for `vendor/flashraw/index.js`; the published package browser entry is `browser.js`. The preparation check and import were corrected, and the engine regression test was added.
- **Next check:** confirm the latest Windows CI run passes with the corrected browser entry, required WASM files and engine regression check.
- **Not yet user-tested:** RAW development or the new tone curve/HSL controls in the installed Windows app.
- **Not yet verified:** EOS 600D CR2 compatibility, offline runtime with network disabled, RAW fidelity/highlight reconstruction and preview/export image-quality parity.

**Known current limitations:** the render path still uses 8-bit sRGB canvas pixels; the tone curve has three parametric anchors rather than a freehand point graph; HSL is a simplified eight-band sRGB mixer. These are an initial professional control layer, not Lightroom parity or a complete high-bit-depth RAW development engine.

**Next action:** complete the corrected Windows CI build; then test the new controls and decoder against actual EOS 600D CR2 samples. Preserve original files and recipes. Do not issue a production release until build and user validation have passed.

**Non-negotiable constraints:** never overwrite source photo bytes; preserve photo IDs, recipe history, metadata, job links and existing edited outputs; do not regress JRVS Property Finish/Smart Finish. Keep development on `desktop-transition`; do not touch `main`.

See `PHOTO_STUDIO_ROADMAP.md` for the development notes and subsequent engineering steps.
## Latest confirmed application functionality

The desktop branch's latest documented desktop release is **V0.53.0**.

### Photo editing
- JRVS Property Finish replaces the earlier Rental Auto Enhance workflow.
- Finishing approaches include Natural Listing, Bright Listing and Window-safe.
- Image luminance analysis informs restrained, per-image exposure/highlight adjustments and adaptive room-shadow recovery.
- Strong highlights are protected; automatic white balance, saturation, clarity and sharpening changes are avoided by Property Finish.
- Originals remain untouched; edits are saved as separate edited copies with non-destructive edit recipes.
- Smart Finish can analyse the other original photos in a property individually, using the current photo as a brightness reference. A failed photo is skipped without stopping the remaining photos.

See [V0.53.0 release notes](RELEASE_NOTES_V0.53.0.md).

### Desktop interface
- Premium dark desktop workspace with sage/lime accents and cream typography.
- Desktop dashboard, sidebar navigation, jobs and recent-property layouts received a visual redesign.
- Maintain the established JRVS brand direction. Do not redraw the logo or change the approved sage `#899B68` and cream `#F7F1DF` identity.
- Keep layouts compact and efficient, but do not sacrifice reachable content or usable controls to reduce scrolling.

### Local data and photo architecture
- Desktop is intended to be local-first and single-PC, with manual full-workspace backup/transfer rather than cloud sync.
- Tauri 2 provides the Windows desktop shell.
- Current compatibility storage retains complete `jrvs-data` and `jrvs-calendar` JSON payloads in SQLite rather than prematurely normalising business records.
- The existing photo UI still uses IndexedDB as its active working cache. Native managed copies of photo originals/previews are mirrored under the application workspace.
- Portable backup format version 2 uses `.jrvsbackup.gz` and includes SHA-256 checksums and byte-length validation for business/calendar data and photo assets. Version 1 imports remain supported.
- Source photos must be copied into the managed library; never move or delete the user's original source files.
- Preserve all legacy record IDs, job/quote/invoice number sequences, links, photo recipes, RAW bytes, previews and edited outputs.

## Important technical references

Read these when the task touches the relevant area:

| File | Purpose |
|---|---|
| `scripts/prepare-desktop.mjs` | Builds the desktop-only frontend snapshot and injects desktop configuration/version |
| `src-tauri/src/main.rs` | Native Tauri commands and desktop storage/backup bridge |
| `src-tauri/migrations/001_initial.sql` | SQLite schema |
| `src-tauri/tauri.conf.json` | Desktop app configuration, Windows bundle and updater public key |
| `package.json` | Desktop version and build scripts |
| `src-tauri/Cargo.toml` | Rust/Tauri package version and dependencies |
| `.github/workflows/desktop-shell-check.yml` | Windows build/test artifact workflow and gated signed-release flow |
| `.github/workflows/desktop-release.yml` | Tag-triggered signed release recovery workflow |
| `DESKTOP_MIGRATION_PLAN.md` | Architecture decisions and migration audit; some sections are historical |
| `DESKTOP_SETUP.md` | Windows setup, migration, backup and update instructions; check current code before relying on older passages |
| `docs/desktop/LOCAL_DATA_MODEL.md` | Current compatibility storage model and intended future schema |
| `docs/desktop/PHOTO_LIBRARY_SPEC.md` | Photo ownership and managed-library rules |
| `docs/desktop/BACKUP_FORMAT.md` | Portable backup format and integrity rules |
| `docs/desktop/LEGACY_IMPORT_SPEC.md` | Legacy browser/PWA export and import specification |

## Build and release rules

- Work on `desktop-transition` only for desktop features. Never commit desktop changes to `main`.
- Windows prerequisites and local commands are in `DESKTOP_SETUP.md`.
- Local commands: `npm install`, `npm run desktop:dev`, and `npm run desktop:build`.
- Continuity/version check: `npm run handover:check` (also runs in the Windows CI build).
- Every push to `desktop-transition` runs the Windows build workflow and uploads temporary installer artifacts when successful.
- A signed public desktop update is gated: the final intentional release commit must include `[release]` in its commit message, for example `[release] JRVS Desktop 0.54.0`.
- Before a release, bump the desktop version consistently in `package.json`, `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`. The build script takes the in-app version from `package.json`.
- Do not use `[release]` for ordinary development commits. Never rotate or replace the configured updater signing key as part of routine development.
- Only the current release's release notes belong in a release ZIP. Do not bundle previous versions' release notes.
- A successful compile is not proof of a safe migration, successful restore, real photo integrity, offline RAW development or upgrade behaviour. State exactly what was and was not tested.

## Outstanding release-readiness checks

These are not claims that the features are broken; they are verification areas that must be tested and recorded before describing the desktop app as production-ready:

- Confirm a successful current Windows CI build and test the generated installer on the user's PC.
- Run migration against a real browser export and compare business/calendar/photo counts, IDs, links and JOB/QUO/INV sequences.
- Verify original JPEGs, CR2/RAW files, previews, edited copies, cover selections and large-file behaviour.
- Complete a full backup → restore round trip on a separate test profile/PC and verify sample SHA-256 hashes and number sequences after restart.
- Verify restore rollback behaviour and recovery from interrupted or missing managed-photo copies.
- Confirm RAW development and all normal workflows offline before claiming full offline support; older architecture notes identify remote RAW-decoder/network dependencies.
- Test installer upgrades and the signed updater without deleting the stable browser/PWA data.

## Permanent working agreements

1. The user should not need to upload the application when the connected GitHub repository is accessible. Read and change the repository directly.
2. At the start of every new conversation, fetch the live `desktop-transition` head and read this file before coding. Never rely on an old chat summary for the latest version or commit.
3. Before substantial work, record the active task, intended files and next checkpoint here and commit that small handover update first. This protects against unexpected chat limits.
4. After each meaningful implementation/test milestone, update this file in the same commit where practical, or immediately afterwards. Keep the next action explicit.
5. Never claim an untested feature works. Distinguish implemented, built, CI-verified and user-tested.
6. Preserve existing functionality and user data. Avoid destructive migrations, clearing browser data, changing IDs or renumbering records.
7. Keep the interface compact, use in-app toasts and styled confirmation dialogs, and preserve the approved JRVS branding.
8. When a conversation ends unexpectedly, the next conversation must resume from this file and the latest GitHub commit without asking the user to reconstruct the history.

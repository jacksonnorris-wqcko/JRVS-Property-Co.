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

**User-approved scope:** make Photo Studio a high-end property/interior photography editor with a Lightroom-class ambition. Finance is out of scope.

**Current milestone:** desktop version remains `0.53.0` on `desktop-transition`; no production release has been published. The stable `main` PWA has not been modified.

**Implemented in source:**
- Pin FlashRaw `0.1.0` as a desktop dependency. The desktop preparation script copies the published browser entry, JavaScript modules, WASM variants and both upstream licence texts into `desktop-dist/vendor/flashraw`. Runtime import is local (`./vendor/flashraw/browser.js`), not esm.sh.
- RAW sensor decoding requests CPU SIMD, automatic demosaic, as-shot white balance, highlight reconstruction and sRGB output. Sensor-developed state is stored in recipe schema v4. Reopening a RAW-derived edit attempts to re-develop from the immutable original CR2; if the decoder falls back to the embedded camera JPEG, the user is warned and the recipe marker is cleared.
- Smart Finish attempts full-resolution sensor RAW development for RAW originals. It records any preview fallbacks in its completion notification and saves the proper RAW-developed marker per output.
- Added a three-anchor luminance tone curve (shadow, midtone, highlight) with a shared 256-entry LUT used in preview and full-resolution rendering. Curve anchors now align to exact 8-bit identity positions; neutral settings have been directly verified to be exactly identity.
- Added an eight-band HSL mixer for red, orange, yellow, green, aqua, blue, purple and magenta, each with hue, saturation and luminance controls. Per-degree colour adjustments are precomputed once per render rather than looping all channels for every pixel.
- Curve and HSL settings are saved in recipe schema v4; legacy schemas v1–v3 remain accepted. Settings participate in undo/redo and are restored when an edit is reopened.
- Preset batch editing resets advanced/retouch stages to a neutral preset state, saves a recipe per output and restores the editor state afterwards.
- Exact-look batch editing now saves a complete editable recipe with each output, preserves tone curve/HSL/retouch state, verifies the saved copy, and avoids trying to open RAW containers directly as browser images. RAW originals are handled separately by Smart Finish/full RAW development.
- Added `npm run photo:engine:check` to Windows CI. It tests RGB/HSL round trips, identity and monotonic curve behaviour, HSL band lookup, recipe compatibility and local FlashRaw bundle/license wiring.

**Verification evidence:**
- All 5 inline JavaScript scripts in `index.html` passed source syntax parsing after the current engine changes.
- Direct execution of the extracted colour/curve helpers passed: 11 RGB/HSL round-trip samples within tolerance; default curve is exact identity; a shaped curve is monotonic and changes the image; HSL orange adjustment peaks at its channel centre without leaking into green.
- Windows CI run `42954994274` passed the JRVS handover/version check and the Photo Studio engine regression check. The Windows installer build was still in progress at the time of this checkpoint. This status commit will be a new branch head and will trigger a fresh Windows CI run; check the latest run for final build status.
- A previous Windows attempt failed because the assumed package entry was incorrectly named `index.js`; the package uses `browser.js`. The copy/import paths and required WASM/license checks have since been corrected.
- **Not yet user-tested:** the new controls and RAW workflow in the installed Windows app.
- **Not yet verified:** EOS 600D CR2 compatibility, offline runtime with network disabled, RAW colour/highlight fidelity, large-file performance or true preview/export image-quality parity.

**Known engine limits:** the renderer still uses 8-bit sRGB canvas pixels; the tone curve is a three-anchor parametric luminance curve (not a freehand arbitrary RGB point graph); HSL is a simplified eight-band sRGB mixer. This is an initial pro Develop foundation, not full high-bit-depth RAW processing or Lightroom parity.

**Immediate next action:** monitor the latest Windows CI run for a successful build and installer artifact. If it passes, give the user the GitHub Actions artifact link and have them test real Canon EOS 600D CR2 files plus tone curve/HSL save/reopen/undo/redo/batch behaviour and offline decoding. Record the exact test outcomes. If CI fails, inspect the Windows job logs and fix the failing step before installing anything.

**Non-negotiable constraints:** never overwrite source photo bytes; preserve photo IDs, recipes, metadata, job links and existing edited outputs; do not regress JRVS Property Finish/Smart Finish. Keep all desktop development on `desktop-transition`; do not touch `main`. Do not mark offline RAW or image-quality parity as verified until tested on the user's PC. Do not publish a signed release until the user explicitly approves and the release version is intentionally advanced.

See `PHOTO_STUDIO_ROADMAP.md` for phase details and subsequent engineering steps.
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

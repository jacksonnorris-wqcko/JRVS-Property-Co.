# JRVS Property Co. — Live Project Status

> This is the durable handover for every JRVS development conversation. Read it at the start of a new chat, then verify the live GitHub branch and files before making changes. The repository is the source of truth for code; this file is the source of truth for the latest recorded work state and next action.

**Last reviewed:** 12 November 2026 (Australia/Sydney)  
**Repository:** [jacksonnorris-wqcko/JRVS-Property-Co.](https://github.com/jacksonnorris-wqcko/JRVS-Property-Co.)  
**Active desktop branch:** `desktop-transition`  
**Current desktop version:** `0.55.0`  
**Stable browser/PWA branch:** `main` — keep it unchanged unless the user explicitly requests browser/PWA work.

## Start here — current position

JRVS has two deliberately separate tracks:

- **Desktop:** Windows-first Tauri 2 application on `desktop-transition`. All current desktop development belongs here.
- **Browser/PWA:** stable application on `main`. This is the fallback and must not be overwritten by desktop work.

The desktop branch is independently versioned. The desktop version is defined in `package.json`, `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`. The desktop preparation script now reads `package.json` and injects that version into the generated desktop app. The inherited `index.html` source and root `version.json`/README may still show the stable PWA baseline version; do not mistake those inherited values for the desktop release version or change them just to make the desktop number match.

The desktop build now runs `npm run handover:check` before building. This validates that `package.json`, `Cargo.toml` and Tauri configuration agree, that this handover records the current desktop version/branch, and that the new-chat and continuity instructions are present. The check is wired into `.github/workflows/desktop-shell-check.yml`.

## V0.54.1 RAW demosaic hotfix — released 12 November 2026

- Active branch: `desktop-transition`; stable browser/PWA `main` remains untouched.
- V0.54.0 was successfully published as `desktop-v0.54.0` on 12 November 2026 (UTC 11 November 22:33), with signed NSIS and MSI installers, both signature files, and `latest.json`. GitHub Actions run `43110797157` completed successfully.
- User reported that the Photo Studio “Develop RAW” action failed with `unknown demosaic "auto" (expected bilinear or half-size)`.
- Root cause confirmed in `decodeRawToJpeg()`: half-size previews use the supported `half-size` value, but full-resolution development (`halfSize:false`) incorrectly selected `auto`. FlashRaw 0.1.0 accepts only `bilinear` or `half-size`.
- Hotfix changes full-resolution development to `bilinear` while retaining `half-size` for previews. Adds a regression assertion to prevent unsupported demosaic values from returning.
- Bump desktop version consistently to `0.54.1` in `package.json`, `src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json`. Keep V0.54.0 tagged release immutable.
- Existing photo source files, saved edits and recipe versions are unchanged. No data migration or destructive storage operation is involved.

**Outcome:** V0.54.1 was published successfully as `desktop-v0.54.1` on 12 November 2026 (UTC 11 November 23:10). Signed NSIS/MSI installers, signature files and `latest.json` are present. CI run `43115929060` passed both the Windows build and the signed publication job.

**User validation still required:** retry Develop RAW with a Canon EOS 600D CR2 and confirm full-resolution output/image quality. Do not claim CR2 runtime validation until user tests it.

## V0.54.2 quotes and invoices preview fix — 12 November 2026

- User testing in the installed Windows desktop app found a “Please allow pop-ups for this app to generate your PDF” message when using quote/invoice document output.
- Root cause confirmed in `printBusinessDocument()`: it used `window.open('', '_blank')` to create a second top-level window. The quote and invoice records themselves are created locally; the blocked action is the separate PDF preview/print window.
- Replace the popup with an in-app document preview panel using a local iframe. The user can review the quotation or invoice and select **Print / Save PDF** to open the Windows print dialog from the current app window.
- Add an automated handover regression check requiring the in-app iframe preview and forbidding popup use within quote/invoice document generation.
- Keep invoice numbering, quote links, document layout, logo, payment information, saved records and all user data unchanged. No data migration is required.
- Bump desktop version to `0.54.2` in all three desktop version files; publish with the normal signed updater workflow.

**Outcome:** V0.54.2 was published successfully with signed in-app quote/invoice preview; quote and invoice records, numbering and document content remain unchanged.

## V0.55.0 Photo Studio 2.0 — Phase 1 workstation redesign — 12 November 2026

- Current task: replace the narrow, tabbed Photo Studio control column with a dedicated editing workstation while retaining the existing processing engine and recipe model.
- Three-zone desktop layout: workspace rail, large image stage and contextual right inspector; persistent project filmstrip beneath the workspace.
- Direct canvas toolbar launches existing local brush mask, Clone and Heal tools, plus rotate and geometry reset actions.
- Develop now contains Property Finish, quick-look buttons, tone/lighting controls and histogram. Colour, Detail, Geometry, Masks, Retouch and Export each have separate focused workspaces and contextual headings.
- Removed the duplicate in-panel history row in favour of the established top toolbar; preserved keyboard shortcuts, before/after compare, RAW develop and Save Copy.
- No image renderer, edit recipe schema, original photo bytes, photo record IDs or business data are migrated or replaced.

**Immediate next action:** run handover/version checks, Photo Studio regression checks and the Windows Tauri build; verify Phase 1 workspace structure and tool wiring in CI, then publish signed `desktop-v0.55.0`.

## Current active work and next action

### Current app task — Photo Studio 2.0 Phase 2 processing-engine rebuild

**Active scope:** move the editor's RAW development and shared render path beyond the current 8-bit sRGB/JPEG intermediate. Keep Phase 1's workstation and all existing photo workflows intact.

**Planned implementation layers:**
- Upgrade the pinned FlashRaw dependency to the current compatible release and use sensor-aware, higher-quality demosaicing plus the decoder's linear high-bit-depth output.
- Retain the decoded linear RAW frame in memory while editing; do not convert the RAW source to an intermediate JPEG before adjustments.
- Apply the core RAW develop operations in a linear-light, high-precision path, with a deliberate sRGB display/export conversion at the output boundary.
- Keep orientation, geometry, existing masks/retouch, Property Finish, preview/export parity and non-destructive recipe restore coherent.
- Add regression coverage for linear-light math, orientation mapping, high-precision input, renderer dispatch, and existing recipe compatibility.

**Intended files:** `index.html`, `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `scripts/check-photo-studio-engine.mjs`, `PHOTO_STUDIO_ROADMAP.md`, versioned release notes and this handover.

**Safety:** preserve source RAW/JPEG bytes, records, IDs, job links and existing recipe schema; no destructive migration. Phase 2 build/CI results will not be described as proof of EOS 600D camera-quality parity until tested with the user's actual CR2 files.

**Next checkpoint:** validate the existing FlashRaw 0.1.0 → target API change, implement and regression-test the linear RAW path, then run the Windows installer and signed updater workflow.

### Application task — shared scrolling fix verified

The shared desktop scrolling fix was committed on 11 November 2026:

- **Commit:** `798542fa80e0f2cae02cf0f49b68c59c38091cbd`
- **Message:** `Fix shared desktop vertical scrolling across all workspace tabs`
- **File changed:** `scripts/prepare-desktop.mjs`
- **Implementation:** desktop document/body are viewport-locked; the desktop shell is a fixed-height grid; the main workspace and sidebar have their own vertical scroll areas; active page content remains naturally sized and visible.

**Status:** user-confirmed working in the Windows desktop app on 11 November 2026. The current Windows CI build also completed successfully for the handover commit `f40d221a2305c015a404adfbf169272ff0d7c37f`. CI confirms the project check, Windows installer build, output verification and artifact upload; it is not a substitute for the user's runtime test.

**User test result:** user reported "alright it works" after testing the build. Treat the shared scrolling issue as closed unless a specific page/control is later reported as still clipped.

### JRVS Photo Studio V0.54.0 — Phase 3, Phase 4 and Phase 5 (released; features carried forward)

**User-approved scope:** add local brush masks, projective architectural geometry/manual lens correction, and separate Clone/Heal retouch, then publish the next signed Windows desktop updater.

**Release:** V0.54.0 is published as `desktop-v0.54.0`; CI run `43110797157` passed the Windows build, installer verification, updater signing and GitHub publication. Stable browser/PWA `main` remains untouched.

**Implemented:**
- Phase 3: dedicated Masks workspace; up to 12 masks, additive/subtractive brush strokes, flow, feather, enable/disable/invert, select/clear/delete, live brush outline and selected-mask overlay. Per-mask exposure, highlights, shadows, temperature and saturation. Mask data is saved in recipe schema v5; recipes v1–v4 remain supported. Mask state participates in undo/redo and the shared preview/full-resolution renderer.
- Phase 4: replaces affine shear with projective homography for vertical/horizontal keystone correction. Adds manual radial lens-distortion correction and geometry reset. Neutral settings retain source centre crop; the same render path is used for preview and full-size export. No automatic camera/lens profiles.
- Phase 5: Clone copies sampled source pixels. Heal uses sampled texture with local source/destination colour and luminance matching and feathered blending. Retouch strokes are non-destructive, recipe-backed and included in preview/export. This is not AI or content-aware reconstruction.
- Preserved Phase 1–2: locally bundled FlashRaw 0.1.0, tone curve, eight-band HSL, recipe compatibility, JRVS Property Finish and Smart Finish.
- Batch presets isolate per-photo mask/retouch/advanced state; editor state restores afterwards. Exact-look batch outputs retain editable recipes.
- Added regression coverage for colour/HSL, tone curve, projective geometry identity/corners/inverse, lens bounds, mask feathering/normalisation/limits, Clone versus Heal and recipe compatibility.

**Verification at V0.54.0 release:**
- All five inline application JavaScript scripts parsed without syntax errors.
- Direct helper checks passed for projective identity/corner/inverse mapping, lens bounds, mask feathering/normalisation limits and distinct Clone/Heal blends.
- Windows CI run 42992339544 passed handover/version validation and Photo Studio regression checks, but its installer build was cancelled by subsequent commits. This release commit starts a fresh Windows build and signed updater job.
- **Still not user-verified:** EOS 600D CR2 sensor development on the user's PC, complete offline workflows, large-file/image-quality tuning, or an installed-app in-place upgrade on the user's Windows profile. The V0.54.1 patch corrected the confirmed invalid demosaic option in the full-resolution path.

**Known limits:** masks are manual, not semantic AI selections; lens correction is manual without camera profiles; Heal is sampled patch matching, not generative repair; the renderer remains an 8-bit sRGB canvas. No Lightroom or camera-quality parity claim.

**V0.54.1 status:** supported demosaic options passed CI and the signed patch is published. Full-resolution EOS 600D CR2 output still needs user validation.

**Non-negotiables:** preserve source bytes, IDs, metadata, job links and existing edits; no destructive recipe migrations; keep Property Finish/Smart Finish and prior controls; develop only on `desktop-transition`; never touch `main`.
## Latest confirmed application functionality

The desktop branch's latest completed release is **V0.54.2**. V0.54.1 fixed the RAW demosaic setting; V0.54.2 added in-app quote/invoice PDF preview; V0.55.0 introduces Photo Studio 2.0 Phase 1.

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

### V0.54.1 CI runner recovery — 12 November 2026

- First hotfix validation run `43113993364` passed handover/version checks and Photo Studio regression tests, then stalled in `Build Windows installers` from 11 November 2026 22:43:07 UTC; it remained in progress with no installer artifact in later checks.
- The job is configured with a 45-minute timeout, but GitHub did not report a timeout or finish the job. A fresh ordinary push will use the workflow's replaceable check concurrency group to supersede the stalled runner.
- Recovery run `43114715262` completed successfully: handover/version checks, Photo Studio regression checks, Windows installer build, installer verification and artifact upload all passed. The ordinary commit correctly skipped publication because it was not the intentional release commit.
- V0.54.1 was subsequently published successfully through the signed release workflow (run `43115929060`). The V0.54.2 desktop document-preview fix is the new active patch. Existing releases remain immutable and stable `main` remains untouched.

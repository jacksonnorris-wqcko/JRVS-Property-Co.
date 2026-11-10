# JRVS Desktop — Managed Photo Library Specification

## Confirmed decision

JRVS Desktop will use an application-managed photo library. When a user imports a photo from a camera card, downloads folder or other location, the app copies the file into its own library. It never moves or deletes the original source file.

This avoids broken links when a card is formatted, a folder is moved, or the business is transferred to another PC.

## Proposed Windows layout

Use Tauri's application data directory, resolved at runtime (never hard-code a username or drive letter):

```text
<app-data>/JRVS Property Co/
  workspace/
    jrvs.sqlite
    photos/
      originals/
        <photo-id>.<extension>
      previews/
        <photo-id>.jpg
      edited/
        <photo-id>.<extension>
      staging/
    backups/
    logs/
```

The actual app-data path must be obtained through Tauri's path API. The app should expose a user-friendly **Open JRVS Data Folder** action in Settings.

## Import behaviour

- Copy into a staging file first, then hash and verify.
- Rename the managed file using stable photo ID, not user filename, to avoid collisions.
- Preserve original filename and extension in metadata.
- Preserve RAW files byte-for-byte.
- Generate/retain a preview as a separate asset.
- Promote staged file only after verification and database transaction readiness.
- Do not use temporary browser object URLs as persisted file paths.

## Edited images and recipes

- Original source files are immutable.
- Each edited output is a separate asset with its own photo ID.
- Preserve `sourcePhotoId`, `editRecipe` and `editRecipeVersion`.
- The rendered edited image remains available even if the source RAW decoder or recipe renderer is unavailable.
- Do not rewrite existing flattened edited images as recipes.

## RAW support

The current app dynamically imports FlashRaw 0.1.0 from esm.sh. Desktop must package a pinned local copy and its required WebAssembly assets; RAW development must not depend on first-use internet access. Preserve the current embedded-JPEG preview fallback and label it honestly when used.

Before declaring RAW desktop support complete, validate at least:
- the user's Canon EOS 600D CR2 sample;
- import preview and full-resolution development;
- colour, exposure, white balance and highlight behaviour;
- export dimensions and metadata;
- offline startup and offline RAW development.

The existing photo studio roadmap explicitly notes that the prior CR2 fallback could use embedded camera JPEG previews and that RAW decoder output needs validation against actual camera files. Do not claim equivalence based only on a successful import.

## Integrity and recovery

- On startup or on-demand, compare every photo metadata path with the filesystem.
- Missing assets are shown as missing; do not delete their metadata.
- Unreferenced files are quarantined/reported before cleanup, never immediately purged.
- Photo deletion uses a staged trash/quarantine path and a database transaction so failures can be rolled back.
- A full backup includes every referenced original, preview and edited asset.

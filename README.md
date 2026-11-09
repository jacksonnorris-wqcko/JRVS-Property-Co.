# JRVS Property Co. — V0.41.2

PC-first property photography and business workflow app for JRVS Property Co.

## V0.41.2 — Experimental native RAW development

- Adds FlashRaw WebAssembly sensor decoding for supported RAW files, including Canon CR2.
- RAW photo previews attempt a half-size sensor decode; opening a RAW file in the editor performs a full-resolution sensor decode.
- The editor reports `RAW sensor developed` when the sensor pipeline succeeds, or clearly reports `Embedded JPEG fallback` and the reason when it does not.
- The original CR2 remains untouched. The developed image is passed into the existing V0.40.1 editing and enhancement workflow; exported edits remain separate copies.
- FlashRaw is dynamically loaded from esm.sh on first use. Internet is required for first load; the service worker attempts to cache successful decoder assets for later/offline use.

## Compatibility and safeguards

- Existing JPEG imports and the V0.40.1 JPEG enhancement pipeline remain unchanged.
- Existing jobs, clients, quotes, invoices, packages, calendar, photo library and IndexedDB schemas are preserved.
- No localStorage keys, Supabase schema or saved-photo records are reset or migrated.
- If RAW sensor decoding is unavailable or fails, the app uses the embedded JPEG preview as a compatibility fallback and labels it clearly. This fallback is not sensor-level RAW processing.

## Test checklist

1. Deploy the full ZIP contents to the GitHub repository root.
2. Open the app online once and check version `0.41.2`.
3. Import the same EOS 600D CR2 used for previous comparisons.
4. Open it in Photo Studio and confirm the status says `RAW sensor developed`.
5. If it reports `Embedded JPEG fallback`, send the exact reason shown in the editor status.
6. Compare the RAW-developed result against V0.40.1 and the original editor benchmark.

Full-resolution RAW decoding can use substantial browser memory. The first decoder load requires internet access.

## Deployment

Extract the ZIP and upload its contents into the root of the existing GitHub repository, replacing matching files. Commit and allow GitHub Pages to publish. Do not delete browser storage or IndexedDB databases to force the update.
